# Sinked In — Planner

> One-line description: A helping app for flood scenarios that lets people mark themselves safe, flooded, or in need of emergency relief in Chattogram — so aid goes to who actually needs it, not just who's easiest to reach.

## Project Overview

**Purpose.** In a flood, water is everywhere but not everyone needs aid — yet aid organizations can't tell the difference from the road. Relief gets front-loaded onto easy-to-reach households and runs out before reaching people at the end of the road who are worst off. Sinked In closes that visibility gap.

**Target user.** Two sides of one live map: (1) flood-affected residents in Chattogram marking their own or a neighbor's status, and (2) aid organizations/volunteer groups deciding where to deploy.

**Key value.** A live, zero-login map that tells a responder exactly where real need is — no guessing, no over-serving the easy spots.

**Current phase.** Planning (Council PRE-BUILD delivered CONDITIONAL GO — see Notes & decisions).

---

## Architecture

**Stack:**
- Framework: Next.js 16 App Router
- Language: TypeScript
- Styling: Tailwind CSS v4
- Database: Neon (PostgreSQL)
- ORM: Drizzle
- Auth: **None** — no Better Auth, no sessions, no accounts. Verification is phone + email + OTP, scoped only to the report-submission and report-update actions.
- Email/OTP: Resend
- Map: Leaflet.js (no API key required)
- Media: Cloudinary (report photos)
- Deployment: Vercel (primary)

**Deployment topology:**
- `main` → Vercel production
- PRs → Vercel preview

**Folder structure (summary):** see README.md → Folder structure

---

## User Flows

### Flow 1: Resident checks the map (zero login)
1. User lands on `/`
2. Sees live Leaflet map with pins colored by status (flooded / safe / not-in-danger, and separately: needs-aid / in-progress / aided)
3. Taps a pin for details — no login required at any point in this flow

### Flow 2: Resident reports their own status
1. User lands on `/report`
2. Fills status (flooded / safe / not in danger) + location (map pin or address) + phone number (callback) + email (OTP delivery)
3. Optionally attaches a photo (Cloudinary)
4. Submits → OTP code emailed via Resend → user enters code → verified
5. Report goes live on the map immediately
6. Confirmation screen: "Your report is live. Responders can reach you at [phone]."

### Flow 3: Proxy report (reporting a neighbor with no phone)
1. User lands on `/report/proxy`
2. Fills the neighbor's status + location
3. Provides **their own** phone + email (never a fabricated number for the neighbor) → OTP verify
4. Report goes live, tagged as proxy-reported; callback number is the reporter's

### Flow 4: Resident updates an existing report
1. User lands on `/report/update`
2. Enters phone number → OTP re-verification via email (every update requires fresh OTP, not just first submission — Council/Architect requirement)
3. Sees their existing report(s) matched by phone number
4. Updates status (e.g. "in danger" → "aided")

### Flow 5: Admin/ops reviews and matches aid
1. User lands on `/admin`
2. Verifies via the same phone + email + OTP pattern (allowlisted admin phone/email — no separate auth system)
3. Sees raw report feed, filters by status
4. Toggles aid-matching state: needs-aid → in-progress-aiding → aided

---

## DB Schema

Drizzle schema lives in `lib/db/schema.ts`. Summary — no `users`/`sessions`/`accounts` tables, since there is no persistent auth:

### reports
| column | type | notes |
|---|---|---|
| id | text PK | nanoid |
| phone | text, indexed | callback contact; reports are matched/updated by this field |
| email | text | OTP delivery channel only, not a contact method |
| latitude | numeric | |
| longitude | numeric | |
| address | text, nullable | free-text fallback if pin placement is imprecise |
| floodStatus | enum | `flooded` \| `safe` \| `not_in_danger` |
| aidStatus | enum | `needs_aid` \| `in_progress` \| `aided` \| nullable (not every report implies an aid need) |
| isProxy | boolean | true if reported on behalf of someone else |
| photoUrl | text, nullable | Cloudinary URL |
| createdAt | timestamp | defaultNow |
| updatedAt | timestamp | updated on every status change |

### otp_codes
| column | type | notes |
|---|---|---|
| id | text PK | nanoid |
| phone | text, indexed | ties the OTP attempt to a report action |
| email | text | delivery address |
| code | text | hashed, not plaintext |
| purpose | enum | `submit` \| `update` \| `admin` |
| expiresAt | timestamp | short TTL, e.g. 10 min |
| consumedAt | timestamp, nullable | null until used — prevents replay |
| createdAt | timestamp | defaultNow |

### admin_allowlist
| column | type | notes |
|---|---|---|
| id | text PK | nanoid |
| phone | text unique | |
| email | text unique | |
| createdAt | timestamp | defaultNow |

---

