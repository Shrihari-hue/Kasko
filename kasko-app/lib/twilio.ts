/**
 * Twilio Verify client (OTP send + check).
 *
 * Uses the Verify v2 REST API with API-Key Basic auth, so Twilio owns code
 * generation, SMS delivery, expiry and rate-limiting — we never store the code.
 *
 * Enabled only when SMS_PROVIDER=twilio and the credentials are present;
 * otherwise the app falls back to the local mock OTP flow (see services.ts).
 */
const VERIFY_BASE = "https://verify.twilio.com/v2";

export function twilioConfigured(): boolean {
  return (
    process.env.SMS_PROVIDER === "twilio" &&
    !!process.env.TWILIO_API_KEY_SID &&
    !!process.env.TWILIO_API_KEY_SECRET &&
    !!process.env.TWILIO_VERIFY_SERVICE_SID
  );
}

function authHeader(): string {
  const sid = process.env.TWILIO_API_KEY_SID as string;
  const secret = process.env.TWILIO_API_KEY_SECRET as string;
  return "Basic " + Buffer.from(`${sid}:${secret}`).toString("base64");
}

function serviceSid(): string {
  return process.env.TWILIO_VERIFY_SERVICE_SID as string;
}

/** Convert a 10-digit Indian mobile number to E.164 (+91…). */
export function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (phone.startsWith("+")) return phone;
  return `+${digits}`;
}

/** Start a verification — Twilio sends a 6-digit SMS code to the number. */
export async function startVerification(phone: string): Promise<void> {
  const res = await fetch(`${VERIFY_BASE}/Services/${serviceSid()}/Verifications`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: toE164(phone), Channel: "sms" }).toString(),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Twilio Verify start failed (${res.status}): ${detail}`);
  }
}

/** Check a code. Returns true only when Twilio reports status "approved". */
export async function checkVerification(phone: string, code: string): Promise<boolean> {
  const res = await fetch(`${VERIFY_BASE}/Services/${serviceSid()}/VerificationCheck`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: toE164(phone), Code: code }).toString(),
  });
  // 404 = no pending verification (expired or never sent) → treat as not approved.
  if (res.status === 404) return false;
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Twilio Verify check failed (${res.status}): ${detail}`);
  }
  const data = (await res.json()) as { status?: string };
  return data.status === "approved";
}
