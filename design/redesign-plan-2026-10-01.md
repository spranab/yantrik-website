# yantrikos.com redesign: plan

By Fable 5.1, 1 Oct 2026, from a reading of this repo and yantrik-os. The structural and honesty
baseline. The look and the signature experiences are in `art-direction-2026-10-01.md`; decisions in
`decisions.md`; every factual sentence in `src/data/claims.json`.

## What the repos changed about the brief

1. `/live` already exists outside the Next site: a hand-written page in the OS repo
   (`deploy/live/relay/www`), served by an nginx `location ^~ /live/` alias that outranks the site's
   files, with a strict CSP and an honest offline state. The Pulse, counters and uptime from the
   live-instance design are **not built**, so /live shows only the stream and its status.
2. Claude Code and Codex are not harnesses on `main`. Five minds attach (Yantrik Mind, Hermes, Pi,
   DeepSeek, OpenClaw); Claude, Codex, Gemini, Qwen and xAI appear in the Minds panel as accounts.
3. Egress enforcement is designed, not shipped: the proxy exists and starts in audit; the
   default-deny wall is off by default.

## Audit of the current site

| component | verdict | why |
|---|---|---|
| `layout.tsx` metadata | rework | "14 apps" (16 ship); "never holds its keys" is now wrong for the free pool's vault keys; the title is a slogan |
| `globals.css` | replace | indigo/violet has nothing in common with the OS (bg `#0e1117`, accent `#38d8cd`); three infinite animations against the OS's "no continuous animation"; no reduced-motion path |
| `Navbar` | rework | no Live, Docs or Security; **below `sm` the links vanish with no menu** |
| `Hero` | rewrite | "Your Desktop, Reimagined" is a hype line; typing animation unreadable to screen readers; stats (14 / 155 / 15 / 50) contradict the README and the page itself; floating orb; primary CTA goes to GitHub |
| `Screenshots` | rework | from ~v0.1.0-250; missing everything since (approval card, mode menu, Minds panel, Settings → AI, Agents, Mind View…); carousel lacks keyboard semantics |
| `VideoDemo` | keep, move | the film and the measured token counts are the strongest evidence, with raw data in `public/measure/` |
| `Features` | delete | wrong counts ("six methods", "57 actions / ten surfaces", "14 apps", "two minds"); misses modes, cards, Mind View, egress, vault, Agents |
| `MindSocket` | rework | "two minds", "six methods" wrong; the shared-memory line needs its limits |
| `ConversationDemo` | delete | fictional, and wrong about how approvals work |
| `BondSystem` | delete | level names and message counts have no source in the repo |
| `SkillStore` | delete from home | 50 skills is true; one line on /minds |
| `Architecture` | rework | wrong counts; no gate, modes, Mind View or YantrikDB |
| `Download` | keep, extend | reading `latest.json` at runtime is right; add VM settings, the hardware table, channels, changelog |
| `Footer` | rework | "rethink your desktop", "love and caffeine": the tone Pranab asked to remove |
| `YantrikMark` | keep | correct |
| `feat/umami-analytics` | merge after moving off `u.warpmode.io` | the site must say it counts page views without cookies |
| site-wide | fix | `text-zinc-600` on the ground is ~3.1:1 (fails AA); no skip link; every section is a client component |

## Pages

| route | purpose | audience | source of truth |
|---|---|---|---|
| `/` | what Yantrik OS is, the live statement, a path to each deeper page | visitors first | facts.json, claims.json |
| `/live` | watch the sealed instance; what you are and are not seeing | visitors | the relay, `deploy/live/*` |
| `/download` | get, verify, boot in a VM, install, update; hardware measured vs not | visitors, developers | `latest.json`, `docs/getting-started.md`, `docs/hardware-requirements.md`, `docs/releasing.md` |
| `/minds` | the companion, five harnesses, accounts, What runs on what, Free AI, Mind View, Agents | all | `docs/harness.md`, `design/minds-panel-…`, `docs/free-tiers.md` |
| `/security` | grades, ceiling, modes, cards, verified caller, audit, taint, vault, Private, egress (audit), **what is not protected** | privacy-minded, developers | `design/approvals-…`, `design/mind-modes-…`, `design/vault-unlock-…`, `design/mind-egress-…`, README |
| `/apps` | the 16 apps, the Blender and LibreOffice adapters, the two shelved apps and why; each app's surface and grades | visitors, developers | README, `docs/app-control.md`, `design/shelved-…` |
| `/docs` | journey-organised: Start · Drive it · Build a surface · Attach a mind · Reference, rendered from `yantrik-os/docs` at a pinned commit, page bodies unedited, each with its source line | developers | `docs/**` |
| `/evidence` | the film, the token comparison with raw data, the footprint, the hardware table; every number on the site links here | developers, privacy-minded | `public/measure/*`, `docs/footprint.md` |

