# yantrikos.com: art direction and the signature experiences

By Fable 5.1, for Pranab's brief of 1 Oct 2026: "create amazing jaw dropping website for our OS, this
should not be generic and people saying look this is another generated website in a hurry." The
structural and honesty baseline is `redesign-plan-2026-10-01.md`; decisions taken since are in
`decisions.md`. Every geometry and colour below is the OS's own (files cited), so the site cannot be
mistaken for anyone else's.

Two corrections to the original brief, both honesty-critical:

1. In Ask mode an Allow does **not** write `mind-audit.jsonl` (that records only actions that ran
   *without* asking: auto, bypass, a session rule). It leaves a transcript record in the Lens:
   `Allowed once: notes.export — 14:07` (3px green bar); a Deny leaves `Denied: notes.export — 14:07`
   (red bar). The replica shows those lines and only those (`crates/yantrik-ui/src/approvals.rs`
   ~1174–1179).
2. The Allow branch needs the card pressed. Pranab allowed Claude to press it with a pointer click on
   VM 561 for this recording only (see `decisions.md`); the rule otherwise stands.

---

## A. Art direction

**The feeling.** A machine that is awake and still. The site should feel like the OS feels when you
read `status_bar.slint`: every pixel justified, every label saying where its value came from, nothing
moving unless something is happening. Not "futuristic", not "friendly AI": an instrument panel.

**References: what to borrow, what to refuse.**

| reference | borrow | refuse |
|---|---|---|
| Linear | product-as-hero; one typeface family doing all the work; headlines that are sentences; dark ground with hairline borders | gradient-glow hero backdrops |
| Vercel / Geist | sans + mono used structurally (mono = machine output, always); tables as first-class design; tabular figures | white-space-as-luxury; our page is denser, like the desktop |
| Teenage Engineering | every control carries its label and unit; small metadata under values; the object is the brand | playful colour blocking |
| Raycast | the realism of a UI component recreated in real HTML | hover glow, spring physics |
| Arc | letting the product chrome *be* the layout | gradient mesh, rounded-everything, mascots |

**Composition.**
- The desktop replica is the only full-bleed element. Everything else sits on a 12-column grid, max
  width 1200, 24px gutters (OS `sp-6`), left-aligned. No centred hero copy.
- Every section is a *surface* in the OS's four tiers: ground `#0b0d12` (the mark's ground) →
  `bg-surface #161b23` → `bg-card #212937` → `bg-elevated #2c3545`. A card carries `border-card
  #ffffff1f` ("a pane, not a hole"). Radii only from the scale 4/6/8/12/16.
- Value over label wherever a number appears: the number in `text-primary`, under it an 11px
  `text-dim` line naming its source (`measured 2026-09-06 · PSS · docs/footprint.md`). The OS's card
  grammar, and the claims register made visible.
- Section heads are sentences in Barlow 600, not nouns ("Every app says what a mind may do to it",
  not "Control Surfaces").

**Type.** Barlow (400, 500, 600) and JetBrains Mono (400, 500), self-hosted from
`crates/yantrik-design-tokens/slint/fonts/`. Inter is removed.

