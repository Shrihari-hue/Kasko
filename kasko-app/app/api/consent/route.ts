import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, fail } from "@/lib/api";
import { userIdFromRequest } from "@/lib/auth";
import { recordConsent } from "@/lib/services";

export async function POST(req: NextRequest) {
  const uid = await userIdFromRequest(req);
  if (!uid) return fail("Not authenticated", "UNAUTHENTICATED", 401);
  const { kind, payload } = await req.json();
  if (!kind) return fail("kind is required", "BAD_INPUT");
  const ip = req.headers.get("x-forwarded-for") ?? undefined;
  const c = await recordConsent(prisma, uid, String(kind), payload, ip);
  return ok({ id: c.id, kind: c.kind, at: c.createdAt });
}
