import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE = "makhana_session";
function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters");
  return new TextEncoder().encode(value);
}
export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret());
  (await cookies()).set(COOKIE, token, { httpOnly:true, secure:process.env.NODE_ENV === "production", sameSite:"lax", path:"/", maxAge:60*60*24*7 });
}
export async function clearSession() { (await cookies()).delete(COOKIE); }
export async function getCurrentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return await prisma.user.findUnique({ where:{id:payload.sub}, select:{id:true,name:true,email:true,phone:true,role:true} });
  } catch { return null; }
}
export async function requireAdmin() {
  const user = await getCurrentUser();
  return user?.role === "ADMIN" ? user : null;
}
