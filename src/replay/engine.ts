// The replay's player: given a timeline, a playback clock and the visitor's answer, the replica's
// state at that moment. Pure and deterministic: no DOM, no timers, no randomness, no Date.now().
// The hero owns the clock; this file only says what the screen holds at a given time.
//
// What it promises (design/replay-timeline.md, "Rules the engine keeps"):
//   - events are applied in the order they were recorded, never sorted or merged;
//   - nothing is invented: every value in the state came from an event, verbatim;
//   - an idle gap longer than MAX_GAP is played as MAX_GAP, and the state says by how much the
//     lists played so far were shortened, so the page can say so;
//   - the card waits: with no answer, the state stops at the card, however late the clock;
//   - reduced motion changes nothing here. `present()` is the only place a typing reveal is
//     applied, and with reduced motion it returns the state untouched.

import type { Event, EventOf, Timeline } from "./types";

/** The longest idle gap played as it was. Anything longer is played at this length. */
export const MAX_GAP = 1500;
/** The typing reveal: this long per character, never longer than TYPE_MAX, never past the next event. */
export const TYPE_MS_PER_CHAR = 18;
export const TYPE_MAX = 1200;

export type Answer = EventOf<"card_answer">["answer"];
export type Phase = "prefix" | Answer;

/** One event placed on the playback clock: `at` is when it plays, `event.t` when it happened. */
export type Played = { event: Event; index: number; at: number };

export type PlayedList = {
  events: Played[];
  /** Playback length: the last event's `at`. */
  duration: number;
  /** Recorded length: the last event's `t`. */
  recorded: number;
  /** How much idle time was cut, in ms, and from how many gaps. */
  shortenedMs: number;
  shortenedGaps: number;
};

export type Prepared = {
  timeline: Timeline;
  prefix: PlayedList;
  deny: PlayedList;
  allow_once: PlayedList;
};

/** Where the visitor is: before answering (the prefix), or t ms into the branch they chose. */
export type Clock = { answer: Answer | null; t: number };

export type WindowState = { app: string; title: string };

export type ToolItem = {
  kind: "tool";
  key: string;
  id: string;
  tool: string;
  app: string;
  action: string;
  args: object;
  result: { ok: boolean; summary: string } | null;
};
export type TranscriptItem = { kind: "user"; key: string; text: string } | { kind: "mind"; key: string; text: string } | ToolItem;

export type CardState = Omit<EventOf<"card">, "t" | "type"> & {
  /** null while it waits. */
  answer: Answer | null;
  /** When it came up, in recorded ms since `source.recorded`. */
  realMs: number;
};

export type FileState = { path: string; exists: boolean; bytes?: number };

/** A run of text being revealed as it lands: characters [from, to) of its target, over [at, until). */
export type Reveal = { target: "notes" | "transcript"; key: string; from: number; to: number; at: number; until: number };

export type ReplayState = {
  phase: Phase;
  /** The playback clock within the phase's list, clamped to its length. */
  t: number;
  duration: number;
  /** playing: more to come · waiting: the card is up and unanswered · ended: the branch is over. */
  status: "playing" | "waiting" | "ended";
  /** Recorded time since `source.recorded`, in ms, for the clock on the status bar. */
  realMs: number;
  /** The windows open, in the order they opened. */
  windows: WindowState[];
  /** The app whose window was last brought to the front, while it is open. */
  front: string | null;
  notes: { title: string; body: string } | null;
  transcript: TranscriptItem[];
  thinking: boolean;
  card: CardState | null;
  files: FileState[];
  /** How many events of the phase's list have been applied (the prefix's, then the branch's). */
  applied: number;
  /** The last event applied, of any list. */
  last: Event | null;
  /** Idle time cut from the lists played so far. */
  shortenedMs: number;
  compressed: boolean;
  reveals: Reveal[];
};

