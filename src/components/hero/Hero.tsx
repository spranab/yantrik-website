"use client";

// The homepage hero: the real desktop, replaying a real recorded session, and the visitor makes
// the one decision the real person made. Self-contained: `<Hero />` takes no props.
//
// It plays public/replay/session.json when the site has one, else the hand-written fixture
// (and says so). The engine (src/replay/engine.ts) says what the screen holds at each moment;
// this file owns the clock, the layout and the visitor's buttons. Nothing here answers the card.

import "./hero.css";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Desktop } from "@/os/Desktop";
import fixtureJson from "@/replay/fixture.json";
import { longDateText, prepare, present, stateAt, validate, type Answer, type PlayedList, type ReplayState } from "@/replay/engine";
import type { Timeline } from "@/replay/types";
import { H, REGIONS, W, modeLabel, toDesktop } from "./scene";

const FIXTURE = fixtureJson as unknown as Timeline;
const SESSION_URL = "/replay/session.json";
/** Below this the whole desktop would be scaled past legibility, so a 1:1-ish crop is shown. */
const NARROW = 900;
/** In the crop, how long the view stays on Mind View after the note or a window changes. */
const MIND_VIEW_HOLD = 2200;

type View = "lens" | "mindview";

const answerName = (a: Answer) => (a === "deny" ? "Deny" : "Allow once");

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(q.matches);
    on();
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** Plays while the hero is at least 60% in view and the tab is showing; stops under 40%. */
function useShowing(ref: React.RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio >= 0.6 || (e.isIntersecting && e.intersectionRect.height >= window.innerHeight * 0.6)) setInView(true);
        else if (e.intersectionRatio < 0.4) setInView(false);
      },
      { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] },
    );
    io.observe(el);
    const vis = () => setVisible(document.visibilityState === "visible");
    vis();
    document.addEventListener("visibilitychange", vis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", vis);
    };
  }, [ref]);
  return inView && visible;
}

