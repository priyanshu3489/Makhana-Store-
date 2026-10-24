import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { razorpayClient } from "@/lib/razorpay";
import type { Prisma } from "@prisma/client";

const schema = z.object({
  customerName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number."),
  address: z.string().trim().min(5).max(300),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  postalCode: z
    .string()
    .trim()
    .regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit Indian PIN code."),
  notes: z.string().max(500).optional(),
  couponCode: z.string().trim().max(40).optional(),
  paymentMethod: z.enum(["RAZORPAY", "COD"]),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1)
    .max(30),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Sign in before checkout." },
      { status: 401 }
    );
  }

  try {
    const parsed = schema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Check your delivery details and basket." },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const qty = new Map<string, number>();

    for (const item of d.items) {
      qty.set(
        item.productId,
        (qty.get(item.productId) || 0) + item.quantity
      );
    }

    if ([...qty.values()].some((q) => q > 20)) {
      return NextResponse.json(
        { error: "Maximum 20 units per product." },
        { status: 400 }
      );
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: [...qty.keys()] },
        active: true,
      },
    });

    if (products.length !== qty.size) {
      return NextResponse.json(
        { error: "A product is unavailable. Refresh your basket." },
        { status: 409 }
      );
    }

    for (const p of products) {
      if (p.stock < (qty.get(p.id) || 0)) {
        return NextResponse.json(
          { error: `Not enough stock for ${p.name}.` },
          { status: 409 }
        );
      }
    }

    const subtotal = products.reduce(
      (sum, p) => sum + p.pricePaise * (qty.get(p.id) || 0),
      0
    );

    let discount = 0;
    let couponCode: string | undefined;

    if (d.couponCode) {
      const c = await prisma.coupon.findUnique({
        where: { code: d.couponCode.toUpperCase() },
      });

      const now = new Date();

      if (
        !c ||
        !c.active ||
        (c.startsAt && c.startsAt > now) ||
        (c.expiresAt && c.expiresAt < now) ||
        (c.usageLimit !== null && c.usedCount >= c.usageLimit) ||
        subtotal < c.minSubtotalPaise
      ) {
        return NextResponse.json(
          { error: "Coupon is invalid or does not meet its conditions." },
          { status: 400 }
        );
      }

      discount =
        c.discountType === "PERCENT"
          ? Math.floor((subtotal * c.discountValue) / 100)
          : c.discountValue;

      if (c.maxDiscountPaise !== null) {
        discount = Math.min(discount, c.maxDiscountPaise);
      }

      discount = Math.min(discount, subtotal);
      couponCode = c.code;
    }

    const shipping = subtotal - discount >= 49900 ? 0 : 5000;
    const total = subtotal - discount + shipping;

    if (total <= 0 || total > 100000000) {
      return NextResponse.json(
        { error: "Invalid order total." },
        { status: 400 }
      );
    }

    const order = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Serialize order-number allocation for this customer.
        await tx.$executeRaw`
          SELECT pg_advisory_xact_lock(
            hashtextextended(${user.id}, 0)
          )
        `;

        // Start each customer's order sequence at 1.
        const lastCustomerOrder = await tx.order.findFirst({
          where: { userId: user.id },
          orderBy: { customerOrderNumber: "desc" },
          select: { customerOrderNumber: true },
        });

        const customerOrderNumber =
          (lastCustomerOrder?.customerOrderNumber ?? 0) + 1;

        // Reserve stock safely.
        for (const [productId, quantity] of qty) {
          const changed = await tx.product.updateMany({
            where: {
              id: productId,
              active: true,
              stock: { gte: quantity },
            },
            data: {
              stock: { decrement: quantity },
            },
          });

          if (changed.count !== 1) {
            throw new Error("STOCK_CHANGED");
          }
        }

        // Validate and increment coupon usage.
        if (couponCode) {
          const c = await tx.coupon.findUnique({
            where: { code: couponCode },
          });

          if (
            !c ||
            !c.active ||
            (c.usageLimit !== null && c.usedCount >= c.usageLimit)
          ) {
            throw new Error("COUPON_CHANGED");
          }

          await tx.coupon.update({
            where: { id: c.id },
            data: { usedCount: { increment: 1 } },
          });
        }

        return tx.order.create({
          data: {
            userId: user.id,
            customerOrderNumber,

            customerName: d.customerName,
            email: d.email.toLowerCase(),
            phone: d.phone,
            address: d.address,
            city: d.city,
            state: d.state,
            postalCode: d.postalCode,
            notes: d.notes || null,

            subtotalPaise: subtotal,
            discountPaise: discount,
            shippingPaise: shipping,
            totalPaise: total,
            couponCode,

            paymentMethod: d.paymentMethod,
            status: d.paymentMethod === "COD" ? "CONFIRMED" : "PENDING",
            paymentStatus:
              d.paymentMethod === "COD" ? "COD_PENDING" : "PENDING",

            items: {
              create: products.map((p) => ({
                productId: p.id,
                productName: p.name,
                unitPricePaise: p.pricePaise,
                quantity: qty.get(p.id)!,
              })),
            },
          },
        });
      },
      {
        isolationLevel: "Serializable",
      }
    );

    // Return the customer-facing number for COD.
    if (d.paymentMethod === "COD") {
      return NextResponse.json({
        orderId: order.id,
        customerOrderNumber: order.customerOrderNumber,
        method: "COD",
      });
    }

    // Create the Razorpay payment order.
    try {
      const rp = await razorpayClient().orders.create({
        amount: total,
        currency: "INR",
        receipt: order.id.slice(0, 40),
        notes: {
          internalOrderId: order.id,
        },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { razorpayOrderId: rp.id },
      });

      return NextResponse.json({
        orderId: order.id,
        customerOrderNumber: order.customerOrderNumber,
        razorpayOrderId: rp.id,
        amount: total,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    } catch {
      // Restore stock if Razorpay order creation fails.
      await prisma.$transaction(async (tx) => {
        const current = await tx.order.findUnique({
          where: { id: order.id },
          include: { items: true },
        });

        if (current && !current.stockRestored) {
          for (const item of current.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }

          await tx.order.update({
            where: { id: order.id },
            data: {
              status: "PAYMENT_FAILED",
              paymentStatus: "FAILED",
              stockRestored: true,
            },
          });
        }
      });

      return NextResponse.json(
        { error: "Could not start payment. Please retry checkout." },
        { status: 502 }
      );
    }
  } catch (e) {
    if (e instanceof Error && e.message === "STOCK_CHANGED") {
      return NextResponse.json(
        { error: "Stock changed during checkout. Refresh your basket." },
        { status: 409 }
      );
    }

    if (e instanceof Error && e.message === "COUPON_CHANGED") {
      return NextResponse.json(
        {
          error: "Coupon usage limit was reached. Remove the coupon and retry.",
        },
        { status: 409 }
      );
    }

    console.error("checkout_error", e);

    return NextResponse.json(
      { error: "Could not create order. Please try again." },
      { status: 500 }
    );
  }
}