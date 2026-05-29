import { prisma } from "@/lib/db";
import { ok, fail } from "@/lib/api";
import { userIdFromRequest } from "@/lib/auth";
import { listTransactions } from "@/lib/services";

export async function GET(req: Request) {
  const uid = await userIdFromRequest(req);
  if (!uid) return fail("Not authenticated", "UNAUTHENTICATED", 401);
  const txns = await listTransactions(prisma, uid);
  return ok({ transactions: txns });
}