| role | size / weight / tracking | where |
|---|---|---|
| display | 64/600/−1.5px (≥1024); 44/600/−1px (<768, the OS's `fs-hero`) | one per page |
| display-sub | 17/400 (`fs-hero-sub`) | under the display |
| section head | 32/600/−0.5px | h2 |
| card title | 18/600 (`fs-title-1`) | h3 |
| body | 16/400, line-height 1.55 | prose |
| label | 12/400 `text-secondary` (`fs-caption`) | metadata |
| micro | 11/500, 1px tracking (`fs-micro`) | "where this came from" lines |
| mono | 13/400 (`fs-mono`), never resized | every terminal, trace and JSON line |

Inside the replica the OS scale is used verbatim: 14/12/11; status bar 32px; taskbar 40px.

**Colour.** One accent, `#38d8cd` (light `#74e6de`, dim `#1fa89b`). Amber `#d4a574`/`#e8c496`
means exactly one thing: an approval or Plan mode. Red `#ef9a9a` means Bypass, danger, denied. Green
`#26a69a` means an allowed record or a live service. Violet appears only in the mark's rim. No
gradients except the two the OS draws itself: the window frame's 180° border and the title bar's
holographic separator (`window_frame.slint` ~98–102, 239–248). No radial glows, mesh or blobs.

**Texture and light.** None. The OS has no blur and no grain. The only soft thing on the page is the
real wallpaper inside the desktop. "Light" is the OS's 1px top-edge reflection on cards, nothing more.

**Motion.** The OS rule: no continuous animation; the thinking pulse runs only while a mind thinks,
stepped at 5 fps.
- One orchestrated sequence per visit: the mark draws itself (~900ms), the status-bar clock appears,
  the replay starts. When the replay ends, the page is still.
- Only the OS durations: 120 / 200 / 300ms, ease-out. Windows appear with the frame's 200ms ease.
- The thinking dot exactly: `opacity = 0.55 + 0.45·sin(phase·2π)`, phase stepped 0.1 every 200ms, a
  `steps(10)` CSS animation running only while the trace says `thinking`.
- Nothing animates on scroll: no parallax, scroll-jacking, counters or typewriters.
- `prefers-reduced-motion`: the mark is drawn; the replay renders its states instantly, with a
  transcript (B.4).

**Sound.** None. The live stream has no audio and says so.

---

## B. The hero: a working Yantrik OS desktop

### B.1 Geometry

Laid out in the OS's own logical coordinates, **1280×800** (VM 561's display, the stream's size,
the size every geometry in `design/*.md` is written for), and scaled as one unit with
`transform: scale()`. Nothing reflows inside it, so every frame captured on 561 lines up
pixel-for-pixel with the HTML.

| viewport | scale | what the hero is |
|---|---|---|
| 1440 | 1.0, centred, wallpaper bleeding behind | headline above (56px gap), desktop, caption under |
| 1280 | 1.0, full-bleed | same |
| 1024 | 0.8 | same; card buttons 26px tall, still clickable |
| 768 | — | the **feed build**, two columns |
| 375 | — | the feed build, one column |

