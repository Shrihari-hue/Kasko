# Kasko — native mobile app (React Native / Expo)

A real cross-platform native app (Android + iOS) for Kasko. The UI is React Native; it talks to your existing Kasko backend (`kasko-app` on Railway) over HTTPS using a Bearer token. Same design, same 13 screens, same lending logic — now native.

## Prerequisites

- Node 18+
- The Kasko backend deployed (see `kasko-app` → `DEPLOY_AND_APK.md`). You need its URL.
- For builds: a free **Expo account** (expo.dev). For iOS on a real device/store: an Apple Developer account ($99/yr).

## Run it in development

```bash
npm install
cp .env.example .env          # then edit EXPO_PUBLIC_API_BASE to your Railway URL
npx expo start
```

- Press **a** for Android emulator, or scan the QR with the **Expo Go** app on your phone.
- The app loads the splash → login → OTP → CIBIL consent → KYC → dashboard → borrow → repay flow, all hitting your live backend.
- In dev (when your backend runs with `NODE_ENV=development`) the OTP shows on the OTP screen. In production it's sent via SMS only.

> Note: Expo Go is fine for most testing, but `@react-native-community/slider` and `expo-secure-store` are native modules — if Expo Go ever complains, use a **development build** (`npx expo run:android`) or the EAS preview build below.

## Build the Android APK (no Android Studio needed — cloud build)

```bash
npm install -g eas-cli
eas login
eas build:configure
# set your real backend URL in eas.json (preview/production env), then:
eas build -p android --profile preview
```

EAS builds in the cloud and gives you a download link for the `.apk`. Install it on any Android phone. For the Play Store, use `--profile production` (produces an `.aab`) and `eas submit`.

## Build for iPhone

```bash
eas build -p ios --profile preview
```

This needs your Apple Developer account credentials (EAS will prompt). Without an Apple Developer account you can only run on the iOS Simulator via `npx expo run:ios` on a Mac.

## How it talks to the backend

`lib/api.ts` reads `EXPO_PUBLIC_API_BASE` and sends every request to your Railway server with `Authorization: Bearer <token>`. The token comes from `POST /api/auth/verify-otp` and is stored with `expo-secure-store` (encrypted device keychain). No cookies — that's why the backend was updated to accept the Bearer header.

## Project layout

```
app/                 file-based routes (expo-router)
  _layout.tsx        loads Fraunces + Inter, sets up the stack
  index.tsx          splash → routes to dashboard (if logged in) or login
  login, otp, consent, kyc, dashboard, borrow, disbursed, repay, repaid, history, profile, help
components/
  ui.tsx             Button, Card, Field, Display, Logo, etc.
  Nav.tsx            TopBar + BottomNav
  TabScreen.tsx      layout for the 4 bottom-tab pages
lib/
  theme.ts           colors + font names + formatters
  api.ts             Bearer-token API client (base URL from env)
  session.ts         secure token storage
  store.ts           Zustand store (mirrors the web app)
```

## What's mocked vs real

The app is real. The *backend's* external partners (SMS, CIBIL, KYC, UPI, NBFC) are still mock adapters on the server side — swap them in `kasko-app/lib/adapters/index.ts` when those partnerships are live. Nothing in this mobile app changes when you do.
