import { prisma } from "@/lib/db";
import { ok, fail } from "@/lib/api";
import { userIdFromRequest } from "@/lib/auth";
import { runCreditCheck, DomainError } from "@/lib/services";

export async function POST(req: Request) {
  const uid = await userIdFromRequest(req);
  if (!uid) return fail("Not authenticated", "UNAUTHENTICATED", 401);
  try {
    const result = await runCreditCheck(prisma, uid);
    return ok(result);
  } catch (e) {
    if (e instanceof DomainError) return fail(e.message, e.code, 400);
    console.error(e);
    return fail("Credit check failed", "INTERNAL", 500);
  }
}
