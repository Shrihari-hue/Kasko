import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, fail } from "@/lib/api";
import { requestOtp, DomainError } from "@/lib/services";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    const res = await requestOtp(prisma, String(phone ?? ""));
    return ok(res);
  } catch (e) {
    if (e instanceof DomainError) return fail(e.message, e.code, 400);
    console.error(e);
    return fail("Could not send code", "INTERNAL", 500);
  }
}