Navigation: Live · Download · Minds · Security · Apps · Docs · GitHub; on mobile a disclosure menu
with 44px targets.

## /live

- Framework-free page moved into this repo (`public/live/`), sharing the site's tokens and mark;
  hls.js self-hosted, so the CSP keeps `script-src 'self'` with no exception. nginx keeps the alias,
  the `/live/hls/` proxy and the CSP. The OS repo's `deploy/live/relay/www` is then removed.
- Layout: the player (1280×800, 3 fps, "low frame rate on purpose") and a context column:
  **What you are watching** (one install in a sealed VM, its own account, memory and sign-ins, no
  one's personal data) · **What reaches it** (nothing from here; the page reads a video stream) ·
  **How it is walled off** (one route through a gate the hypervisor enforces; the gate forwards only
  model calls and video; the stream's secrets live on the gate) · **Not yet shown** (what the mind is
  doing, its model, counts and uptime: the instance does not publish them yet). When the Pulse
  ships, that column is where it goes.
- States: Checking (first 3s) · Live (playhead moving) · Offline (`Offline since 18:04` only for an
  outage the page saw begin; "looks again every 15 seconds"; never a frozen frame) · Cannot play.
- Homepage pill: same-origin probe of `/live/hls/index.m3u8`; live if 2xx and the body starts with
  `#EXTM3U`.

## Visual tokens (from `crates/yantrik-design-tokens/slint/theme.slint`, "Calm Graphite")

| role | value | token |
|---|---|---|
| page | `#0e1117` | bg-deep (`#0b0d12` for the mark's ground) |
| surface | `#161b23` | bg-surface |
| card | `#212937` | bg-card |
| elevated | `#2c3545` | bg-elevated |
| text | `#f4f6fa` / `#c0c8d6` / `#95a1b4` | primary / secondary / dim (dim only ≥12px) |
| accent | `#38d8cd`, links `#74e6de` | accent / accent-light |
| amber | `#d4a574` | Plan, approvals, "trains on prompts", offline |
| danger | `#ef9a9a` | Bypass, dangerous, denied |
| success | `#26a69a` | live, ready, allowed |
| border | `rgba(255,255,255,0.07)` | border-subtle |
| mark only | `#2fd4c4`, violet `#8b5cf6` | brand/README.md |

Spacing on the 4px ladder; radii 6/8/12; content 1100–1200px; prose 70ch; one column at 375px;
tables wider than two columns become definition lists on mobile; figures carry the build they were
captured from.

## Build phases

0. **Foundations**: generated tokens, OS fonts, framer-motion and Inter removed, reduced-motion rule,
   skip link, header with mobile menu, footer, Section/Figure/Terminal/Claim/Limit/StatusPill;
   claims register and its check (done); Lighthouse, axe and link checks wired; Umami moved.
1. **Home, /live, /download**: the hero replica and replay, the homepage sections, /live moved and
   restyled, /download.
2. **/minds, /security, /apps, /evidence**: the grade table generated from `docs/app-control.md`; an
   approval walkthrough from the real card and the real JSON.
3. **/docs**: rendered from `yantrik-os/docs` at the pinned commit; journey index pages are the
   site's own; the build refuses a missing linked file; optional static search.
4. **Gates and upkeep**: every check blocks merge; a monthly re-capture against the current nightly.

## Checks

- **Lighthouse** (mobile, every page): performance ≥ 90, accessibility = 100, best practices ≥ 95,
  SEO ≥ 95; ≤ 150 KB JS gzip on `/`; LCP image ≤ 250 KB; no video before a click.
- **Accessibility**: axe at 375 and 1280, zero violations; keyboard paths through the menu, gallery,
  film, player and the hero's decision; visible focus; real alt text; `aria-live` on the Live pill;
  nothing under 12px; reduced motion honoured.
- **Links**: lychee over `out/`, external targets included, GitHub links at the pinned commit.
- **Claims**: `scripts/check-claims.mjs` (prebuild): every source must exist at the pinned commit and
  be checked within 60 days. Nothing on the current site that is not in the register survives:
  bond levels, message counts, "155 actions", "two minds", "six methods" are removed, not rephrased.
