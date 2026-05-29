import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fail } from "@/lib/api";
import { verifyOtp, DomainError } from "@/lib/services";
import { createSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();
    const user = await verifyOtp(prisma, String(phone ?? ""), String(code ?? ""));
    const token = await createSession(user.id);
    // `token` is also returned in the body so native (no-cookie) clients can
    // store it and send it as `Authorization: Bearer <token>`.
    const res = NextResponse.json({ ok: true, data: { id: user.id, phone: user.phone, kycComplete: user.kycComplete, limit: user.limit, token } });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true, sameSite: "lax", path: "/",
      secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (e) {
    if (e instanceof DomainError) return fail(e.message, e.code, 400);
    console.error(e);
    return fail("Verification failed", "INTERNAL", 500);
  }
}
