# BRAIN.md — Sinked In

> This file is maintained by the Singularity skill. It is the identity document of this project.
> When Claude drifts, hallucinates, or loses context — this file is the source of truth.
> Do not confuse this with PLANNER.md (tasks/phases) or DESIGN_GUIDE.md (design tokens).

---

## The One-Line Truth

A helping app for flood scenarios that lets people mark themselves safe, flooded, or in need of emergency relief — so aid goes to who actually needs it, not just who's easiest to reach.

---

## Why It Exists

In a flood, water is everywhere but not everyone needs aid — yet aid organizations can't tell the difference from the road. Relief gets front-loaded onto the easiest-to-reach households near the entrance of a flooded area, and runs out before it reaches the people at the end of the road who are fully sunk and worst off. The gap isn't willingness to help — it's visibility into where real need actually is. Sinked In exists to close that gap for Chattogram.

---

## What It Must Become

The center of all flood-status information for an area — a live map an organization or volunteer group can look at and immediately know where to deploy, without guessing, without over-serving the easy spots, without wasting a single trip.

---

## Core Decisions (Locked)

These decisions are final. Claude must not question or work around them without explicit confirmation from Fahim.

- [LOCKED] Map browsing requires zero login — anyone can view live status instantly, no account, no wall
- [LOCKED] Verification happens only at report-submission time, not at app entry — phone number + OTP SMS only (proves human, gives responders a callback number). No email, no password, no persistent account/session.
- [LOCKED] Proxy reporting is a first-class feature — a person can report a neighbor who has no phone. The phone number collected is always the reporter's own, never a fabricated one for the neighbor, so responders call someone who can actually be reached.
- [LOCKED] Reports are matched/updated by phone number, not account — same number reporting again updates their existing report (e.g. "in danger" → "aided") instead of creating a duplicate.
- [LOCKED] Status states beyond flooded/safe: aided, in need of aid, in process of aiding — this is a live matching system, not a static incident log.
- [LOCKED] Free forever — must never charge money, in any form.
- [LOCKED] Must exist as its own dedicated app — not a spreadsheet, not a WhatsApp/Telegram bot. Justification: it requires a live spatial map + updating status states + one-handed low-friction use in crisis conditions (rain, glare, low signal, shaking hands). No lighter tool supports this. Not built to be popular — built because nothing lighter is capable enough.

---

## Visual Identity (Locked)

> Chosen in Phase 1.5. These values are locked. Do not substitute with `#00e676`, `#0a0a0a`, `#131720`, or `#6C63FF`. Do not invent new values. If you need a token not listed here, derive it from the accent at reduced opacity and flag it for Fahim.

| Token          | Value       | Usage                            |
|----------------|-------------|-----------------------------------|
| `bg`           | `#0c0f0e`   | Page background                  |
| `surface`      | `#141917`   | Card, panel, input backgrounds   |
| `surface-elevated` | `#1c231f` | Raised elements, dropdowns       |
| `accent`       | `#3dd6c4`   | Primary actions, links, glows    |
| `accent-faint` | `#3dd6c41a` | Ring/border accent at 10% opacity|
| `border`       | `#212824`   | Default border colour            |
| `text`         | `#eef3f1`   | Primary text                     |
| Font (display) | IBM Plex Sans | Headings                       |
| Font (body)    | IBM Plex Sans | Body copy                      |
| Font (mono)    | JetBrains Mono | Numbers, coordinates, status codes |

> Note: teal/cyan accent is the *brand* color only. Map pin status colors (flooded/safe/danger/aided) are a separate semantic palette to be defined in DESIGN_GUIDE.md — never substitute brand accent for status meaning.

---

## What It Must Never Become

- Never a social feed — no likes, comments, viral posts, "trending flood stories"
- Never a heavy-verification / bureaucratic reporting flow — if reporting a flooded neighbor takes more than a minute, it fails its purpose
- Never gatekept behind logins/orgs-only — anyone must be able to see the map with zero signup
- Never a general chat/disaster-discussion app — stays laser-focused on status + location + need
- Never monetized in any form

---

## Current State

```
Status: Pre-build (BRAIN.md just committed)
Last updated: 2026-07-21

What works:
- (nothing built yet)

What's broken or incomplete:
- Entire build — this is day zero

What's next (in spirit, not tasks):
- tree-man to produce SITETREE.md
- Council PRE-BUILD verdict
- repo-maintainer scaffold on GO
```

---

## The Stack (Frozen)

These are confirmed for this project. Do not suggest alternatives unless Fahim initiates a migration.

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Neon (PostgreSQL) + Drizzle ORM |
| Auth | None (no Better Auth, no sessions) — lightweight phone + OTP verification tied to reports only |
| Map | Leaflet.js (no API key required, free tier sufficient) |
| Media | Cloudinary (report photos) |
| SMS/OTP | TBD at repo-maintainer stage — needs a provider decision (e.g. Twilio-compatible or local BD SMS gateway) |
| Deployment | Vercel (primary) |

---

## Constraints & Non-Negotiables

Hard limits. Technical, design, legal, or personal.

- No emojis in UI — lucide-react icons only
- Dark-first, no light mode
- No Supabase
- No paid tier, ever — every third-party service choice must have a workable free tier
- Map must be usable one-handed, in low signal, under time pressure — this governs every UI decision over aesthetic preference
- Report submission flow must be completable in under 60 seconds

---

## Context Hooks (for Claude)

Things Claude tends to forget or get wrong on this specific project. Treat these as hard truth.

- There is NO persistent user auth. Do not add Better Auth, sessions, or login flows by default — verification is phone + OTP, scoped to the report action only, not an account system.
- Proxy reports are not an edge case — they're a core, expected use case. The phone number on a proxy report always belongs to the reporter, never invented for the person being reported on.
- "Flooded" and "in danger/needs aid" are NOT the same field — a house can be flooded but not in danger (Q3: "residence not in danger" is a valid, distinct report type). Do not collapse these into one boolean.
- Status states (aided / in need of aid / in process of aiding) apply to relief-matching, separate from the flood-status states (flooded / safe / not in danger). Two different state machines — don't merge them.
- Brand accent (teal) is never reused as a map status color. Status colors are a separate semantic set, defined later in DESIGN_GUIDE.md.

---

*Last updated by Bushmaster on 2026-07-21*
