"use client";

import { useEffect, useRef, useState } from "react";

/** The window every build was written for and checked in: a desktop browser's, not a column's. */
const VIEW = { width: 1100, height: 720 };

/**
 * A build from the live machine, played where it stands on the page. Its code is the Mind's, not
 * ours, so it runs only after a press, in a frame with scripts and nothing else: no same origin
 * (no cookies, storage or reach into this page), no forms, no popups, no top navigation. The
 * server adds the same sandbox to the files themselves (nginx, /built-files/), so opening one on
 * its own is held the same way.
 *
 * The frame is a 1100 by 720 window scaled to the column, as a screenshot would be: the builds lay
 * themselves out for a whole window, and a narrow frame cut Life Lab's grid off at the bottom.
 */
export function PlayFrame({ id, name, thumb }: { id: string; name: string; thumb: string }) {
  const [playing, setPlaying] = useState(false);
  const [scale, setScale] = useState(1);
  const stage = useRef<HTMLDivElement>(null);
  const src = `/built-files/${id}/index.html`;

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const fit = () => setScale(el.clientWidth / VIEW.width);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="built-player">
      <div className="built-stage" ref={stage}>
        {playing ? (
          <iframe
            className="built-frame"
            src={src}
            title={`${name}, as the Mind built it`}
            sandbox="allow-scripts"
            referrerPolicy="no-referrer"
            style={{ width: VIEW.width, height: VIEW.height, transform: `scale(${scale})` }}
          />
        ) : (
          <button type="button" className="built-play" onClick={() => setPlaying(true)} aria-label={`Play ${name} here`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumb} alt="" width={880} height={576} loading="lazy" decoding="async" />
            <span className="built-play-label">
              <span aria-hidden="true">▶</span> Play {name}
            </span>
          </button>
        )}
      </div>
      <a className="s-src built-open" href={src} target="_blank" rel="noopener noreferrer">
        Open {name} full size, on its own
      </a>
    </div>
  );
}