/** Places a list's events on the playback clock, shortening idle gaps. Never reorders. */
export function compress(events: Event[], maxGap = MAX_GAP): PlayedList {
  let at = 0;
  let prevT = 0;
  let shortenedMs = 0;
  let shortenedGaps = 0;
  const out: Played[] = [];
  events.forEach((event, index) => {
    // A time earlier than the one before it is a bad recording (validate() reports it); it is
    // still played in its place, with no gap, rather than moved.
    const gap = Math.max(0, event.t - prevT);
    const played = Math.min(gap, maxGap);
    if (played < gap) {
      shortenedMs += gap - played;
      shortenedGaps += 1;
    }
    at += played;
    prevT = Math.max(prevT, event.t);
    out.push({ event, index, at });
  });
  return { events: out, duration: at, recorded: prevT, shortenedMs, shortenedGaps };
}

export function prepare(timeline: Timeline, maxGap = MAX_GAP): Prepared {
  return {
    timeline,
    prefix: compress(timeline.prefix, maxGap),
    deny: compress(timeline.branches.deny, maxGap),
    allow_once: compress(timeline.branches.allow, maxGap),
  };
}

/** Recorded ms at playback time p: linear between the events, so a shortened gap runs fast. */
export function realAt(list: PlayedList, p: number): number {
  let a = 0;
  let ta = 0;
  for (const e of list.events) {
    if (e.at > p) {
      const span = e.at - a;
      return span > 0 ? ta + ((p - a) * (e.event.t - ta)) / span : e.event.t;
    }
    a = e.at;
    ta = Math.max(ta, e.event.t);
  }
  return ta + (p - a);
}

const codePoints = (s: string) => Array.from(s);

function commonPrefix(a: string, b: string): number {
  const x = codePoints(a);
  const y = codePoints(b);
  let i = 0;
  while (i < x.length && i < y.length && x[i] === y[i]) i++;
  return i;
}

function empty(phase: Phase): ReplayState {
  return {
    phase,
    t: 0,
    duration: 0,
    status: "playing",
    realMs: 0,
    windows: [],
    front: null,
    notes: null,
    transcript: [],
    thinking: false,
    card: null,
    files: [],
    applied: 0,
    last: null,
    shortenedMs: 0,
    compressed: false,
    reveals: [],
  };
}

/** Applies one event to the state, in place. `realBase` is the list's start in recorded ms. */
function apply(s: ReplayState, e: Event, key: string, realBase: number) {
  switch (e.type) {
    case "user_message":
      s.transcript.push({ kind: "user", key, text: e.text });
      break;
    case "mind_message":
      s.transcript.push({ kind: "mind", key, text: e.text });
      break;
    case "mind_thinking":
      s.thinking = e.on;
      break;
    case "tool_call":
      s.transcript.push({ kind: "tool", key, id: e.id, tool: e.tool, app: e.app, action: e.action, args: e.args, result: null });
      break;
    case "tool_result": {
      // The last call with this id; a result with no call is reported by validate(), not drawn.
      for (let i = s.transcript.length - 1; i >= 0; i--) {
        const item = s.transcript[i];
        if (item.kind === "tool" && item.id === e.id) {
          s.transcript[i] = { ...item, result: { ok: e.ok, summary: e.summary } };
          break;
        }
      }
      break;
    }
    case "window": {
      const i = s.windows.findIndex((w) => w.app === e.app);
      if (e.state === "closed") {
        if (i >= 0) s.windows.splice(i, 1);
        if (s.front === e.app) s.front = null;
      } else {
        if (i >= 0) s.windows[i] = { app: e.app, title: e.title };
        else s.windows.push({ app: e.app, title: e.title });
        if (e.state === "front") s.front = e.app;
      }
      break;
    }
    case "notes":
      s.notes = { title: e.title, body: e.body };
      break;
    case "card": {
      const { t, type, ...card } = e;
      void type;
      s.card = { ...card, answer: null, realMs: realBase + t };
      break;
    }
    case "card_answer":
      if (s.card) s.card = { ...s.card, answer: e.answer };
      break;
    case "file": {
      const f: FileState = e.bytes === undefined ? { path: e.path, exists: e.exists } : { path: e.path, exists: e.exists, bytes: e.bytes };
      const i = s.files.findIndex((x) => x.path === e.path);
      if (i >= 0) s.files[i] = f;
      else s.files.push(f);
      break;
    }
  }
}

