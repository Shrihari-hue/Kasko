import { createHmac, randomInt, timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = process.env.AUTH_SECRET ?? "dev-only-insecure-secret-change-me";
const key = new TextEncoder().encode(SECRET);
export const SESSION_COOKIE = "kasko_session";

/* ---------- OTP ---------- */
export function generateOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashOtp(phone: string, code: string): string {
  return createHmac("sha256", SECRET).update(`${phone}:${code}`).digest("hex");
}

export function verifyOtpHash(phone: string, code: string, storedHash: string): boolean {
  const candidate = Buffer.from(hashOtp(phone, code));
  const stored = Buffer.from(storedHash);
  return candidate.length === stored.length && timingSafeEqual(candidate, stored);
}

/* ---------- Session JWT ---------- */
export async function createSession(userId: string): Promise<string> {
  return new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key);
}

export async function readSession(token?: string): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key);
    return (payload.uid as string) ?? null;
  } catch {
    return null;
  }
}

/** Read the current user id from the session cookie (server components / routes). */
export async function currentUserId(): Promise<string | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return readSession(token);
}

/**
 * Resolve the current user from a request — accepts a Bearer token
 * (Authorization: Bearer <jwt>, used by the native app) OR the session
 * cookie (used by the web app). Native clients can't rely on cookies.
 */
export async function userIdFromRequest(req: Request): Promise<string | null> {
  const auth = req.headers.get("authorization");
  if (auth && auth.startsWith("Bearer ")) {
    const uid = await readSession(auth.slice(7));
    if (uid) return uid;
  }
  return currentUserId();
}
