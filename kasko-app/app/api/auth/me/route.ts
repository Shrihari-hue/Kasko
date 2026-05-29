import { prisma } from "@/lib/db";
import { ok, fail } from "@/lib/api";
import { userIdFromRequest } from "@/lib/auth";
import { getOutstanding } from "@/lib/services";

export async function GET(req: Request) {
  const uid = await userIdFromRequest(req);
  if (!uid) return fail("Not authenticated", "UNAUTHENTICATED", 401);
  const user = await prisma.user.findUnique({ where: { id: uid } });
  if (!user) return fail("Not authenticated", "UNAUTHENTICATED", 401);
  const outstanding = await getOutstanding(prisma, uid);
  return ok({
    id: user.id, phone: user.phone, name: user.name,
    creditScore: user.creditScore, limit: user.limit, kycComplete: user.kycComplete,
    outstanding: outstanding ? { owed: outstanding.owed, lateFee: outstanding.lateFee, overdue: outstanding.overdue, dueAt: outstanding.loan.dueAt } : null,
  });
}
