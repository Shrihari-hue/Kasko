import { NextResponse } from "next/server";
import { currentUserId } from "./auth";
import { DomainError } from "./services";

export function ok(data: unknown, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}
export function fail(message: string, code = "ERROR", status = 400) {
  return NextResponse.json({ ok: false, error: { message, code } }, { status });
}

/** Wrap a handler: catches DomainError → 400, everything else → 500. */
export function handler(fn: () => Promise<NextResponse>) {
  return async () => {
    try { return await fn(); }
    catch (e) {
      if (e instanceof DomainError) {
        const status = e.code === "UNAUTHENTICATED" ? 401 : 400;
        return fail(e.message, e.code, status);
      }
      console.error(e);
      return fail("Something went wrong", "INTERNAL", 500);
    }
  };
}

/** Require a logged-in user; returns id or throws a 401 response via the caller. */
export async function requireUser(): Promise<string> {
  const uid = await currentUserId();
  if (!uid) throw new DomainError("Not authenticated", "UNAUTHENTICATED");
  return uid;
}
