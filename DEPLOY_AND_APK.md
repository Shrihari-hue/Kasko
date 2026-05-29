# Deploy Kasko to Railway + build the Android APK

Two parts. **Part A** puts your backend + website online (Railway). **Part B** wraps it in an Android app and builds the APK (Android Studio). Do A first — the APK needs the Railway URL.

There are two separate projects in this folder, and that's intentional:

- `kasko-app/` — the Next.js app (website + API + database). This goes to Railway.
- `~/Kasko` itself (with `android/`, `capacitor.config.json`) — the Android wrapper. This builds the APK and points at your Railway URL.

---

## Part A — Deploy the app to Railway

### A1. Put the code on GitHub
Railway deploys from a Git repo. From a terminal:

```
cd ~/Kasko/kasko-app
git init
git add -A
git commit -m "Kasko app"
```

Create an empty repo on github.com (no README), then:

```
git remote add origin https://github.com/YOUR_USERNAME/kasko-app.git
git branch -M main
git push -u origin main
```

### A2. Create the Railway project
1. Go to **railway.app**, sign in with GitHub (free).
2. **New Project → Deploy from GitHub repo →** pick `kasko-app`.
3. Railway starts building. It will fail the first time because there's no database yet — that's expected, continue below.

### A3. Add a database
You have two choices. **Postgres is recommended** (data survives redeploys).

**Option 1 — Postgres (recommended):**
1. In your Railway project: **New → Database → Add PostgreSQL**.
2. Open `kasko-app/prisma/schema.prisma` and change the datasource block:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
   Commit + push that change. (Local dev will then also expect Postgres — or keep a separate branch for local SQLite.)
3. Railway auto-injects `DATABASE_URL` from the Postgres service. In your **app service → Variables**, add a reference: `DATABASE_URL = ${{Postgres.DATABASE_URL}}`.

**Option 2 — keep SQLite (simplest, fine for testing):**
1. In your app service: **Settings → Volumes → New Volume**, mount path `/data`.
2. In **Variables**, set `DATABASE_URL = file:/data/prod.db`.
   (Leave `schema.prisma` as-is. Data now persists on the volume.)

### A4. Set the remaining variables
In the app service → **Variables**, add:
- `AUTH_SECRET` = a long random string. Generate one locally with `openssl rand -base64 32` and paste it.
- `NODE_ENV` = `production`

### A5. Deploy + get your URL
1. Railway redeploys automatically after the variable changes.
2. The start command (`npm run start:railway`, already set in `railway.json`) runs `prisma db push` to create the tables, then starts the server.
3. In **Settings → Networking → Generate Domain**. You'll get something like
   `https://kasko-app-production.up.railway.app`.
4. Open that URL in a browser — you should see the Kasko splash, and the whole flow should work (OTP shows in dev mode only; in production the code is sent via SMS, so for now use the mock-SMS log in Railway's **Deploy logs** to read the code, or temporarily set `NODE_ENV=development` to show it on-screen for testing).

**Copy that Railway URL — Part B needs it.**

---

## Part B — Build the Android APK

### B1. Install Android Studio
Download from **developer.android.com/studio**. Open it once and let it finish downloading the Android SDK (Tools → SDK Manager if it doesn't prompt).

### B2. Point the wrapper at Railway
Open `~/Kasko/capacitor.config.json` and replace the placeholder URL with your real Railway domain:

```json
{
  "appId": "com.kasko.app",
  "appName": "Kasko",
  "webDir": "www",
  "server": {
    "url": "https://kasko-app-production.up.railway.app",
    "cleartext": false
  }
}
```

### B3. Sync and open Android Studio
From `~/Kasko`:

```
npx cap sync android
npx cap open android
```

`cap sync` copies the config into the Android project; `cap open` launches Android Studio.

### B4. Run it / build the APK
- **To test on a phone or emulator:** plug in an Android phone (USB debugging on) or start an emulator, then press the green ▶ Run button in Android Studio. The app opens and loads your live Railway site.
- **To get an installable APK file:** menu **Build → Build Bundle(s) / APK(s) → Build APK(s)**. When it finishes, click **locate** — the file is at
  `~/Kasko/android/app/build/outputs/apk/debug/app-debug.apk`.
  You can share/sideload that APK directly.
- **For the Play Store:** you need a *signed release* build (**Build → Generate Signed Bundle / APK → Android App Bundle**), which walks you through creating a keystore. And remember Play Store's lending-app review requires your NBFC partner's details — see the compliance checklist in `kasko-app/README.md`.

---

## How it fits together

```
        Phone (APK)                     Railway
   ┌──────────────────┐          ┌──────────────────────┐
   │ Capacitor shell  │  HTTPS   │  Next.js (kasko-app)  │
   │ loads your site  │ ───────► │  pages + /api routes  │
   └──────────────────┘          │  Prisma → Postgres    │
                                  └──────────────────────┘
```

The APK is a thin native shell that loads your live Railway app. Update the app by pushing to GitHub (Railway redeploys) — no new APK needed unless you change the native shell itself.

> Note: a remote-URL Capacitor app is essentially your website in an app frame — perfect for an MVP. If you later want offline support and a more "native" feel, that's when you'd move to bundled assets (splitting the API into its own deployment) or a React Native rewrite.
