import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const schema = z.object({
  code: z.string().trim().min(3).max(40).regex(/^[a-zA-Z0-9_-]+$/),
  discountType: z.enum(["PERCENT", "FIXED"]),
  discountValue: z.number().int().positive(),
  minSubtotalPaise: z.number().int().min(0).default(0),
  maxDiscountPaise: z.number().int().positive().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  startsAt: z.string().datetime().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  active: z.boolean().default(true),
});

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }));
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid coupon data. Check the values and dates." }, { status: 400 });
  const d = parsed.data;
  if (d.discountType === "PERCENT" && d.discountValue > 100) return NextResponse.json({ error: "Percent discount cannot exceed 100" }, { status: 400 });
  if (d.startsAt && d.expiresAt && new Date(d.startsAt) >= new Date(d.expiresAt)) return NextResponse.json({ error: "Expiry must be after the start date." }, { status: 400 });
  try {
    const coupon = await prisma.coupon.create({ data: {
      code: d.code.toUpperCase(), discountType: d.discountType, discountValue: d.discountValue,
      minSubtotalPaise: d.minSubtotalPaise, maxDiscountPaise: d.maxDiscountPaise ?? null,
      usageLimit: d.usageLimit ?? null, startsAt: d.startsAt ? new Date(d.startsAt) : null,
      expiresAt: d.expiresAt ? new Date(d.expiresAt) : null, active: d.active,
    } });
    return NextResponse.json(coupon, { status: 201 });
  } catch { return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 }); }
}

export async function PATCH(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }
  const parsed = z.object({ id: z.string().min(1), active: z.boolean() }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid coupon update." }, { status: 400 });
  const exists = await prisma.coupon.findUnique({ where: { id: parsed.data.id }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
  return NextResponse.json(await prisma.coupon.update({ where: { id: parsed.data.id }, data: { active: parsed.data.active } }));
}
