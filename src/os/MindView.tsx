import type { ReactNode } from "react";
import { LabwcFrame } from "./LabwcFrame";
import { v } from "./css";

export type MindViewWindow = {
  key: string;
  /** Position and size on Mind View's own display, in its pixels. */
  x: number;
  y: number;
  node: ReactNode;
};

export type MindViewProps = {
  /** "Mind View" since the title library (crates/yantrik-mind-view-title); "labwc - WL-1" before it. */
  title?: string;
  active?: boolean;
  /** The nested display: SIZE_PERCENT (70) of the person's screen, so 896×560 on 1280×800. */
  width?: number;
  height?: number;
  /** The windows on it, bottom first. Each draws its own frame: none of them is labwc's. */
  windows?: MindViewWindow[];
};

/**
 * Mind View: a nested labwc, one window on the person's desktop with a display of its own inside
 * (crates/yantrik-ui/src/mind_view.rs, config/labwc-mind/rc.xml).
 *
 * The outer frame is the person's labwc's (LabwcFrame, with its shadow). Inside, nothing of
 * labwc's is drawn: the display is filled with `EMPTY_BACKGROUND`, which mind_view.rs takes from
 * themerc's inactive title colour, and swaybg centres config/labwc-mind/empty.png on it. The
 * apps a mind opens are placed on top, and every one of them draws its own frame (the Notes app
 * is a frameless Slint AppWindow; Chromium draws its own tab strip), so labwc-mind's no-shadow
 * rule is moot.
 */
export function MindView({ title = "Mind View", active = true, width = 896, height = 560, windows = [] }: MindViewProps) {
  return (
    <LabwcFrame title={title} active={active} iconSrc="/os/labwc/labwc.svg" contentWidth={width} contentHeight={height} shadow>
      <div style={{ position: "absolute", inset: 0, background: v("labwc-window-inactive-title-bg-color") }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/os/labwc-mind/empty.png"
          alt=""
          width={720}
          height={140}
          style={{ position: "absolute", left: (width - 720) / 2, top: (height - 140) / 2 }}
        />
        {windows.map((w) => (
          <div key={w.key} style={{ position: "absolute", left: w.x, top: w.y }}>
            {w.node}
          </div>
        ))}
      </div>
    </LabwcFrame>
  );
}
