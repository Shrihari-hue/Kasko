import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, fail } from "@/lib/api";
import { userIdFromRequest } from "@/lib/auth";
import { createLoan, getOutstanding, DomainError } from "@/lib/services";
import { quote } from "@/lib/money";

// GET /api/loans            → list + current outstanding
// GET /api/loans?quote=750  → price a prospective loan (KFS preview)
export async function GET(req: NextRequest) {
  const uid = await userIdFromRequest(req);
  if (!uid) return fail("Not authenticated", "UNAUTHENTICATED", 401);

  const q = req.nextUrl.searchParams.get("quote");
  if (q) {
    try { return ok({ quote: quote(Number(q)) }); }
    catch (e) { return fail((e as Error).message, "BAD_AMOUNT", 400); }
  }
  const loans = await prisma.loan.findMany({ where: { userId: uid }, orderBy: { disbursedAt: "desc" } });
  const outstanding = await getOutstanding(prisma, uid);
  return ok({ loans, outstanding: outstanding ? { owed: outstanding.owed, lateFee: outstanding.lateFee, overdue: outstanding.overdue } : null });
}

// POST /api/loans { principal }  → borrow
export async function POST(req: NextRequest) {
  const uid = await userIdFromRequest(req);
  if (!uid) return fail("Not authenticated", "UNAUTHENTICATED", 401);
  try {
    const { principal } = await req.json();
    const ip = req.headers.get("x-forwarded-for") ?? undefined;
    const { loan, quote: q } = await createLoan(prisma, uid, Number(principal), ip);
    return ok({ loanId: loan.id, netDisbursed: q.netDisbursed, repayAmount: q.repayAmount, dueAt: loan.dueAt });
  } catch (e) {
    if (e instanceof DomainError) return fail(e.message, e.code, 400);
    console.error(e);
    return fail("Could not create loan", "INTERNAL", 500);
  }
}
