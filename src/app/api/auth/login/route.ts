import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

const schema = z.object({
  email: z.string().email().transform((email) => email.toLowerCase().trim()),
  password: z.string().min(1).max(128),
});

export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (
      !user ||
      !(await bcrypt.compare(parsed.data.password, user.passwordHash))
    ) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    await createSession(user.id);

    return NextResponse.json({
      ok: true,
      role: user.role,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not sign in." },
      { status: 500 }
    );
  }
}