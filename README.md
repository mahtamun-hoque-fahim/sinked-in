# Sinked In

A live flood-status and relief-matching map for Chattogram — mark yourself or a neighbor safe, flooded, or in need of aid, with zero login to browse.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Neon (PostgreSQL) + Drizzle ORM
- No auth system — phone + email + OTP scoped to report actions only, no accounts
- Resend (OTP email delivery)
- Leaflet.js (map, no API key required)
- Cloudinary (report photos)
- Vercel (production)

## Prerequisites

- Node 20+
- A Neon project (pooled + unpooled connection strings)
- A Resend account + verified sending domain
- A Cloudinary account
- Vercel account (for deploy)

## Local setup

1. Clone the repo: `git clone https://github.com/mahtamun-hoque-fahim/sinked-in.git`
2. Install: `npm install`
3. Copy `.env.example` to `.env.local` and fill in values (see PLANNER.md → Env Vars)
4. Apply migrations: `npx drizzle-kit migrate`
5. Run dev: `npm run dev`

## Env vars

See PLANNER.md → Env Vars for descriptions. Names only:

```
DATABASE_URL
DATABASE_URL_UNPOOLED
NEXT_PUBLIC_APP_URL
RESEND_API_KEY
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
OTP_HASH_SECRET
ADMIN_ALLOWLIST_SEED
```

## Scripts

```bash
npm run dev          # local dev server
npm run build        # production build
npm run start        # serve production build
npm run lint         # ESLint
npx drizzle-kit generate   # generate migration from schema
npx drizzle-kit migrate    # apply migrations
npx drizzle-kit push       # push schema directly (dev only)
```

## Deploy

- Push to `main` → Vercel auto-deploys to production
- Push to any other branch → Vercel preview deploy

Before promoting a deploy, verify env vars are set in the Vercel dashboard (Production env) — especially `RESEND_API_KEY` and `OTP_HASH_SECRET`, since the whole verification flow depends on them.

## Folder structure

```
app/             routes (App Router) — see SITETREE.md for the full route manifest
components/      UI primitives and sections
lib/             db, otp, email, utils (no auth/ dir — no persistent auth in this project)
drizzle/         generated migrations
```

For the detailed structure and data model, see PLANNER.md → Architecture and DB Schema.
