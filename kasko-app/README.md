# Kasko — full-stack app (Next.js + Prisma)

Premium short-tenure cash advance. Up to ₹1,000 · 1-day tenure · ₹50 interest + ₹50 processing (₹900 in hand, ₹1,000 due) · ₹50/day late fee capped at ₹500 · CIBIL-underwritten. RBI-compliant disclosure surfaces throughout.

This is now a **working full stack**: a real database, session auth with OTP, the complete lending engine, and a frontend wired to live APIs. External partners (CIBIL, KYC, UPI, NBFC, SMS) sit behind swappable adapters with working mock implementations, so the whole thing runs end-to-end with zero credentials.

## Quick start

```bash
npm install                 # also runs `prisma generate`
cp .env.example .env        # defaults run locally with SQLite + mocks
npm run db:push             # create the SQLite schema
npm run dev                 # http://localhost:3000
```

Walk the flow: phone → OTP (shown on-screen in dev) → CIBIL consent → credit check → 4 KYC steps → dashboard → borrow → Key Facts Statement → disbursed → repay → repaid. Everything persists in the DB.

### Verify the backend without the UI

```bash
npm run smoke
```

Runs an end-to-end journey against the real service layer + DB and asserts the money math, the over-limit / concurrent-loan guards, the on-time limit bump, and the late-fee cap.

## Architecture

```
app/
  (screens)/…              13 client screens, wired to the API via lib/api-client.ts
  api/
    auth/request-otp        POST  issue OTP (mock SMS logs it; dev returns it)
    auth/verify-otp         POST  verify → create user → set httpOnly session cookie
    auth/me                 GET   current user + live outstanding balance
    auth/logout             POST  clear session
    consent                 POST  store a consent artifact (RBI audit trail)
    credit-check            POST  CIBIL pull → assign limit
    kyc                     GET/POST  status / submit a step
    loans                   GET   list + ?quote=N price preview ·  POST borrow
    repayments              POST  repay current loan
    transactions            GET   ledger
    webhooks/upi            POST  payment-aggregator webhook stub
lib/
  db.ts                     Prisma client singleton
  money.ts                  ALL lending math (fees, limits, late fee, APR) — single source of truth
  auth.ts                   OTP hashing + JWT sessions (jose)
  services.ts               business logic; API routes are thin wrappers, smoke test calls these directly
  adapters/index.ts         SMS · CIBIL · KYC · UPI · NBFC — interfaces + mocks
  api-client.ts             typed browser fetch wrapper
  store.ts                  Zustand store backed by the API
prisma/schema.prisma        User, OtpChallenge, Consent, CreditCheck, KycRecord, Loan, Repayment, Transaction, LimitHistory
scripts/smoke.ts            end-to-end test
```

## Going to production

1. **Swap SQLite → Postgres**: change `provider` in `prisma/schema.prisma` to `postgresql`, set `DATABASE_URL`, run `prisma migrate deploy`.
2. **Set a real `AUTH_SECRET`**: `openssl rand -base64 32`.
3. **Replace the mock adapters** in `lib/adapters/index.ts` one at a time — each is a class implementing a typed interface, so nothing else changes:
   - `MockSms` → MSG91 / Twilio / AWS SNS
   - `MockBureau` → your CIBIL / Experian / CRIF API partner
   - `MockKyc` → Karza / IDfy / Hyperverge / Signzy
   - `MockUpi` → Razorpay / Cashfree / PhonePe PG (and verify the webhook signature in `api/webhooks/upi`)
   - `MockNbfc` → your NBFC partner's loan-origination + escrow API
4. **Move money through the NBFC's escrow**, not your own account (RBI Digital Lending Guidelines 2022).

## Compliance checklist before launch

- [ ] NBFC partnership in place — you cannot legally lend without one
- [ ] Key Facts Statement shown before disbursement (built — `/borrow` modal, APR computed in `money.ts`)
- [ ] CIBIL consent artifact stored & retrievable (built — `Consent` table)
- [ ] Grievance officer name/email/phone in-app (built — Profile + Help)
- [ ] Late-fee cap disclosed up front (built — capped at ₹500 in `money.ts`)
- [ ] Cooling-off period for cancellation without penalty
- [ ] Loan terms in English **and** Hindi (add `next-intl`)
- [ ] All PII stored in an India region
- [ ] Play Store listing names the NBFC partner (required for lending-app approval)

## A note on pricing

Flat ₹50 + ₹50 fees are defined for the flagship ₹1,000 ticket. For smaller amounts the flat structure makes net disbursal shrink fast, so `money.ts` enforces `MIN_PRINCIPAL = 200`. Decide sub-₹1,000 pricing with your NBFC and update `quote()` — it's the single place the math lives.

## Companion files (in your Kasko folder)

- `kasko-prototype.html` — single-file clickable prototype (no backend)
- `design-handoff/Kasko_design_handoff.pdf` + `screens/` — full-fidelity design handoff
