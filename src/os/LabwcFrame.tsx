import type { ReactNode } from "react";
import { elide, v } from "./css";

export type LabwcFrameProps = {
  title: string;
  /** The window has the keyboard: labwc's `window.active.*` colours, else `window.inactive.*`. */
  active?: boolean;
  /** The app's icon, which labwc draws at the left of the bar (for Mind View, labwc's own). */
  iconSrc?: string;
  /** The client area, which is what the app (or the nested compositor) is sized to. */
  contentWidth: number;
  contentHeight: number;
  /** Drawn by the person's labwc, whose rc.xml has `<dropShadows>yes</dropShadows>`. */
  shadow?: boolean;
  children?: ReactNode;
};

/** Where labwc puts things on a 26px bar, measured off a capture rather than assumed. */
const BAR = v("labwc-button-height");
/** labwc scales each 26px button PNG to the theme's titlebar.height (32), not to the bar it draws. */
const ICON_BOX = v("labwc-titlebar-height");

/**
 * The frame labwc draws round a window that does not draw its own: config/labwc/themerc, with the
 * radius and title font of config/labwc/rc.xml (all as --y-labwc-* tokens).
 *
 * Geometry follows the frame labwc actually drew on this desktop (Mind View on 24 Sep 2026 and
 * the Terminal and Blender frames on 29 Sep, both 1280×800), which differs from the theme file in
 * three places, so the capture is what is reproduced:
 *   - the bar is 26px, the button height, not `titlebar.height: 32`, which this labwc ignores;
 *   - the buttons sit edge to edge in 26px slots against the right border, with no
 *     `padding.width` before them and no `button.spacing` between them;
 *   - each button's 26px PNG is scaled to 32px, `titlebar.height`, so its 10px glyph comes out
 *     12px, overhanging its 26px slot.
 * The title is centred on the whole bar, Barlow 10pt medium (13.33px). Only the top corners
 * are rounded; the 1px border runs round the whole window.
 */
export function LabwcFrame({ title, active = true, iconSrc, contentWidth, contentHeight, shadow = false, children }: LabwcFrameProps) {
  const state = active ? "active" : "inactive";
  const radius = v("labwc-corner-radius");
  const border = v("labwc-border-width");
  const buttons = ["iconify", "max", "close"] as const;
  return (
    <div
      style={{
        position: "relative",
        width: `calc(${contentWidth}px + 2 * ${border})`,
        height: `calc(${contentHeight}px + ${BAR} + 2 * ${border})`,
        borderTopLeftRadius: radius,
        borderTopRightRadius: radius,
        boxSizing: "border-box",
        border: `${border} solid ${v(`labwc-window-${state}-border-color`)}`,
        background: v(`labwc-window-${state}-title-bg-color`),
        // labwc's default shadow: 60px at #00000060 active, 40px at #00000040 inactive, the first
        // of which is exactly `overlay-backdrop`.
        boxShadow: shadow
          ? active
            ? `0 0 60px ${v("overlay-backdrop")}`
            : `0 0 40px color-mix(in srgb, ${v("overlay-backdrop")} 67%, transparent)`
          : undefined,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          position: "relative",
          height: BAR,
          flex: "none",
          borderTopLeftRadius: `calc(${radius} - ${border})`,
          borderTopRightRadius: `calc(${radius} - ${border})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 80px",
        }}
      >
        {iconSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={iconSrc} alt="" width={22} height={22} style={{ position: "absolute", left: 2, top: 3.5 }} />
        ) : null}
        <span
          style={{
            ...elide,
            fontFamily: "var(--font-barlow), sans-serif",
            fontSize: v("labwc-font-size"),
            fontWeight: active ? v("labwc-font-weight") : 400,
            lineHeight: 1.2,
            color: v(`labwc-window-${state}-label-text-color`),
          }}
        >
          {title}
        </span>
        <span style={{ position: "absolute", right: 0, top: 0, height: "100%", display: "flex" }} aria-hidden="true">
          {buttons.map((b) => (
            <span key={b} style={{ width: v("labwc-button-width"), height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "visible" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/os/labwc/${b}-${state}.png`} alt="" style={{ width: ICON_BOX, height: ICON_BOX, maxWidth: "none", flex: "none" }} />
            </span>
          ))}
        </span>
      </div>
      <div style={{ position: "relative", width: contentWidth, height: contentHeight, overflow: "hidden" }}>{children}</div>
    </div>
  );
}