/** Plays one list up to playback time p onto the state. Returns how many events it applied. */
function play(s: ReplayState, list: PlayedList, p: number, phase: Phase, realBase: number, reveals: boolean): number {
  let n = 0;
  for (let k = 0; k < list.events.length; k++) {
    const { event, index, at } = list.events[k];
    if (at > p) break;
    const key = `${phase}:${index}`;
    const before = event.type === "notes" && s.notes && s.notes.title === event.title ? s.notes.body : "";
    apply(s, event, key, realBase);
    s.last = event;
    n++;
    if (!reveals) continue;
    // The text that landed with this event, revealed until the next event lands.
    const next = list.events[k + 1]?.at ?? Infinity;
    const reveal = (target: Reveal["target"], from: number, to: number) => {
      const until = Math.min(at + (to - from) * TYPE_MS_PER_CHAR, at + TYPE_MAX, next);
      if (to > from && until > at && p < until) s.reveals.push({ target, key, from, to, at, until });
    };
    if (event.type === "mind_message") reveal("transcript", 0, codePoints(event.text).length);
    if (event.type === "notes") reveal("notes", commonPrefix(before, event.body), codePoints(event.body).length);
  }
  return n;
}

/** The replica's state at a moment of the replay. */
export function stateAt(p: Prepared, clock: Clock): ReplayState {
  const phase: Phase = clock.answer ?? "prefix";
  const s = empty(phase);
  const prefixRealEnd = p.prefix.recorded;

  if (clock.answer === null) {
    const t = Math.max(0, Math.min(clock.t, p.prefix.duration));
    s.applied = play(s, p.prefix, t, "prefix", 0, true);
    s.t = t;
    s.duration = p.prefix.duration;
    s.realMs = realAt(p.prefix, t);
    s.shortenedMs = p.prefix.shortenedMs;
    const done = s.applied === p.prefix.events.length;
    s.status = !done ? "playing" : s.card && s.card.answer === null ? "waiting" : "ended";
  } else {
    const list = p[clock.answer];
    const t = Math.max(0, Math.min(clock.t, list.duration));
    play(s, p.prefix, Infinity, "prefix", 0, false);
    s.applied = play(s, list, t, clock.answer, prefixRealEnd, true);
    s.t = t;
    s.duration = list.duration;
    s.realMs = prefixRealEnd + realAt(list, t);
    s.shortenedMs = p.prefix.shortenedMs + list.shortenedMs;
    s.status = s.applied === list.events.length ? "ended" : "playing";
  }
  s.compressed = s.shortenedMs > 0;
  return s;
}

/**
 * What the screen draws: the state, with any text still landing cut to what has been typed so
 * far. With reduced motion it is the state itself, unchanged; and once every reveal has finished
 * the two are equal, so reduced motion is the same replay, not a different one.
 */
export function present(s: ReplayState, opts: { reducedMotion: boolean }): ReplayState {
  if (opts.reducedMotion || s.reveals.length === 0) return s;
  const cut = (text: string, r: Reveal) => {
    const shown = r.from + Math.floor(((r.to - r.from) * (s.t - r.at)) / (r.until - r.at));
    return codePoints(text).slice(0, Math.max(r.from, Math.min(r.to, shown))).join("");
  };
  let notes = s.notes;
  let transcript = s.transcript;
  for (const r of s.reveals) {
    if (r.target === "notes" && notes) notes = { ...notes, body: cut(notes.body, r) };
    if (r.target === "transcript") transcript = transcript.map((m) => (m.key === r.key && m.kind === "mind" ? { ...m, text: cut(m.text, r) } : m));
  }
  return { ...s, notes, transcript };
}

/** The next playback time at which the state changes, or null if none will without an answer. */
export function nextChange(p: Prepared, s: ReplayState): number | null {
  if (s.reveals.length) return s.t; // typing: every frame
  const list = s.phase === "prefix" ? p.prefix : p[s.phase];
  const next = list.events.find((e) => e.at > s.t);
  return next ? next.at : null;
}

