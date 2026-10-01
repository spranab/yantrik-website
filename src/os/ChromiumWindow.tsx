import type { CSSProperties, ReactNode } from "react";
import { Icon } from "./Icon";
import { elide } from "./css";

/**
 * Chromium's own colours and UI font. These are not the OS's: Chromium draws its window itself
 * (client-side decorations), in its own theme, so they arrive as data, sampled from a capture of
 * the browser on the desktop, and never as tokens.
 */
export type ChromiumPalette = {
  frame: string;
  tab: string;
  toolbar: string;
  omnibox: string;
  button: string;
  separator: string;
  text: string;
  icon: string;
  font: string;
};

export type ChromiumWindowProps = {
  width: number;
  height: number;
  title: string;
  url: string;
  /** The page as captured (a bitmap of Chromium's content area), or any node standing in for it. */
  pageSrc?: string;
  page?: ReactNode;
  favicon?: ReactNode;
  palette: ChromiumPalette;
};

/** Measured off the browser on this desktop, 1 Oct 2026 (1280×800): see the class comment. */
const TABSTRIP = 40;
const TOOLBAR = 46;

/**
 * The browser a mind opens: Chromium (the first of `BROWSERS` in crates/yantrik-ui/src/wire/dock.rs),
 * which labwc does not frame. It asks for client-side decorations and draws its own tab strip, so
 * the window on this desktop has no labwc title bar at all (seen in a 1 Oct 2026 capture of the
 * desktop, `Untitled - Chromium` in the taskbar). Its geometry here is that capture's: 8px top
 * corners, a 40px tab strip with the tab-search button and one 34px tab, a 46px toolbar with the
 * omnibox pill, a 1px rule, then the page. The glyphs are the OS's nearest stroke icons, not
 * Chromium's vector icons, which the replica does not have.
 */
export function ChromiumWindow({ width, height, title, url, pageSrc, page, favicon, palette: c }: ChromiumWindowProps) {
  const ui = (size: number, color = c.text): CSSProperties => ({ fontFamily: c.font, fontSize: size, lineHeight: 1.2, color, whiteSpace: "nowrap" });
  const tabW = Math.min(240, Math.max(120, width - 190));
  return (
    <div style={{ width, height, borderTopLeftRadius: 8, borderTopRightRadius: 8, overflow: "hidden", background: c.toolbar, display: "flex", flexDirection: "column" }}>
      {/* Tab strip */}
      <div style={{ position: "relative", height: TABSTRIP, flex: "none", background: c.frame }}>
        <span style={{ position: "absolute", left: 6, top: 6, width: 28, height: 28, borderRadius: 8, background: c.button, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="chevron-down" size={14} tint={c.text} thickness={1.8} />
        </span>
        <span
          style={{
            position: "absolute",
            left: 40,
            top: 6,
            width: tabW,
            height: TABSTRIP - 6,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            background: c.tab,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 10px 0 12px",
            boxSizing: "border-box",
          }}
        >
          <span style={{ width: 16, height: 16, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>{favicon}</span>
          <span style={{ ...ui(13), ...elide, flex: "1 1 0" }}>{title}</span>
          <Icon name="close" size={14} tint={c.text} thickness={1.6} />
        </span>
        <span style={{ position: "absolute", left: 40 + tabW + 8, top: 10, display: "flex" }}>
          <Icon name="plus" size={20} tint={c.text} thickness={1.6} />
        </span>
        <span style={{ position: "absolute", right: 10, top: 10, display: "flex" }}>
          <Icon name="close" size={20} tint={c.text} thickness={1.6} />
        </span>
      </div>
      {/* Toolbar */}
      <div style={{ height: TOOLBAR, flex: "none", background: c.toolbar, display: "flex", alignItems: "center", gap: 14, padding: "0 12px" }}>
        <Icon name="arrow-left" size={18} tint={c.icon} thickness={1.6} />
        <Icon name="arrow-right" size={18} tint={c.icon} thickness={1.6} />
        <Icon name="refresh" size={18} tint={c.text} thickness={1.7} />
        <span style={{ flex: "1 1 0", minWidth: 0, height: 34, borderRadius: 17, background: c.omnibox, display: "flex", alignItems: "center", gap: 10, padding: "0 12px" }}>
          <Icon name="lock" size={14} tint={c.text} thickness={1.6} />
          <span style={{ ...ui(14), ...elide, flex: "1 1 0" }}>{url}</span>
          <Icon name="star" size={16} tint={c.text} thickness={1.6} />
        </span>
        {/* The menu: three dots, upright */}
        <span style={{ display: "flex", flexDirection: "column", gap: 3, width: 18, alignItems: "center" }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 3.5, height: 3.5, borderRadius: 2, background: c.text }} />
          ))}
        </span>
      </div>
      <div style={{ height: 1, flex: "none", background: c.separator }} />
      {/* The page */}
      <div style={{ position: "relative", flex: "1 1 0", minHeight: 0, overflow: "hidden" }}>
        {pageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pageSrc} alt="" style={{ display: "block", width: "100%", height: "auto" }} />
        ) : (
          page
        )}
      </div>
    </div>
  );
}
