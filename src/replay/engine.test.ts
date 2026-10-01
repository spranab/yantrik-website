// The engine's tests. Run with `pnpm test` (node --test; Node strips the types itself).

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MAX_GAP, clockText, compress, dateText, prepare, present, stateAt, validate } from "./engine.ts";
import type { Event, Timeline } from "./types.ts";

const fixture: Timeline = JSON.parse(readFileSync(new URL("./fixture.json", import.meta.url), "utf8"));
const p = prepare(fixture);
const LATE = 10 * 60 * 1000;

test("the fixture is a playable timeline, and marked as a fixture", () => {
  assert.deepEqual(validate(fixture), []);
  assert.equal(fixture.fixture, true);
});

test("prefix: events land in time, then the card waits however late the clock", () => {
  const start = stateAt(p, { answer: null, t: 0 });
  assert.equal(start.status, "playing");
  assert.equal(start.transcript[0].kind, "user");
  assert.equal(start.card, null);

  const mid = stateAt(p, { answer: null, t: p.prefix.duration / 2 });
  assert.equal(mid.status, "playing");
  assert.equal(mid.card, null);
  assert.ok(mid.applied > 1 && mid.applied < fixture.prefix.length);

  for (const t of [p.prefix.duration, p.prefix.duration + 1, LATE, Infinity]) {
    const s = stateAt(p, { answer: null, t });
    assert.equal(s.status, "waiting", `at ${t}`);
    assert.ok(s.card);
    assert.equal(s.card.answer, null);
    assert.equal(s.applied, fixture.prefix.length);
    assert.equal(s.files.length, 0, "no branch event leaks into the prefix");
    const exportCall = s.transcript.find((m) => m.kind === "tool" && m.action === "export");
    assert.ok(exportCall && exportCall.kind === "tool" && exportCall.result === null, "the export is still waiting");
  }
  // The clock stops with it: waiting longer does not move the status bar's time.
  assert.equal(stateAt(p, { answer: null, t: LATE }).realMs, stateAt(p, { answer: null, t: p.prefix.duration }).realMs);
});

test("deny: the export is refused, the Mind says so, and the file does not exist", () => {
  const first = stateAt(p, { answer: "deny", t: 0 });
  assert.equal(first.phase, "deny");
  assert.equal(first.card?.answer, "deny");
  assert.equal(first.status, "playing");

  const end = stateAt(p, { answer: "deny", t: LATE });
  assert.equal(end.status, "ended");
  assert.deepEqual(end.files, [{ path: "~/Documents/hike-checklist.md", exists: false }]);
  const call = end.transcript.find((m) => m.kind === "tool" && m.action === "export");
  assert.ok(call && call.kind === "tool" && call.result?.ok === false);
  const last = end.transcript.at(-1);
  assert.ok(last && last.kind === "mind" && last.text.includes("didn't export"));
  assert.equal(end.thinking, false);
  // Everything the prefix built is still there.
  assert.equal(end.notes?.title, "Weekend hike — what to pack");
});

test("allow: the export runs and the file is written", () => {
  const end = stateAt(p, { answer: "allow_once", t: LATE });
  assert.equal(end.status, "ended");
  assert.equal(end.card?.answer, "allow_once");
  assert.deepEqual(end.files, [{ path: "~/Documents/hike-checklist.md", exists: true, bytes: 124 }]);
  const call = end.transcript.find((m) => m.kind === "tool" && m.action === "export");
  assert.ok(call && call.kind === "tool" && call.result?.ok === true);
  // The bytes the recording says were written are the note's.
  assert.equal(Buffer.byteLength(end.notes!.body), 124);
});

test("the two branches share the prefix and differ only after the answer", () => {
  const deny = stateAt(p, { answer: "deny", t: 0 });
  const allow = stateAt(p, { answer: "allow_once", t: 0 });
  const waiting = stateAt(p, { answer: null, t: LATE });
  assert.deepEqual(deny.notes, waiting.notes);
  assert.deepEqual(allow.windows, waiting.windows);
  assert.deepEqual(deny.transcript, allow.transcript);
  assert.equal(deny.realMs, allow.realMs);
});

test("gap compression: gaps over 1.5 s play as 1.5 s, shorter ones as they were, and it is said", () => {
  const ev = (t: number): Event => ({ t, type: "mind_thinking", on: true });
  const list = compress([ev(0), ev(400), ev(5400), ev(6000), ev(9000)]);
  assert.deepEqual(
    list.events.map((e) => e.at),
    [0, 400, 400 + MAX_GAP, 400 + MAX_GAP + 600, 400 + MAX_GAP + 600 + MAX_GAP],
  );
  assert.equal(list.shortenedGaps, 2);
  assert.equal(list.shortenedMs, 5000 - MAX_GAP + (3000 - MAX_GAP));
  assert.equal(list.recorded, 9000);
  // A gap before the first event is idle time too.
  assert.equal(compress([ev(4000)]).events[0].at, MAX_GAP);
  // The recorded times are kept untouched beside the played ones.
  assert.deepEqual(list.events.map((e) => e.event.t), [0, 400, 5400, 6000, 9000]);

  // The fixture has long gaps, so its state says idle time was shortened.
  assert.ok(p.prefix.shortenedMs > 0);
  assert.equal(stateAt(p, { answer: null, t: 0 }).compressed, true);
  // Every played gap in the fixture is at most MAX_GAP.
  for (const l of [p.prefix, p.deny, p.allow_once]) {
    l.events.forEach((e, i) => assert.ok(e.at - (l.events[i - 1]?.at ?? 0) <= MAX_GAP));
  }
});

