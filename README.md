# Velora Bank

A modern **demo** banking platform — landing page, customer dashboard and admin
dashboard — built with **Next.js (App Router, JavaScript)**, **Tailwind CSS** and
**Supabase** (Postgres + Auth).

> **Demo money only.** Nothing real moves. Every "transfer" just shuffles demo
> balances between Velora demo accounts and shows a confirmation. This is a
> learning / portfolio project, not a financial institution.

![theme](https://img.shields.io/badge/theme-light%20%2B%20dark-7C3AED) ![stack](https://img.shields.io/badge/stack-Next.js%20%7C%20Tailwind%20%7C%20Supabase-D946EF)

---

## ✨ Features

- **Animated preloader** that plays once before the landing page.
- **Landing page** — starfield hero, floating glass cards, stats row (inspired by the reference design).
- **Auth** — sign up / sign in with a **country selector (real flags)**, **language switch** (EN / ES / FR) and **light/dark theme switch** on every screen.
- **Customer dashboard** — animated balance card, quick actions, activity sparkline, transactions.
- **Send Money** with tabs: **Local transfer, Wire, PayPal, Bitcoin, Skrill, Cash App, Zelle, Revolut, Venmo** — each with the right fields, a review step and a **confirmation screen**.
- **Admin dashboard** — stats, user management with **credit demo funds**, all transactions, and an admin **Send Money** screen (move demo money from any account).
- **Real backend** — Postgres schema, Row-Level Security, auto-provisioning trigger, and a `SECURITY DEFINER` transfer engine so balances can only change through guarded DB functions.
- **Mobile-first**, fully responsive, no emojis (clean stroke icon set).

---

## 🎨 Re-theming (match any brand colour)

All colours are CSS variables in **`src/app/globals.css`** (`:root` for light,
`.dark` for dark). Change those few lines and the entire app re-skins — buttons,
cards, gradients, charts and the logo. The default theme matches the reference:
violet `#7C3AED` + magenta `#D946EF` on a near-black background.

---

## 🚀 Getting started

### 1. Install
```bash
npm install
```

### 2. Create a Supabase project
Go to https://supabase.com → **New project**. Grab these from
**Project Settings → API**:
- Project URL
- `anon` public key
- `service_role` key (server only)

### 3. Configure env
Copy the example and fill it in:
```bash
cp .env.local.example .env.local
```
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_EMAILS=admin@velora.bank
```

### 4. Create the database
In the Supabase **SQL Editor**, run these files **in order**:
1. `supabase/schema.sql`  — tables, enums, triggers, transfer engine
2. `supabase/policies.sql` — Row-Level Security
3. `supabase/seed.sql`     — demo pool accounts + admin promotion

### 5. Create the users
Supabase won't insert auth users from SQL, so create them in
**Authentication → Users → Add user** (tick **Auto Confirm User**):

| Role  | Email               | Password      |
|-------|---------------------|---------------|
| Admin | `admin@velora.bank` | `Admin@12345` |
| Demo  | `demo@velora.bank`  | `Demo@12345`  |

> Change these passwords. The `on_auth_user_created` trigger automatically
> creates a profile + a funded demo account for each new user.

After creating the admin, re-run the `UPDATE ... set role='admin'` statement in
`supabase/seed.sql` (or just run the whole file again — it's idempotent).

> **Tip:** For a frictionless demo, turn **off** email confirmation in
> **Authentication → Providers → Email** so new sign-ups land straight in the
> dashboard.

### 6. Run
```bash
npm run dev
```
Open http://localhost:3000

- Customer: http://localhost:3000/login
- Admin:    http://localhost:3000/admin/login

---

## 🔐 Admin login

Use the account you promoted to `admin` (default `admin@velora.bank`). The admin
login verifies the `role` column is `admin` and rejects everyone else. The
`/admin` area is also guarded by middleware **and** a server-side role check.

---

## 🖼️ Images

- **Flags** are real images from [flagcdn.com](https://flagcdn.com) (no emoji).
- **Photography** uses [Pexels](https://www.pexels.com) (free to use). The URLs
  live in `src/components/landing/Security.js`. Swap them for your own picks —
  `SmartImage` falls back to a gradient if a URL ever fails, so the layout never
  breaks.
- The hero's floating cards are pure CSS/SVG (they match the reference exactly
  and never 404).

---

## 🧩 Icons

Ships with a dependency-free **Hugeicons-style** stroke icon set in
`src/components/ui/icons.js` (clean outlines, no emojis). Prefer the real
package? `npm i hugeicons-react` and swap the imports — the names map 1:1.

---

## 🗂️ Project structure

```
velora-bank/
├── supabase/
│   ├── schema.sql           # tables, enums, triggers, transfer engine (RPC)
│   ├── policies.sql         # Row-Level Security policies
│   └── seed.sql             # demo pool accounts + admin promotion
├── public/
│   ├── favicon.svg
│   └── images/              # drop your own assets here
├── src/
│   ├── middleware.js        # session refresh + route protection
│   ├── app/
│   │   ├── layout.js        # root layout + providers
│   │   ├── globals.css      # 🎨 THEME TOKENS live here
│   │   ├── page.js          # landing (preloader + sections)
│   │   ├── login/           # customer sign in
│   │   ├── register/        # sign up
│   │   ├── dashboard/       # customer area (layout + pages)
│   │   │   ├── page.js          # overview
│   │   │   ├── transfer/        # Send Money (tabs + confirmation)
│   │   │   ├── transactions/
│   │   │   ├── cards/
│   │   │   └── settings/
│   │   ├── admin/
│   │   │   ├── login/           # admin sign in (public)
│   │   │   └── (protected)/     # role-guarded admin area
│   │   │       ├── page.js          # admin overview
│   │   │       ├── users/           # manage + credit demo funds
│   │   │       ├── transactions/
│   │   │       └── send/            # admin Send Money
│   │   └── api/
│   │       └── transfer/route.js    # demo transfer endpoint → RPC
│   ├── components/
│   │   ├── Preloader.js
│   │   ├── AuthShell.js
│   │   ├── landing/         # Navbar, Hero, Features, Security, CTA
│   │   ├── dashboard/       # Shell, BalanceCard, TransferForm, TxnList, …
│   │   └── ui/              # Logo, ThemeToggle, LanguageSwitch, CountrySelect, icons, SmartImage
│   ├── context/
│   │   └── Providers.js     # theme + i18n providers
│   └── lib/
│       ├── supabase/        # client.js, server.js, admin.js
│       ├── i18n/            # dictionaries + provider
│       ├── countries.js     # full country list + flag URLs
│       ├── transfer-fields.js
│       └── utils.js
├── tailwind.config.js
├── next.config.mjs
├── jsconfig.json            # @/* path alias
└── package.json
```

---

## 🛡️ How the demo transfer engine works

1. The UI posts to **`/api/transfer`**.
2. The route verifies the signed-in user, then calls the Postgres function
   **`perform_demo_transfer`** (`SECURITY DEFINER`).
3. That function re-checks ownership, applies a demo fee model, debits the
   sender's demo account and credits a shared **demo pool** account for the
   chosen channel, then records a `transactions` row and returns it.

Because balances are **only** writable by these guarded functions (no direct
INSERT/UPDATE policy for users), the front-end can never move money it shouldn't,
and nothing ever leaves Velora's demo accounts.

---

## 📜 License / disclaimer

For educational and portfolio use. Velora Bank is **not** a real bank and does
not process real payments. All brand/channel names (PayPal, Bitcoin, etc.) refer
only to representative demo transfer methods.
