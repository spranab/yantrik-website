"use client";

// TEMPORARY. A placeholder for the hero, so the homepage has its top while the replay is built on
// branch redesign/replay, which replaces this one file (and only this file). It is the static
// desktop of /os-preview's first scene: the replica with sample data, not a recording, and its
// caption says so.

import { useEffect, useRef, useState } from "react";
import "@/os/os.css";
import { Desktop } from "@/os/Desktop";
import { ChromiumWindow } from "@/os/ChromiumWindow";
import { NotesWindow } from "@/os/NotesWindow";
import { chromium, debianFavicon, exportCard, messages, mindNow, notes, noteText, noteWords } from "@/app/os-preview/fixture";

const W = 1280;
const H = 800;

export default function Hero() {
  const box = useRef<HTMLDivElement>(null);
  const [k, setK] = useState<number | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setK(Math.min(1, e.contentRect.width / W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <section aria-labelledby="hero-head" style={{ paddingTop: 56 }}>
      <div className="s-wrap">
        <h1 id="hero-head" className="s-display">
          A desktop a mind can use. You still hold the keys.
        </h1>
        <p className="s-sub">
          Yantrik OS is a Linux desktop where every app says what it holds and what it can be asked to do, so an AI
          agent works through the same doors you do, and the step that would leave the machine waits for you.
        </p>
      </div>
      <div className="s-wrap" style={{ marginTop: 40 }}>
        <div
          ref={box}
          className="hero-scale"
          style={{ position: "relative", width: "100%", maxWidth: W, aspectRatio: `${W} / ${H}`, overflow: "hidden", borderRadius: 4 }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: W,
              height: H,
              transformOrigin: "0 0",
              transform: k === null ? "scale(var(--hero-k, 1))" : `scale(${k})`,
            }}
            aria-hidden="true"
          >
            <Desktop
              statusBar={{
                clock: "14:07",
                date: "Thu 1 Oct",
                companionStatus: "idle",
                cpuPercent: 4,
                memText: "1.9 GB / 7.8 GB",
                mode: "ask",
                modeLabel: "Ask",
                harnessId: "yantrik-mind",
                harnessName: "Yantrik Mind",
                harnessDriving: true,
                networkOnline: true,
                networkMedium: "ethernet",
              }}
              taskbar={{ windows: [{ appId: "mind-view", title: "Mind View", subtitle: "Mind View · Browser, Notes" }], chatWith: "Yantrik Mind" }}
              front="windows"
              mindView={{
                x: 0,
                y: 80,
                width: 896,
                height: 560,
                windows: [
                  {
                    key: "browser",
                    x: 16,
                    y: 14,
                    node: (
                      <ChromiumWindow
                        width={620}
                        height={400}
                        title="Debian -- Debian “trixie” Release Information"
                        url="debian.org/releases/trixie/"
                        pageSrc="/os-preview/debian-trixie.png"
                        favicon={debianFavicon}
                        palette={chromium}
                      />
                    ),
                  },
                  {
                    key: "notes",
                    x: 200,
                    y: 86,
                    node: (
                      <NotesWindow
                        width={680}
                        height={460}
                        status="All changes saved"
                        notes={notes}
                        allCount={2}
                        pinCount={0}
                        noteTitle="Debian 13 — what changed"
                        content={noteText}
                        words={noteWords}
                      />
                    ),
                  },
                ],
              }}
              lens={{ mindName: "Yantrik Mind", messages, approvals: [exportCard], canOpenInAgents: true }}
              mindPanel={{ open: true, now: mindNow, mode: "ask", modeLabel: "Ask", ceiling: "sensitive" }}
            />
          </div>
        </div>
        <p className="s-src" style={{ marginTop: 12 }}>
          The desktop drawn in HTML from the OS&rsquo;s own components, with sample data: a layout preview, not a
          recording. The recorded session from the live machine takes this place.
        </p>
      </div>
    </section>
  );
}
