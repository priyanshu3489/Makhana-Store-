import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { shiprocketRequest, shiprocketConfigured } from "@/lib/shiprocket";

export const runtime = "nodejs";

type CreateResponse = {
  order_id?: number;
  shipment_id?: number;
  status?: string;
  message?: string;
};

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!shiprocketConfigured()) {
    return NextResponse.json({ error: "Shiprocket is not configured. Add SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD to .env.local." }, { status: 503 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.paymentMethod !== "COD" && order.paymentStatus !== "PAID") {
    return NextResponse.json({ error: "Only paid online orders or COD orders can be sent to Shiprocket." }, { status: 409 });
  }
  if (order.status === "CANCELLED" || order.status === "DELIVERED") {
    return NextResponse.json({ error: "Cancelled or delivered orders cannot be dispatched." }, { status: 409 });
  }
  if (order.shiprocketOrderId) {
    return NextResponse.json({ error: "A Shiprocket order already exists for this order.", shiprocketOrderId: order.shiprocketOrderId }, { status: 409 });
  }

  const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION;
  if (!pickupLocation) return NextResponse.json({ error: "Set SHIPROCKET_PICKUP_LOCATION in .env.local." }, { status: 503 });

  try {
    const payload = {
      order_id: String(order.orderNumber),
      order_date: order.createdAt.toISOString().slice(0, 10),
      pickup_location: pickupLocation,
      billing_customer_name: order.customerName,
      billing_last_name: "",
      billing_address: order.address,
      billing_city: order.city,
      billing_state: order.state,
      billing_pincode: order.postalCode,
      billing_country: "India",
      billing_email: order.email,
      billing_phone: order.phone,
      shipping_is_billing: true,
      order_items: order.items.map((item) => ({
        name: item.productName,
        sku: item.productId,
        units: item.quantity,
        selling_price: item.unitPricePaise / 100,
        discount: 0,
        tax: 0,
        hsn: "",
      })),
      payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",
      shipping_charges: order.shippingPaise / 100,
      total_discount: order.discountPaise / 100,
      sub_total: order.subtotalPaise / 100,
      length: Number(process.env.SHIPROCKET_PACKAGE_LENGTH_CM || 20),
      breadth: Number(process.env.SHIPROCKET_PACKAGE_BREADTH_CM || 15),
      height: Number(process.env.SHIPROCKET_PACKAGE_HEIGHT_CM || 10),
      weight: Number(process.env.SHIPROCKET_PACKAGE_WEIGHT_KG || 0.5),
    };

    const result = await shiprocketRequest<CreateResponse>("/orders/create/adhoc", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!result.order_id || !result.shipment_id) {
      return NextResponse.json({ error: result.message || "Shiprocket did not return shipment identifiers." }, { status: 502 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        shiprocketOrderId: String(result.order_id),
        shiprocketShipmentId: String(result.shipment_id),
        shippingStatus: result.status || "Order created",
        shippingStatusUpdatedAt: new Date(),
      },
      select: { id: true, orderNumber: true, shiprocketOrderId: true, shiprocketShipmentId: true, shippingStatus: true },
    });
    return NextResponse.json({ ok: true, shipment: updated }, { status: 201 });
  } catch (error) {
    console.error("shiprocket_create_error", error);
    const message = error instanceof Error && error.message === "SHIPROCKET_AUTH_FAILED"
      ? "Shiprocket login failed. Check the account email and password."
      : "Could not create the Shiprocket shipment. Check server logs and Shiprocket dashboard.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
