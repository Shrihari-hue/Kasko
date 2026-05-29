import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, fail } from "@/lib/api";
import { userIdFromRequest } from "@/lib/auth";
import { submitKycStep, DomainError } from "@/lib/services";

const STEPS = ["pan", "aadhaar", "selfie", "bank"] as const;

export async function GET(req: Request) {
  const uid = await userIdFromRequest(req);
  if (!uid) return fail("Not authenticated", "UNAUTHENTICATED", 401);
  const records = await prisma.kycRecord.findMany({ where: { userId: uid } });
  const done = records.filter((r) => r.status === "verified").map((r) => r.step);
  return ok({ completedSteps: done, kycComplete: STEPS.every((s) => done.includes(s)) });
}

export async function POST(req: NextRequest) {
  const uid = await userIdFromRequest(req);
  if (!uid) return fail("Not authenticated", "UNAUTHENTICATED", 401);
  try {
    const { step, payload } = await req.json();
    if (!STEPS.includes(step)) return fail("Unknown KYC step", "BAD_STEP");
    const result = await submitKycStep(prisma, uid, step, payload ?? {});
    return ok(result);
  } catch (e) {
    if (e instanceof DomainError) return fail(e.message, e.code, 400);
    console.error(e);
    return fail("KYC step failed", "INTERNAL", 500);
  }
}