## API Routes

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | /api/reports | public | — | Report[] (map data, phone/email stripped) |
| POST | /api/otp/send | public, rate-limited per phone | `{ phone, email, purpose }` | `{ ok: true }` |
| POST | /api/otp/verify | public, rate-limited per phone | `{ phone, code, purpose }` | `{ verified: true, token }` |
| POST | /api/reports | requires verified OTP token | `{ phone, email, floodStatus, lat, lng, address?, photoUrl?, isProxy }` | Report |
| PATCH | /api/reports/[id] | requires fresh verified OTP token (purpose: update) | `{ floodStatus?, aidStatus? }` | Report |
| GET | /api/reports/lookup | requires verified OTP token (purpose: update) | query: `phone` | Report[] |
| GET | /api/admin/reports | requires verified OTP token (purpose: admin) + allowlist match | — | Report[] (full detail, phone/email visible) |
| PATCH | /api/admin/reports/[id] | requires verified OTP token (purpose: admin) + allowlist match | `{ aidStatus }` | Report |
| POST | /api/upload-signature | public (no OTP — signature alone cannot create a report) | — | `{ signature, timestamp, apiKey, cloudName, folder }` for direct-to-Cloudinary upload |

---

## Env Vars

| Name | Required | Description | Example |
|---|---|---|---|
| DATABASE_URL | yes | Neon pooled connection | postgresql://...?sslmode=require |
| DATABASE_URL_UNPOOLED | yes | Neon direct connection (migrations) | postgresql://...?sslmode=require |
| NEXT_PUBLIC_APP_URL | yes | Public app URL | https://sinked-in.vercel.app |
| RESEND_API_KEY | yes | OTP email delivery | re_... |
| CLOUDINARY_CLOUD_NAME | yes | Report photo uploads | ... |
| CLOUDINARY_API_KEY | yes | | ... |
| CLOUDINARY_API_SECRET | yes | | ... |
| OTP_HASH_SECRET | yes | Pepper for hashing OTP codes at rest | (openssl rand -base64 32) |
| ADMIN_ALLOWLIST_SEED | optional | Comma-separated phone:email pairs to seed admin_allowlist on first deploy | +8801xxxx:admin@sinkedin.app |

---

## Timeline / Phases

### Phase 0 — Pre-build
Status: `[x]` done

- [x] Singularity interview + BRAIN.md committed
- [x] tree-man SITETREE.md committed
- [x] Council PRE-BUILD — CONDITIONAL GO
- [x] Open items resolved: OTP channel (email via Resend), `/admin` auth (allowlist + same OTP pattern), `/report/update` rewritten as phone-lookup
- [x] repo-maintainer scaffold (this pass)

### Phase 1 — Foundation
Status: `[x]` done

- [x] Repo created, Vercel connected (Vercel connection is a manual dashboard step for Fahim — not scriptable from here)
- [x] Drizzle schema for `reports`, `otp_codes`, `admin_allowlist`
- [x] Resend integration for OTP email
- [x] Rate limiting on `/api/otp/send` and `/api/otp/verify` (per-phone)

### Phase 2 — Core flows
Status: `[x]` done

- [x] `/` live map (Leaflet, public read)
- [x] `/report` submit flow with OTP + confirmation screen
- [x] `/report/proxy`
- [x] `/report/update` (phone-lookup + OTP re-verify)
- [x] `/about`

### Phase 3 — Admin & polish
Status: `[x]` done

- [x] `/admin` allowlist auth + aid-status toggling
- [x] Cloudinary photo upload on report submission (signed direct-to-Cloudinary upload via `/api/upload-signature`)
- [x] Mobile one-handed usability pass (all interactive elements now 48px minimum, 56px on primary report CTA)
- [x] Accessibility pass (WCAG 2.2 AA) — landmark roles on map and confirmation screen, focus-visible outlines, reduced-motion support, semantic label associations throughout
- [ ] Production deploy verification

---

## Next Steps

In order:
1. Create the Neon project, run `npx drizzle-kit migrate` against it (migration already generated: `drizzle/0000_clear_molly_hayes.sql`)
2. Set up Resend account + verified sending domain, add `RESEND_API_KEY` to `.env.local` and Vercel
3. Set up a Cloudinary account, add `CLOUDINARY_CLOUD_NAME`/`CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET`
4. Seed `admin_allowlist` with at least one real phone+email so `/admin` is reachable
5. Connect the repo to Vercel, set all env vars (see README.md → Env vars) for Production and Preview
6. Run ticket-checker before the first real deploy

Rewrite this section fresh on every `update repo` sync.

---

## Notes & decisions

**2026-07-21.** Council PRE-BUILD convened (Salesman, Coin-master, Wizard, Architect, General) — verdict: CONDITIONAL GO. Five pre-build requirements raised; four resolved same session (OTP channel, `/admin` auth, `/report/update` rewritten as phone-lookup, confirmation screen added to Flow 2). Fifth (OTP re-verification on every status change) is a build-time requirement, tracked in API Routes above (`purpose: update`/`admin` tokens are short-lived and re-issued per action, not reused).

**2026-07-21.** OTP delivery is email (Resend), not SMS — SMS costs money per message with no revenue model to offset it (this project is free forever, by BRAIN.md lock). Phone number is still collected and required on every report — it remains the callback contact for responders. Revisit SMS once a sponsor is secured.

**2026-07-21.** No Better Auth, no persistent accounts — this is a deliberate deviation from Fahim's usual stack default, locked in BRAIN.md. Every "auth" surface in this project (report submit, report update, admin) is actually OTP-scoped-to-action, not session-based.
