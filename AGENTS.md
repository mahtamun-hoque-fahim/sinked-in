# Sinked In

A live flood-status and relief-matching map for Chattogram — zero-login browsing, phone+email+OTP scoped to report actions only, no persistent accounts.

## Git Identity (Session Start — run before any commit, every session)

```
git config user.name "mahtamun-hoque-fahim"
git config user.email "mahtamunhoquefahim@gmail.com"
```

Execute automatically at the start of every session, before the first commit — never ask, never skip, never commit as Claude. This applies across every Claude account/session working this repo.

## Setup & Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Type check: `npx tsc --noEmit`
- DB push (dev only): `npx drizzle-kit push`
- DB migrate (production): `npx drizzle-kit generate` then `npx drizzle-kit migrate`

## Conventions & Non-Negotiables

- No emojis anywhere in code or UI — lucide-react icons or inline SVG only
- **No Better Auth, no sessions, no accounts.** This project deliberately deviates from Fahim's usual auth default. All "auth" is phone + email + OTP scoped to a single action (submit / update / admin) — never treat this as a project to retrofit Better Auth onto
- Reports are matched/updated by **phone number**, not by ID or account — `/report/update` looks up by phone, not `[id]`
- OTP must be re-verified on every status change, not just first submission — a token from `purpose: submit` is not valid for `purpose: update` or `purpose: admin`
- OTP is delivered by **email (Resend)**, not SMS, until a sponsor funds SMS costs — the phone field is still required and is still the callback contact, this only affects delivery channel
- Proxy reports always carry the reporter's own phone/email, never a fabricated one for the person being reported on
- Flood status (flooded/safe/not-in-danger) and aid status (needs-aid/in-progress/aided) are two separate state machines — never collapse into one field
- Report submission flow must complete in under 60 seconds — no more than 3 form steps before OTP
- Free forever — no paid tier, no ads, any third-party service choice must have a workable free tier at current scale

## Security Gotchas

- `.env.local` is never committed — if a secret leaks into git history or chat, rotate it immediately, don't just remove it going forward
- OTP codes are stored hashed (`OTP_HASH_SECRET` pepper), never plaintext, and expire after a short TTL
- `/api/otp/send` and `/api/otp/verify` need per-phone rate limiting — this is a live emergency-relief matching system, and unthrottled false status flips (e.g. spamming "aided" onto real in-need reports) actively misdirects relief
- `/admin` auth is an allowlist (`admin_allowlist` table) checked against the same phone+email+OTP flow — do not build a second, separate admin auth system

## Session Log

(Newest first. Maximum 10 entries — drop the oldest when an 11th is added.)

### 2026-07-22 (continued)
- Did: Added Cloudinary photo upload — signed direct-to-Cloudinary upload flow (`/api/upload-signature` + `PhotoUpload` client component), so photo bytes never pass through our own serverless function. Wired into ReportForm. Did a tap-target pass (all interactive elements now 48px minimum, up from a mix of 40/48px) and an accessibility pass (landmark role + aria-label on the map, role="status" on the confirmation screen). All 14 routes still build and lint clean.
- Decided: Upload-signature endpoint is intentionally not OTP-gated — a signature alone only permits one scoped Cloudinary upload, it can't create or alter a report on its own, so gating it would add friction without a security benefit
- Next: Phase 3 checklist is now fully done in code. Remaining items are account/infra setup only (Neon, Resend, Cloudinary, Vercel, admin_allowlist seed) — see PLANNER.md Next Steps

### 2026-07-22
- Did: Scaffolded and built the full Next.js 16 app — Drizzle schema (reports, otp_codes, admin_allowlist), Neon client, OTP generation/hashing/rate-limiting, Resend email delivery, signed purpose-scoped verification tokens, all 8 API routes, all 6 pages (/, /report, /report/proxy, /report/update, /about, /admin), Leaflet map (client-only via dynamic import), Storm Ledger design tokens in globals.css, IBM Plex Sans + JetBrains Mono via @fontsource. Generated first Drizzle migration (drizzle/0000_clear_molly_hayes.sql). `npm run build` and `eslint` both pass clean.
- Decided: OTP verification issues a short-lived HMAC-signed token scoped to one phone+purpose pair (submit/update/admin) rather than reusing raw codes — a submit-purpose token cannot authorize an update or admin action, satisfying the Council re-verification requirement without needing sessions
- Next: Create the Neon project and run the migration; set up Resend + verified domain; seed admin_allowlist; connect Vercel and set env vars; build Cloudinary photo upload UI; mobile one-handed + WCAG 2.2 AA passes before first real deploy

### 2026-07-21
- Did: Singularity interview → BRAIN.md committed; tree-man → SITETREE.md committed (6 routes); Council PRE-BUILD convened, delivered CONDITIONAL GO; repo-maintainer scaffolded PLANNER.md, DESIGN_GUIDE.md, README.md, AGENTS.md, CLAUDE.md
- Decided: OTP delivery is email via Resend (not SMS) until a sponsor is secured — phone number still required as callback contact; `/report/[id]/update` redesigned as `/report/update` (phone-lookup) per Council/Wizard finding; `/admin` reuses the same phone+email+OTP pattern via an allowlist table, no second auth system
- Next: Phase 1 — scaffold Next.js 16 project, Drizzle schema for `reports`/`otp_codes`/`admin_allowlist`, Resend OTP integration with per-phone rate limiting
