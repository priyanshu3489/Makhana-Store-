import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const schema = z.object({
  orderNumber: z.string().trim().regex(/^[1-9]\d{0,8}$/),
  email: z.string().trim().email().max(254).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Enter a valid order number." }, { status: 400 });
    }

    const user = await getCurrentUser();
    const email = parsed.data.email?.toLowerCase();
    if (!user && !email) {
      return NextResponse.json({ error: "Enter the checkout email, or sign in to track your order." }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        customerOrderNumber: Number(parsed.data.orderNumber),
        ...(user
          ? { userId: user.id }
          : { email }),
      },
      select: {
        customerOrderNumber: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
        updatedAt: true,
        shippingStatus: true,
        shippingStatusUpdatedAt: true,
        shippingAwbCode: true,
        shippingCourierName: true,
        shippingTrackingUrl: true,
        items: { select: { productName: true, quantity: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "We couldn't find an order matching those details. Check the number and checkout email, or sign in to view your orders." }, { status: 404 });
    }

    return NextResponse.json({
      order: {
        orderNumber: order.customerOrderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        shipping: {
          status: order.shippingStatus,
          updatedAt: order.shippingStatusUpdatedAt?.toISOString() || null,
          awb: order.shippingAwbCode,
          courier: order.shippingCourierName,
          trackingUrl: order.shippingTrackingUrl,
        },
        items: order.items.map(item => ({ name: item.productName, quantity: item.quantity })),
      },
    });
  } catch (error) {
    // Keep the customer-facing response generic; log the underlying failure for diagnosis.
    console.error("[order_tracking_error]", error);

    const message = error instanceof Error ? error.message : String(error);
    const isDatabaseError =
      /prisma|database|connection|connect|query engine|prepared statement/i.test(message);

    return NextResponse.json(
      {
        error: isDatabaseError
          ? "We couldn't connect to the order service. Please try again in a moment. If the problem continues, contact store support."
          : "We couldn't load this order right now. Please try again.",
      },
      { status: isDatabaseError ? 503 : 500 },
    );
  }
}
