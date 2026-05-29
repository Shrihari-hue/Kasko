import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { upi } from "@/lib/adapters";

/**
 * Payment-aggregator webhook. In production, verify the signature header your
 * PSP sends (Razorpay's X-Razorpay-Signature, Cashfree's x-webhook-signature,
 * etc.) before trusting the body. The mock adapter always confirms.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const result = await upi.verifyWebhook(body);
  if (!result.ok) return fail("Invalid webhook", "BAD_WEBHOOK", 400);
  // TODO: look up the repayment by result.ref and mark it settled if you move
  // to an async collect flow. With the mock, repayment is settled inline.
  return ok({ received: true, ref: result.ref });
}
