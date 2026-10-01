"use client";

import { useSyncExternalStore } from "react";

// Whether the live machine is streaming, from this page's own origin: the relay's playlist at
// /live/hls/index.m3u8 (nginx proxies it to MediaMTX on loopback; deploy/live/relay/nginx-live.conf).
// Live means a 2xx and a body that starts with #EXTM3U; anything else, a network error included,
// is offline. One probe for the whole page however many pills read it, again every 30 seconds
// while the tab is visible. "Since" is said only for an outage this page saw begin.

export type LiveState = { state: "checking" | "live" | "offline"; since: string };

const SRC = "/live/hls/index.m3u8";
const EVERY_MS = 30_000;

let current: LiveState = { state: "checking", since: "" };
let sawLive = false;
let timer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function set(next: LiveState) {
  if (next.state === current.state && next.since === current.since) return;
  current = next;
  listeners.forEach((l) => l());
}

const clock = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

async function probe() {
  let live = false;
  try {
    const res = await fetch(SRC, { cache: "no-store", credentials: "same-origin" });
    live = res.ok && (await res.text()).startsWith("#EXTM3U");
  } catch {
    live = false;
  }
  if (live) {
    sawLive = true;
    set({ state: "live", since: "" });
  } else {
    set({ state: "offline", since: sawLive ? current.since || clock(new Date()) : "" });
  }
  schedule();
}

function schedule() {
  if (timer) clearTimeout(timer);
  timer = listeners.size && document.visibilityState === "visible" ? setTimeout(probe, EVERY_MS) : null;
}

function onVisible() {
  if (document.visibilityState === "visible" && listeners.size) probe();
  else schedule();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    document.addEventListener("visibilitychange", onVisible);
    probe();
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      document.removeEventListener("visibilitychange", onVisible);
      if (timer) clearTimeout(timer);
      timer = null;
    }
  };
}

const server: LiveState = { state: "checking", since: "" };

export function useLiveStatus(): LiveState {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => server,
  );
}
