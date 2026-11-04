import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.SHIPROCKET_WEBHOOK_TOKEN;
  if (!secret) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  const supplied = req.headers.get("x-api-key") || "";
  const expected = Buffer.from(secret);
  const actual = Buffer.from(supplied);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const awb = String(body?.awb || body?.awb_code || "").trim();
    const shipmentId = String(body?.shipment_id || "").trim();
    const status = String(body?.current_status || body?.status || body?.shipment_status || "").trim();
    const courier = String(body?.courier_name || body?.courier || "").trim();
    const trackingUrl = String(body?.tracking_url || body?.track_url || "").trim();
    if ((!awb && !shipmentId) || !status) {
      return NextResponse.json({ error: "Missing shipment identifier or status." }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(awb ? [{ shippingAwbCode: awb }] : []),
          ...(shipmentId ? [{ shiprocketShipmentId: shipmentId }] : []),
        ],
      },
    });
    if (!order) return NextResponse.json({ received: true, matched: false });

    const normalized = status.toLowerCase();
    const orderStatus =
      normalized.includes("deliver") ? "DELIVERED" :
      normalized.includes("cancel") ? "CANCELLED" :
      normalized.includes("ship") || normalized.includes("transit") || normalized.includes("out for delivery") ? "SHIPPED" :
      undefined;

    await prisma.order.update({
      where: { id: order.id },
      data: {
        shippingStatus: status.slice(0, 120),
        shippingStatusUpdatedAt: new Date(),
        ...(awb && !order.shippingAwbCode ? { shippingAwbCode: awb } : {}),
        ...(courier ? { shippingCourierName: courier.slice(0, 120) } : {}),
        ...(trackingUrl && /^https:\\/\\//i.test(trackingUrl) ? { shippingTrackingUrl: trackingUrl } : {}),
        ...(orderStatus ? { status: orderStatus } : {}),
      },
    });
    return NextResponse.json({ received: true, matched: true });
  } catch (error) {
    console.error("shiprocket_webhook_error", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
