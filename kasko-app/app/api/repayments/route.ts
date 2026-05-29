import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, fail } from "@/lib/api";
import { userIdFromRequest } from "@/lib/auth";
import { repayLoan, DomainError } from "@/lib/services";

export async function POST(req: NextRequest) {
  const uid = await userIdFromRequest(req);
  if (!uid) return fail("Not authenticated", "UNAUTHENTICATED", 401);
  try {
    const { method } = await req.json();
    const m = (["upi", "auto_debit", "qr"].includes(method) ? method : "upi") as "upi" | "auto_debit" | "qr";
    const result = await repayLoan(prisma, uid, m);
    return ok(result);
  } catch (e) {
    if (e instanceof DomainError) return fail(e.message, e.code, 400);
    console.error(e);
    return fail("Repayment failed", "INTERNAL", 500);
  }
}