test("the clock is the recording's: shortened gaps run fast, never past the recorded time", () => {
  assert.equal(clockText(fixture.source.recorded), "14:06");
  assert.equal(dateText(fixture.source.recorded), "Thu 1 Oct");
  const waiting = stateAt(p, { answer: null, t: LATE });
  assert.equal(waiting.realMs, fixture.prefix.at(-1)!.t);
  const end = stateAt(p, { answer: "allow_once", t: LATE });
  assert.equal(end.realMs, fixture.prefix.at(-1)!.t + fixture.branches.allow.at(-1)!.t);
  let prev = -1;
  for (let t = 0; t <= p.prefix.duration; t += 50) {
    const r = stateAt(p, { answer: null, t }).realMs;
    assert.ok(r >= prev, "the recorded clock never runs backwards");
    prev = r;
  }
});

test("no reordering: events apply in the order recorded, ties and bad times included", () => {
  const tl: Timeline = {
    ...fixture,
    prefix: [
      { t: 0, type: "user_message", text: "one" },
      { t: 100, type: "mind_message", text: "two" },
      { t: 100, type: "mind_message", text: "three" },
      { t: 50, type: "mind_message", text: "four, recorded with an earlier time" },
      { t: 300, type: "mind_message", text: "five" },
      fixture.prefix.at(-1)!,
    ],
  };
  assert.ok(validate(tl).some((m) => m.includes("earlier")), "a time going backwards is reported");
  const s = stateAt(prepare(tl), { answer: null, t: LATE });
  assert.deepEqual(
    s.transcript.map((m) => (m.kind === "tool" ? m.id : m.text)),
    ["one", "two", "three", "four, recorded with an earlier time", "five"],
  );
  const at = prepare(tl).prefix.events.map((e) => e.at);
  assert.deepEqual([...at].sort((a, b) => a - b), at, "playback times never decrease");
  // Nothing invented: every transcript line is an event's text, and there are no more of them.
  assert.equal(s.transcript.length, 5);

  // The fixture, at every step, holds exactly the events up to that point, in order.
  const texts = (s: ReturnType<typeof stateAt>) => s.transcript.map((m) => m.key);
  let prevKeys: string[] = [];
  for (let t = 0; t <= p.prefix.duration; t += 100) {
    const keys = texts(stateAt(p, { answer: null, t }));
    assert.deepEqual(keys.slice(0, prevKeys.length), prevKeys, "a step only adds to the end");
    prevKeys = keys;
  }
});

test("reduced motion is the same state: present() only cuts text that is still landing", () => {
  // Find a moment where a reveal is under way (the note's five items arriving).
  const notesAt = p.prefix.events.find((e) => e.event.type === "notes" && e.event.body.includes("Water"))!.at;
  const s = stateAt(p, { answer: null, t: notesAt + 60 });
  assert.ok(s.reveals.length > 0, "the items are typing in");

  const reduced = present(s, { reducedMotion: true });
  assert.equal(reduced, s, "reduced motion: the state itself, untouched");
  const moving = present(s, { reducedMotion: false });
  assert.ok(moving.notes!.body.length < s.notes!.body.length && s.notes!.body.startsWith(moving.notes!.body));
  // Everything but the landing text is identical.
  const { notes: _a, transcript: _b, ...restMoving } = moving;
  const { notes: _c, transcript: _d, ...restState } = s;
  void _a, _b, _c, _d;
  assert.deepEqual(restMoving, restState);

  // At every point of every list, once the reveal is over the two are equal, and the events
  // applied never depend on motion.
  for (const answer of [null, "deny", "allow_once"] as const) {
    const list = answer ? p[answer] : p.prefix;
    for (let t = 0; t <= list.duration + 100; t += 20) {
      const st = stateAt(p, { answer, t });
      const m = present(st, { reducedMotion: false });
      const r = present(st, { reducedMotion: true });
      assert.equal(m.applied, r.applied);
      assert.equal(m.status, r.status);
      assert.deepEqual(m.card, r.card);
      assert.deepEqual(m.windows, r.windows);
      assert.deepEqual(m.files, r.files);
      if (st.reveals.length === 0) assert.deepEqual(m, r);
    }
  }
  // Reveals are always over by the next event, so typing never holds the replay back.
  for (const l of [p.prefix, p.deny, p.allow_once]) {
    for (let k = 0; k < l.events.length - 1; k++) {
      const st = stateAt(p, { answer: l === p.prefix ? null : l === p.deny ? "deny" : "allow_once", t: l.events[k + 1].at });
      assert.ok(st.reveals.every((r) => r.at >= l.events[k + 1].at || r.until <= l.events[k + 1].at));
    }
  }
});

test("validate catches a timeline the engine cannot play honestly", () => {
  const noCard: Timeline = { ...fixture, prefix: fixture.prefix.slice(0, -1) };
  assert.ok(validate(noCard).some((m) => m.includes("card")));
  const badBranch: Timeline = { ...fixture, branches: { deny: fixture.branches.allow, allow: fixture.branches.deny } };
  assert.ok(validate(badBranch).length >= 2);
  const orphan: Timeline = { ...fixture, branches: { ...fixture.branches, deny: [...fixture.branches.deny, { t: 9999, type: "tool_result", id: "nope", ok: true, summary: "x" }] } };
  assert.ok(validate(orphan).some((m) => m.includes("nope")));
});