Below 0.8 the 11px labels stop being readable, so there is never a shrunken desktop.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ (Y)● Yantrik                                 CPU 4% MEM 1.9G │ ⛨ Ask  ◎ Yantrik Mind  ⊕ ⏻ 14:07 Wed 1 Oct │ 32px status bar
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ ░░ wallpaper (561's real PNG) ░░                                    ┃ Lens · Yantrik Mind  ┃ │
│ ┌─ labwc - WL-1 ─────────────────────────────── ▁ ▢ ✕ ┐            ┃ you  Read the Debian ┃ │
│ │ ┌─ Browser ── debian.org/releases/trixie ──────── ┐ │            ┃      13 release …    ┃ │
│ │ │ [captured page, Chromium content area]          │ │            ┃ ▮ Yantrik Mind       ┃ │
│ │ └─────────────────────────────────────────────────┘ │            ┃   Read 3 pages, …    ┃ │
│ │ ┌─ Notes ── Debian 13 — what changed ──────────── ┐ │            ┃ ┌──────────────────┐ ┃ │
│ │ │ # Debian 13 — what changed                      │ │            ┃ │● Yantrik Mind 3s │ ┃ │ card x = W−420,
│ │ │ 1. …                                            │ │            ┃ │says the caller · │ ┃ │ width 404, y = 48,
│ │ └─────────────────────────────────────────────────┘ │            ┃ │verified by this  │ ┃ │ border amber
│ └─────────────────────────────────────────────────────┘            ┃ │notes.export      │ ┃ │
│        Mind View (nested labwc, radius 10)                          ┃ │[ Deny ][Allow once]│┃ │
│                                                                     ┃ └──────────────────┘ ┃ │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ [⊞ Apps] │ [▣ Mind View] │                                 │ [● Chat · Yantrik Mind]      ▕ │ 40px taskbar
└──────────────────────────────────────────────────────────────────────────────────────────────┘
  replay of a session recorded on VM 561 · <date> · build <id> · played at Nx · raw trace ↗
```

Approval card: `x = W−420`, width 404, top `y = 48` (`design/approvals-2026-09-21.md` ~325–327);
Deny centre `x = W−315`, Allow centre `x = W−121`. The mind panel is hidden while the Lens is open
(`app.slint` ~295); it is drawn expanded (302px) in the opening state.

**The feed build (≤768).** Not a compromise: how the OS itself shows an agent's work on a narrow
surface (the mind panel's Working/Recent, the Agents pane). The real status bar at 1:1 (it already
hides CPU/MEM below 1100 and the date below 1000), then one row per tool call in the Agents card
grammar (mono 13: `14:06:51  os_act shell.open_app  browser → Mind View  ok`), window frames at 1:1
*cropped*, not scaled, and **the real approval card at 343px, 1:1, every row**. The card is
unchanged because the card is the argument. Then the real taskbar.

```
┌───────────────────────────────────┐
│(Y)● Yantrik   ⛨ Ask ◎ Y.Mind ⏻ 14:07│
├───────────────────────────────────┤
│ A mind did a job on this machine. │  44/600
│ You decide the one step that      │
│ leaves it.                        │
│ ▮ 14:06:51  shell.open_app        │
│   browser → in Mind View    ok    │
│ ┌─ Browser · debian.org ───────┐  │
│ │ [crop, 343×180]              │  │
│ └──────────────────────────────┘  │
│ ▮ 14:07:19  waiting for you       │
│ ┌──────────────────────────────┐  │
│ │ ● Yantrik Mind           3s  │  │  the real card, 1:1
│ │ [  Deny  ] [ Allow once ]    │  │
│ └──────────────────────────────┘  │
├───────────────────────────────────┤
│ [⊞ Apps]│[▣ Mind View]│[● Chat ·…]│
└───────────────────────────────────┘
```

### B.2 What is recreated, and how exactly

| piece | fidelity | source |
|---|---|---|
| Status bar | exact | `status_bar.slint`: 32px, `glass-panel #161b23e0`, 1px separator; mark 20px, 6px state dot with stepped pulse, "Yantrik" 14/600; CPU/MEM 11px (≥1100); **mode chip** 20px pill, 12px shield/eye icon, 11/500 (Ask `hover-fill`; Plan `tint-amber` + amber + eye; Bypass `color-danger-dim`, 1px red border, 700, countdown); **mind chip** (`tint-accent`, accent text, shown when the harness is not the companion); network 13px; power 13px; clock 12/500; date 12 dim (≥1000) |
| Taskbar | exact | `taskbar.slint`: 40px glass, 1px top separator; `[Apps]` accent button 13/600 on `#101820`; entries = 22px AppTile + 12px title, active entry `hover-fill-strong` + 24×3 accent underline; `Chat · Yantrik Mind` outlined with a 6px dot |
| Mind View window | exact frame, captured content | `config/labwc-mind/rc.xml`, `config/labwc/themerc`: radius 10, Barlow 10 medium title "labwc - WL-1", no shadow; copy themerc colours exactly |
| Browser inside Mind View | labwc frame in HTML, page as captured bitmap | `grim` crops of the content area per navigation step |
| Notes inside Mind View | frame exact, content reconstructed | `notes_editor.slint`, AppHeader 48px; text from the trace, typed as `set_content` lands |
| Lens (chat) | exact | `intent_lens.slint` ~981+, `message_bubble.slint`: right-docked, "Lens · Yantrik Mind", bubbles, disabled reply box |
| Approval card | exact, every row | `intent_lens.slint` ~138–788: `bg-card` opaque, `r-lg`, 1px `color-warning` border (sensitive), shadow 18, padding 12, gap 8. Rows in order: amber dot + requester 11/600 + age · "says the caller · nothing on this machine checked that name" · verified line · "verified by this machine · the kernel said so, not the caller" · agent line · action 14/600 · summary 12 · "what it does · the app's own first sentence" · purpose clamped 42px + "show more" · "says the app about the action · the same for every call of it" · args box (`bg-input`, mono 13) · "asked for in this call · the grant is bound to exactly these" · "Graded sensitive. Allowing covers this one action, once." · **Deny** (filled `bg-elevated`) then **Allow once** (amber outline, `amber-light` text), both 32px `r-md` · "Allow … for this session" 30px dim · "covers every mind and caller, until restart or the mode is lowered" |
| Decided record | exact | same file ~184–206: 3px bar (success/danger) + 12px dim text |
| Mind panel, pre-Lens | exact | `mind_panel.slint`: 302px, MindMark 34px disc, SectionLabel 11px, KeyValue 22px rows, StateDot 7px |
| Window frame | exact | `window_frame.slint` (built for section C even if the session does not use it) |
| Wallpaper | captured | 561's current preset PNG |

Icons: the ~137 stroke paths in `crates/yantrik-ui-kit/slint/icon.slint` are ported by a build script
to `icons.ts` (20×20 viewbox, 1.6 stroke, round caps). Nobody hand-draws an icon.

### B.3 Timeline format

One JSON per recording, assembled at build from the raw captures. The engine knows only this shape:

```jsonc
{
  "meta": { "machine": "VM 561 · public live instance · 1280x800", "build": "v0.1.0-NNN-g…",
            "mind": "Yantrik Mind <commit>, local lane through the gate", "mode": "ask", "mind_view": true,
            "recorded": ["<allow run start>", "<deny run start>"], "raw": "/replay/<date>/",
            "sha256": { "allow.jsonl": "…", "deny.jsonl": "…" } },
  "poster": "s00",
  "steps": [
    { "id": "s00", "t": 0, "kind": "state", "set": { "clock": "14:06", "mind": "idle", "windows": [], "lens": null } },
    { "id": "s01", "t": 1200, "kind": "rpc",
      "rpc": { "method": "shell.app.act", "params": { "action": "open_app", "args": { "name": "browser" } }, "result": {}, "ms": 410 },
      "ui": [ { "fx": "mind.state", "v": "thinking" }, { "fx": "window.open", "app": "browser", "in": "mind_view" },
              { "fx": "taskbar.window", "app": "mind-view", "label": "Mind View", "active": true } ] },
    { "id": "s09", "t": 14800, "kind": "approval",
      "card": { "requester": "Yantrik Mind", "verified": "…", "app": "notes", "action": "export",
                "summary": "…", "purpose": "…", "args": ["path: ~/Documents/…"], "grade": "sensitive", "can_session": true },
      "ui": [ { "fx": "lens.open" }, { "fx": "lens.card" }, { "fx": "mind.state", "v": "waiting" } ],
      "branch": { "allow": "a01", "deny": "d01" } },
    { "id": "a01", "after": "s09", "t": 0, "kind": "rpc", "rpc": { "…": "the export with its grant, and its real result" },
      "ui": [ { "fx": "lens.record", "kind": "allowed", "text": "Allowed once: notes.export — 14:07" },
              { "fx": "lens.message", "from": "mind", "text": "<the mind's real words>" } ] },
    { "id": "d01", "after": "s09", "t": 0, "kind": "ui",
      "ui": [ { "fx": "lens.record", "kind": "denied", "text": "Denied: notes.export — 14:21" },
              { "fx": "lens.message", "from": "mind", "text": "<the mind's real words from the deny run>" } ] },
    { "id": "end", "kind": "end", "ui": [ { "fx": "caption", "text": "That was a replay of a real session on Yantrik OS. The one running now is live →", "href": "/live" } ] }
  ]
}
```

- `t` comes from the harness log and is compressed by one factor the caption states ("played at 5×;
  step times are the recording's"). Steps after a branch carry `after` and `t` relative to the choice.
- Effects are a closed enum (`mind.state`, `window.open/close/focus`, `browser.page`, `notes.text`,
  `lens.open/message/card/record`, `taskbar.window`, `mind_panel.set`, `clock`, `mode_chip`,
  `caption`). The build rejects unknown effects. Nothing on screen is driven by anything but a
  captured call or event.
- The mind's words are whatever it actually said. We never script the model.

### B.4 Playback and interaction

- A pure reducer `(state, effect) → state` and a scheduler of `setTimeout` deltas; ~4 KB gzip.
- **Poster first.** The static build renders the hero at the `poster` state, so the desktop is on
  screen with no JS. The timeline (~60–80 KB, bitmaps lazily) loads after `load`.
- Starts when the hero is ≥60% visible and the document is visible, after the mark's draw on the
  first start. Pauses when hidden or <40% visible; resumes where it stopped.
- Controls, bottom-right outside the taskbar, 11px dim: Skip to the decision / Skip to the end,
  Replay, Pause. Real buttons with labels; Space and R only while the hero has focus.
- **The decision waits indefinitely.** Both buttons are real `<button>`s, Deny first in tab order as
  the OS draws it. The session row is drawn but `aria-disabled` ("in the replay only Allow once and
  Deny were recorded").
- Reduced motion: no scheduler. The desktop renders at the card; an open `<details>` transcript
  lists every prior step in mono. The visitor chooses; the final state appears and the transcript
  gains the branch's lines.
- No JS or a failed fetch: the poster, and a link to the plain-text transcript. Never a blank frame.
- The clock shows the recorded time and ticks with the recording; the caption says so.

### B.5 The session

Given to Yantrik Mind through the Lens, verbatim:

> Read the Debian 13 trixie release notes on debian.org, write a five-point note in Notes called
> 'Debian 13 — what changed', then export it to ~/Documents/debian-13-notes.md.

Why: Browser renders a real public page (no login, stable URL) inside Mind View; Notes shows text
appearing; `notes.export` is graded `sensitive` by the app itself (`apps/notes/src/main.rs`
~1699–1711), so the card carries no red warning and does offer the session row: the full card.

**Check before recording:** `set_content` may itself be `sensitive` (`apps/notes/src/main.rs`
~1284), which would raise a card earlier. Verify with `yos describe notes --brief` on 561. Either the
mind uses standard actions to write, or the first card is part of the story too.

Two runs of the same task, mode Ask, Mind View on:
- **Allow once**: the export runs with the grant; the file exists; the Lens records
  `Allowed once: …`; the mind's completion message; the note is still open.
- **Deny**: the Lens records `Denied: …`; the mind's own next sentence, whatever it is.

Fallback if debian.org is slow from 561: the labwc 0.8 release notes on GitHub. Nothing about Yantrik
itself, nothing behind a login.

### B.6 Keeping it honest

- Caption under the desktop, always visible, 12px: `Replay of a session recorded on VM 561 on
  <date> · build <id> · played at Nx · the Deny branch is a second recording at HH:MM · raw trace ↗`.
- `/replay/<date>/` publishes `allow.jsonl`, `deny.jsonl`, uncropped `screens/*.png`, `BUILD`,
  `transcript.txt` and the assembled `timeline.json`.
- Every number in the hero copy (pages read, calls made, seconds) is computed from the trace at
  build, never typed. The replay has its own claims-register entry, with the raw directory as source.

---

## C. Homepage, section by section

Order follows the argument: see it → read what happened → why structure beats pixels → who decides →
which minds → which apps → it is running now → what it costs → take it.

| # | section | what makes it ours | shows | motion |
|---|---|---|---|---|
| 1 | Hero: the desktop | the product is the layout; headline above it, Barlow 600 64px, left-aligned, two lines: "A desktop a mind can use. You still hold the keys." | the replay | the one orchestrated sequence |
| 2 | What just happened | a ledger of the replay the visitor just watched, in `yos`'s own grammar: `14:06:51  browser.go url=…  [standard, settles on return]  1.9s`. The visitor's own choice is in it, marked with the 3px bar | the session's calls, pages, seconds, computed from the trace | lines appear as the replay made them; still afterwards |
| 3 | Structure, not pixels | two columns that *are* the payloads: left, 7 real 1280×800 screenshots with their token cost `7 × 1,365 = 9,555`; right, the real `describe calendar` reply in mono, `2,326`. Source line `public/measure/calendar-task.json · o200k_base · same task, same machine` | the measured data | none |
| 4 | Who decides | the decision table drawn with the OS's own ModeRow components (44px, selected row with a 4px accent bar), grades down the side, cells `run / ask / refuse / run (logged)`; under it three real chips: Ask grey, Plan amber, `Bypass 14m` red, the countdown from a recorded 15-minute bypass and its "Bypass ended" toast | `design/mind-modes-2026-09-21.md`; the mode vectors | the countdown ticks in recorded time while focused |
| 5 | Any mind | the harness methods as a `<pre>` exactly as `docs/harness.md` prints them; a MindMark disc per mind 561 reports; "The OS has nowhere to put your key", with the test that enforces it | real list from 561 | none |
| 6 | The apps | the real launcher tiles (each app's own colour and stroke glyph) in one row, each with its describe summary from `yos ls` on 561 and its counts per grade | generated per release | hover shows the app's actions in mono (120ms) |
| 7 | Live | a WindowFrame (12px radius, gradient border, holographic separator) titled "VM 561 · live", with the stream's still or the stream; its title bar carries an honest pill: `● live · 3 fps · 1280×800 · no audio` or `○ offline since HH:MM`; links to /live | the live machine | the pill's dot only |
| 8 | What it costs | the process table in mono exactly as `docs/footprint.md` prints it; total `186 MB` value-over-label with `measured 2026-09-06 · PSS` | footprint, ISO size, build | none |
| 9 | Take it | the download as a BUILD block: `name=…`, `sha256=…`, `size=…`, `channel=nightly`, each line copyable; one accent button | the release JSON | none |
| 10 | Footer | the wordmark, the claims register link, the raw trace link, repo, licence | — | none |

Removed outright: the typewriter, the floating orb, the four-big-numbers stats bar, the screenshot
carousel (screens now live as evidence in 3 and 6), the features grid.

---

## D. "Describe this page"

- A `Describe` switch in the nav (`role="switch"`, `aria-checked`). On: every section gets a 1px
  `border-strong` outline and a tab at its top-right (mono 11, `bg-elevated`) reading
  `yos describe hero`. Activating a tab opens a right-docked panel in the Lens's geometry (420px,
  glass, 32px header "describe · hero · revision a3f9…") holding the section's JSON, tinted in the
  OS's result colours. Escape closes and returns focus.
- The same JSON is served statically at `/describe.json` and `/describe/<id>.json`, so `curl` works:
  the site really does publish what it holds.
- Schema per section, the OS's View envelope verbatim (`control_surface.rs`): `summary`, `revision`
  (FNV-1a over summary + state), `state` (section, replay position, the claims it shows with their
  evidence, its limits), `actions` (e.g. `skip_to_decision`, `choose { answer: allow|deny }`,
  `open_raw_trace`), each with `permission` and `settles`.
- Grades are honest: everything a web page can do is `safe`; `download_iso` is `standard` ("Starts a
  browser download; the browser, not this page, writes the file"). The panel's footer: "This site is
  not a Yantrik surface. It borrows the shape so you can read it the way a mind reads the OS."
- Accessibility: each section has `aria-labelledby` (its h2) and `aria-describedby` → a hidden copy of
  its summary, so screen readers get it with the switch off. The panel is `role="dialog"`,
  `aria-modal="false"`; focus moves in and back; the `<pre>` is focusable. A live region announces
  "Describe on. 10 sections." The choice is remembered in localStorage.

---

## E. Tech

- Next.js 16, `output: "export"`. Remove framer-motion (~33 KB gzip) and lucide-react. Tailwind v4
  stays for layout; every colour and size comes from a generated `tokens.css`, built by a script that
  reads `theme.slint` and `app_color.slint` (dark values) and fails the build if a token the site uses
  has gone from the OS.
- The replica is React + CSS + SVG, no canvas. The only bitmaps are the wallpaper, page captures and
  Mind View's empty frame. `transform: scale()` on the 1280×800 root keeps text crisp.
- `src/os/`: tokens.css, icons.ts (generated), StatusBar, Taskbar, AppTile, WindowFrame, LabwcFrame,
  MindView, Lens, ApprovalCard, MindPanel, ModeChip, MindMark. `src/replay/`: schema, reducer,
  scheduler, useReplay, Hero, FeedHero. `src/describe/`: generated JSON, DescribeSwitch,
  DescribePanel. `public/replay/<date>/`: raw captures.
- Budget: hero interactive under 150 KB JS gzip (React + Next ≈ 90, os ≈ 18, replay ≈ 6, describe ≈
  3), enforced by size-limit in CI. Timeline ≤ 80 KB after `load`; page bitmaps WebP ≤ 45 KB each,
  fetched two steps ahead.
- Fonts via `next/font/local` from the OS's own font files; tabular figures on every number.
- Poster: the static hero, plus a captured frame for the OG image and `<noscript>`.
- Strict CSP. /live stays framework-free, as decided.

---

## F. Capture on VM 561

Preconditions, verified not assumed: current nightly (`/opt/yantrik/BUILD`), 1280×800, no personal
data, idle lock off, Yantrik Mind attached through the gate, mode Ask, Mind View on. Everything as
the desktop user with `XDG_RUNTIME_DIR=/run/user/1000 WAYLAND_DISPLAY=wayland-0`.

0. Identity: `cat /opt/yantrik/BUILD`; `yos describe shell` (mode, Mind View, harness, clock);
   `yos ls`; `yos describe notes --brief` and `browser --brief` (settles the `set_content` grade).
1. Static assets: `grim` the idle desktop with the mind panel expanded; the wallpaper preset PNG;
   Mind View's `empty.png`; labwc `themerc`. Mode chips for section 4: Plan via
   `yos act shell set_mind_mode mode=plan` then a capture; back to Ask via the menu; a 15-minute
   Bypass via the menu (a pointer click on the menu is fine; it is not a card), its chip, its lapse,
   and the "Bypass ended" toast.
2. Recorders started before the task: `grim` every 0.33s; `yos describe shell` state at 2 Hz;
   the harness's own journal (`journalctl --user -u yantrik-mind -o json`); `yos describe notes`
   once a second. Check first what `.state.agents` holds on this build; if tool cards are not there,
   the harness journal is the timeline.
3. Run 1, Allow: the task sentence in the Lens; Browser opens **in Mind View**; Notes opens; the card
   rises; **Allow once** is pressed. Then: final capture, `describe notes`, the exported file, and
   confirm no new `mind-audit` entry (Ask mode). Stop recorders; checksum everything.
4. Reset (remove the file; delete the note, minding its grade), then Run 2, Deny, same sentence;
   capture the mind's reply verbatim; checksum.
5. Section assets: `yos web all` after each page (the text the mind read); `yos describe <app>` for
   every app → counts per grade into `src/data/surfaces.json` with the build id; Browser content-area
   crops from the uncropped frames at build, never retouched.
6. Publish `public/replay/<date>/`. Nothing goes in that was not captured on 561.

---

## G. The anti-generic checklist

The result fails if any of these fails.

1. Every image is our OS: no stock, illustration, 3D render or icon pack; every bitmap traces to a
   capture or a brand SVG.
2. No gradient blobs, glows, meshes or grain: `grep -r "radial-gradient\|blur(" src/` finds only the
   OS's two gradients.
3. No three-column feature grid of equal cards with an icon, a title and two lines.
4. No typewriter, counting numbers or infinite animation: `infinite` appears only on the stepped
   thinking pulse, gated on `thinking`.
5. The hero is interactive within 150 KB gzip of JS; the poster shows with JS disabled.
6. No Inter. Barlow and JetBrains Mono only; machine output is never resized from 13px.
7. Every token is the OS's: `tokens.css` is generated; a hand-written hex in `src/os/` fails the build.
8. The overlay test: a frame captured on 561 laid over the HTML at 1280×800 lines up on the status
   bar, taskbar, card edges and button centres within 2px.
9. Every number has a source line under it, and the source resolves. No number is typed into JSX.
10. The hype-word gate passes: none of revolutionary, seamless, powerful, effortless, magical,
    next-generation, supercharge, unleash, reimagined, blazing.
11. Limits sit beside what they qualify: the recorded clock, the two-run branch, no audio, offline
    since, "not a Yantrik surface".
12. The Deny branch shows the mind's real words, unedited.
13. Describe on, keyboard only: Tab to a section's tab, Enter opens, Escape closes and focus returns;
    a screen reader gets each section's summary with the switch off.
14. Reduced motion is a real path: transcript rendered, the decision still works, the final state
    appears.
15. A stranger's test: someone who has never seen Yantrik can say within ten seconds "that's a
    desktop, an agent is doing something, and it's asking me". If not, the composition is wrong.
