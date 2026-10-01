"use client";

import { useLiveStatus } from "./live-status";

/**
 * The homepage's word on the live machine, from a same-origin probe of its playlist. Live says
 * what the stream is (deploy/live/publisher/publish: three frames a second, no audio); offline
 * says since when only if this page saw it go.
 */
export function LivePill({ detail = true }: { detail?: boolean }) {
  const { state, since } = useLiveStatus();
  const words =
    state === "live"
      ? detail
        ? "live · 3 fps · 1280×800 · no audio"
        : "live"
      : state === "offline"
        ? since
          ? `offline since ${since}`
          : "offline right now"
        : "checking";
  return (
    <span className="s-pill" data-state={state} role="status" aria-live="polite">
      <span className="s-dot" data-state={state} aria-hidden="true" />
      {words}
    </span>
  );
}

/** Just the dot, for the header's Live entry; its words are in the link's accessible name. */
export function LiveDot() {
  const { state } = useLiveStatus();
  return (
    <>
      <span className="s-dot" data-state={state} aria-hidden="true" />
      <span className="sr-only">{state === "live" ? " (streaming now)" : state === "offline" ? " (offline right now)" : ""}</span>
    </>
  );
}