function useWidth(ref: React.RefObject<HTMLElement | null>) {
  const [w, setW] = useState<number | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

/** The next playback time an event lands after t. */
const nextAt = (list: PlayedList, t: number) => list.events.find((e) => e.at > t)?.at ?? Infinity;

/** Which part of the desktop a narrow screen follows: Mind View just after the note or a window changed. */
function followed(list: PlayedList, s: ReplayState): View {
  if (s.status === "waiting") return "lens";
  let last = -Infinity;
  for (const e of list.events) {
    if (e.at > s.t) break;
    if (e.event.type === "notes" || e.event.type === "window") last = e.at;
  }
  return s.t - last < MIND_VIEW_HOLD ? "mindview" : "lens";
}

function statusLine(s: ReplayState, tl: Timeline): string {
  const mind = tl.source.mind;
  const where = tl.fixture ? "in the stand-in" : "in the recording";
  if (s.phase === "prefix") {
    if (s.status === "waiting" && s.card) return `${mind} is asking to run ${s.card.app}.${s.card.action}. Answer on the card: Deny or Allow once. It waits for you.`;
    return `${mind} is working on the task. When it asks, the card will wait for your answer.`;
  }
  return `You chose ${answerName(s.phase)}. This is what followed ${where}.`;
}

function caption(tl: Timeline, compressed: boolean): string {
  const src = tl.source;
  const shortened = compressed ? " · idle time shortened to 1.5 s" : "";
  if (tl.fixture) {
    return `Not a recording: a hand-written stand-in for the session to be recorded on ${src.machine} · ${src.mind} on ${src.model} · ${modeLabel(src.mode)} mode${shortened}`;
  }
  return `Replay of a session recorded on ${src.machine} on ${longDateText(src.recorded)} · build ${src.os_build} · ${src.mind} on ${src.model} · ${modeLabel(src.mode)} mode${shortened}`;
}

const micro: CSSProperties = { font: "500 11px/1.4 var(--font-barlow), sans-serif", letterSpacing: 1, color: "var(--y-text-dim)" };
const small: CSSProperties = { font: "400 12px/1.5 var(--font-barlow), sans-serif", color: "var(--y-text-dim)", margin: 0 };

export default function Hero() {
  const [timeline, setTimeline] = useState<Timeline>(FIXTURE);
  const [ready, setReady] = useState(false);
  const prepared = useMemo(() => prepare(timeline), [timeline]);

  const [answer, setAnswer] = useState<Answer | null>(null);
  const [t, setT] = useState(0);
  const tRef = useRef(0);
  const [paused, setPaused] = useState(false);
  const [view, setView] = useState<View | "auto">("auto");

  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const showing = useShowing(sectionRef);
  const reducedMotion = useReducedMotion();
  const width = useWidth(frameRef);

  // The recording when it exists, else the fixture. A recording that does not validate is not
  // played: the fixture is, still marked as one.
  useEffect(() => {
    let gone = false;
    fetch(SESSION_URL, { cache: "no-cache" })
      .then((r) => (r.ok && (r.headers.get("content-type") ?? "").includes("json") ? r.json() : null))
      .then((j: Timeline | null) => {
        if (gone || !j) return;
        const problems = validate(j);
        if (problems.length === 0) setTimeline(j);
        else console.warn(`${SESSION_URL} is not playable:\n  ${problems.join("\n  ")}`);
      })
      .catch(() => {})
      .finally(() => {
        if (!gone) setReady(true);
      });
    return () => {
      gone = true;
    };
  }, []);

  const list = answer ? prepared[answer] : prepared.prefix;
  const raw = stateAt(prepared, { answer, t });
  const shown = present(raw, { reducedMotion });
  const revealUntil = reducedMotion ? 0 : Math.max(0, ...raw.reveals.map((r) => r.until));
  const revealRef = useRef(0);
  revealRef.current = revealUntil;

  // The clock. It runs only while there is more of the list to play, and redraws only when
  // something on screen changes: an event lands, text is typing, or the status bar's clock moves.
  const running = ready && !paused && showing && t < list.duration;
  useEffect(() => {
    if (!running) return;
    const base = performance.now() - tRef.current;
    let drawn = tRef.current;
    let raf = 0;
    const step = (now: number) => {
      const nt = Math.min(now - base, list.duration);
      tRef.current = nt;
      if (nt >= nextAt(list, drawn) || nt < revealRef.current || nt - drawn >= 1000 || nt >= list.duration) {
        drawn = nt;
        setT(nt);
      }
      if (nt < list.duration) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [running, list]);

  const goTo = useCallback((a: Answer | null, at: number) => {
    tRef.current = at;
    setAnswer(a);
    setT(at);
    setPaused(false);
    setView("auto");
  }, []);

  const choose = useCallback(
    (a: Answer) => {
      goTo(a, 0);
      // The card's button is gone (it is a record now): keep the keyboard where the story is.
      requestAnimationFrame(() => statusRef.current?.focus({ preventScroll: true }));
    },
    [goTo],
  );

  const desktop = toDesktop(shown, timeline, { onDeny: () => choose("deny"), onAllow: () => choose("allow_once") });

  // Layout: the 1280×800 desktop scaled as one unit, or on a narrow screen a crop of it at a
  // legible size that follows the work (the Lens, or the note in Mind View).
  const narrow = width !== null && width < NARROW;
  let stage: CSSProperties;
  let inner: CSSProperties;
  const current: View = view === "auto" ? followed(list, raw) : view;
  if (width === null) {
    stage = { width: "100%", maxWidth: W, aspectRatio: `${W} / ${H}`, margin: "0 auto" };
    inner = { width: W, height: H };
  } else if (!narrow) {
    const scale = Math.min(1, width / W);
    stage = { width: W * scale, height: H * scale, margin: "0 auto" };
    inner = { width: W, height: H, transform: `scale(${scale})`, transformOrigin: "0 0" };
  } else {
    const scale = Math.min(1, width / (REGIONS.lens.end - REGIONS.lens.start));
    const cropW = width / scale;
    const r = REGIONS[current];
    const span = r.end - r.start;
    const left = Math.max(0, Math.min(W - cropW, cropW >= span ? r.start + span / 2 - cropW / 2 : r.start));
    stage = { width, height: H * scale };
    inner = { width: W, height: H, transform: `translateX(${-left * scale}px) scale(${scale})`, transformOrigin: "0 0" };
  }

  const ended = raw.status === "ended" && answer !== null;
  const file = shown.files.at(-1);

  return (
    <section ref={sectionRef} aria-label="A replay of a session on Yantrik OS" className="y-hero" style={{ position: "relative", width: "100%" }}>
      {timeline.fixture ? (
        <p style={{ margin: "0 0 8px", display: "flex" }}>
          <span style={{ ...micro, padding: "3px 8px", borderRadius: "var(--y-r-sm)", boxShadow: "inset 0 0 0 1px var(--y-border-strong)", color: "var(--y-text-secondary)" }}>
            Stand-in timeline until the recording lands
          </span>
        </p>
      ) : null}

      <div ref={frameRef} style={{ width: "100%" }}>
        <div style={{ position: "relative", overflow: "clip", borderRadius: "var(--y-r-md)", ...stage }} onFocusCapture={narrow ? () => setView("lens") : undefined}>
          <div className={narrow && !reducedMotion ? "y-hero-pan" : undefined} style={{ position: "absolute", left: 0, top: 0, ...inner }}>
            <Desktop {...desktop} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 12 }}>
        <p ref={statusRef} tabIndex={-1} aria-live="polite" style={{ margin: 0, flex: "1 1 320px", font: "400 14px/1.45 var(--font-barlow), sans-serif", color: raw.status === "waiting" ? "var(--s-text-amber)" : "var(--y-text-secondary)", outline: "none" }}>
          {statusLine(raw, timeline)}
        </p>
        <span style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {narrow ? (
            <>
              <button type="button" className="y-hero-control" aria-pressed={current === "lens"} onClick={() => setView("lens")}>
                Conversation
              </button>
              <button type="button" className="y-hero-control" aria-pressed={current === "mindview"} onClick={() => setView("mindview")}>
                Mind View
              </button>
            </>
          ) : null}
          {raw.status === "playing" ? (
            <button type="button" className="y-hero-control" onClick={() => setPaused((x) => !x)}>
              {paused ? "Play" : "Pause"}
            </button>
          ) : null}
          {answer === null && raw.status === "playing" ? (
            <button type="button" className="y-hero-control" onClick={() => goTo(null, prepared.prefix.duration)}>
              Skip to the decision
            </button>
          ) : null}
          {ended ? (
            <>
              <button type="button" className="y-hero-control is-primary" onClick={() => choose(answer === "deny" ? "allow_once" : "deny")}>
                Watch the other answer
              </button>
              <button type="button" className="y-hero-control" onClick={() => goTo(null, 0)}>
                From the start
              </button>
            </>
          ) : null}
        </span>
      </div>

      {file ? (
        <p className="mono" style={{ margin: "8px 0 0", color: file.exists ? "var(--y-text-primary)" : "var(--y-text-secondary)", overflowWrap: "anywhere" }}>
          <span style={{ color: "var(--y-text-dim)" }}>on disk after the run: </span>
          {file.path} · {file.exists ? (file.bytes !== undefined ? `exists, ${file.bytes} bytes` : "exists") : "does not exist"}
        </p>
      ) : null}

      <p style={{ ...small, marginTop: 8 }}>{caption(timeline, raw.compressed)}</p>
    </section>
  );
}