// ── Time as the recording's clock showed it ───────────────────────────────────────────────────

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * The wall-clock fields of an ISO time as it was written (its own offset, not the viewer's zone),
 * moved on by ms. Deterministic: the same timeline reads the same everywhere.
 */
function wall(iso: string, ms = 0) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?/.exec(iso);
  if (!m) return null;
  const base = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] ?? 0), Number(`0.${m[7] ?? 0}`) * 1000);
  const d = new Date(base + ms);
  return { y: d.getUTCFullYear(), mo: d.getUTCMonth(), d: d.getUTCDate(), wd: d.getUTCDay(), h: d.getUTCHours(), mi: d.getUTCMinutes() };
}

const two = (n: number) => String(n).padStart(2, "0");

/** "14:07": the status bar's clock, `ms` after the recording began. */
export function clockText(recorded: string, ms = 0): string {
  const w = wall(recorded, ms);
  return w ? `${two(w.h)}:${two(w.mi)}` : "";
}

/** "Thu 1 Oct": the status bar's date. */
export function dateText(recorded: string, ms = 0): string {
  const w = wall(recorded, ms);
  return w ? `${WEEKDAYS[w.wd]} ${w.d} ${MONTHS[w.mo]}` : "";
}

/** "1 Oct 2026": the caption's date. */
export function longDateText(recorded: string): string {
  const w = wall(recorded);
  return w ? `${w.d} ${MONTHS[w.mo]} ${w.y}` : "";
}

/** "Oct 1 · 14:06": how the Notes library dates a note. */
export function notesDateText(recorded: string, ms = 0): string {
  const w = wall(recorded, ms);
  return w ? `${MONTHS[w.mo]} ${w.d} · ${two(w.h)}:${two(w.mi)}` : "";
}

// ── Checking a timeline before it is played ───────────────────────────────────────────────────

/** Everything wrong with a timeline, as sentences. Empty means it can be played. */
export function validate(tl: Timeline): string[] {
  const problems: string[] = [];
  if (tl?.version !== 1) return ["version is not 1"];
  if (!Array.isArray(tl.prefix) || !tl.branches || !Array.isArray(tl.branches.deny) || !Array.isArray(tl.branches.allow)) {
    return ["prefix and branches.deny/allow must be lists"];
  }
  const lists: [string, Event[]][] = [
    ["prefix", tl.prefix],
    ["deny", tl.branches.deny],
    ["allow", tl.branches.allow],
  ];
  for (const [name, list] of lists) {
    let prev = 0;
    list.forEach((e, i) => {
      if (typeof e.t !== "number" || !Number.isFinite(e.t) || e.t < 0) problems.push(`${name}[${i}]: t is not a time`);
      else if (e.t < prev) problems.push(`${name}[${i}]: t ${e.t} is earlier than the event before it (${prev})`);
      else prev = e.t;
    });
  }
  const cards = tl.prefix.filter((e) => e.type === "card").length;
  if (cards !== 1) problems.push(`the prefix holds ${cards} cards, not one`);
  if (tl.prefix.at(-1)?.type !== "card") problems.push("the prefix does not end with the card");
  if (tl.prefix.some((e) => e.type === "card_answer")) problems.push("the prefix holds an answer");
  for (const [name, answer] of [
    ["deny", "deny"],
    ["allow", "allow_once"],
  ] as const) {
    const list = tl.branches[name];
    const first = list[0];
    if (!first || first.type !== "card_answer" || first.answer !== answer || first.t !== 0) problems.push(`${name} does not begin with card_answer ${answer} at t = 0`);
    if (list.some((e, i) => i > 0 && (e.type === "card_answer" || e.type === "card"))) problems.push(`${name} holds a second card or answer`);
    const calls = new Set(tl.prefix.filter((e) => e.type === "tool_call").map((e) => (e as EventOf<"tool_call">).id));
    for (const e of list) if (e.type === "tool_call") calls.add(e.id);
    for (const e of [...tl.prefix, ...list]) if (e.type === "tool_result" && !calls.has(e.id)) problems.push(`${name}: result ${e.id} has no call`);
  }
  return [...new Set(problems)];
}
