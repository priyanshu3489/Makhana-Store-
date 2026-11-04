import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { shiprocketRequest, shiprocketConfigured } from "@/lib/shiprocket";

export const runtime = "nodejs";

type ShiprocketResult = {
  awb_code?: string;
  courier_name?: string;
  response?: { data?: { awb_code?: string; courier_name?: string } };
  response_message?: string;
  message?: string;
  pickup_status?: string | { status?: string; message?: string };
  status?: string;
};

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!shiprocketConfigured()) return NextResponse.json({ error: "Shiprocket is not configured. Add the API user credentials to your local .env file." }, { status: 503 });

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (!order.shiprocketShipmentId) return NextResponse.json({ error: "Create the Shiprocket order before dispatching it." }, { status: 409 });
  if (order.status === "CANCELLED" || order.status === "DELIVERED") return NextResponse.json({ error: "Cancelled or delivered orders cannot be dispatched." }, { status: 409 });

  let input: { action?: string; pickupDate?: string } = {};
  try { input = await req.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }

  try {
    if (input.action === "assign_awb") {
      if (order.shippingAwbCode) return NextResponse.json({ error: "An AWB is already assigned to this shipment.", awb: order.shippingAwbCode }, { status: 409 });
      const result = await shiprocketRequest<ShiprocketResult>("/courier/assign/awb", {
        method: "POST",
        body: JSON.stringify({ shipment_id: Number(order.shiprocketShipmentId) }),
      });
      const awb = result.awb_code || result.response?.data?.awb_code;
      const courier = result.courier_name || result.response?.data?.courier_name;
      if (!awb) return NextResponse.json({ error: result.response_message || result.message || "Shiprocket did not return an AWB. Check courier serviceability in your Shiprocket account." }, { status: 502 });
      const updated = await prisma.order.update({
        where: { id },
        data: {
          shippingAwbCode: String(awb),
          shippingCourierName: courier ? String(courier) : null,
          shippingStatus: "AWB assigned",
          shippingStatusUpdatedAt: new Date(),
        },
        select: { id: true, shiprocketShipmentId: true, shippingAwbCode: true, shippingCourierName: true, shippingStatus: true },
      });
      return NextResponse.json({ ok: true, shipment: updated });
    }

    if (input.action === "schedule_pickup") {
      if (!order.shippingAwbCode) return NextResponse.json({ error: "Assign an AWB before scheduling pickup." }, { status: 409 });
      const body: { shipment_id: number; pickup_date?: string[] } = { shipment_id: Number(order.shiprocketShipmentId) };
      if (input.pickupDate) {
        if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(input.pickupDate)) return NextResponse.json({ error: "Pickup date must use YYYY-MM-DD format." }, { status: 400 });
        body.pickup_date = [input.pickupDate];
      }
      const result = await shiprocketRequest<ShiprocketResult>("/courier/generate/pickup", {
        method: "POST",
        body: JSON.stringify(body),
      });
      const pickup = typeof result.pickup_status === "string" ? result.pickup_status : result.pickup_status?.status || result.status || "Pickup requested";
      const updated = await prisma.order.update({
        where: { id },
        data: { shippingStatus: String(pickup).slice(0, 120), shippingStatusUpdatedAt: new Date() },
        select: { id: true, shippingAwbCode: true, shippingCourierName: true, shippingStatus: true },
      });
      return NextResponse.json({ ok: true, shipment: updated, message: result.response_message || result.message || null });
    }

    return NextResponse.json({ error: "Unsupported Shiprocket action." }, { status: 400 });
  } catch (error) {
    console.error("shiprocket_dispatch_error", error);
    const message = error instanceof Error && error.message !== "SHIPROCKET_AUTH_FAILED"
      ? error.message
      : error instanceof Error ? "Shiprocket login failed. Check your API user credentials." : "Shiprocket request failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
