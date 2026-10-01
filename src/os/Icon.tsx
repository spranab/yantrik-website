import type { CSSProperties } from "react";
import { ICONS, type IconName } from "./icons";
import { v } from "./css";

export type IconProps = {
  /** An icon of the OS set by name, or raw path commands (`d`) such as `appOrWindow(id)` gives. */
  name?: IconName;
  d?: string;
  /** The icon's box, as Slint's `size` (default 16px). */
  size?: number;
  /** Stroke colour; default `Theme.text-secondary`. */
  tint?: string;
  /** Stroke width in pixels on screen, as Slint's `thickness` (default 1.6px). */
  thickness?: number;
  style?: CSSProperties;
};

/**
 * The Slint Icon component (crates/yantrik-ui-kit/slint/icon.slint), drawn the way Slint draws a
 * Path: the 20×20 viewbox is fitted, uniformly, into the box less one stroke width and offset by
 * half a stroke (i-slint-core items/path.rs `fitted_path_events`), so the stroke stays inside the
 * box. The stroke width is screen pixels, not viewbox units, which is why it is divided by the
 * scale here. No fill; Slint's default line cap and join, which are butt and miter
 * (i-slint-common enums.rs `LineCap`, `LineJoin`: the first variant is the default), with the
 * miter limit at 4.
 */
export function Icon({ name, d, size = 16, tint = v("text-secondary"), thickness = 1.6, style }: IconProps) {
  const path = d ?? (name ? ICONS[name] : "");
  const k = Math.max(size - thickness, 0.01) / 20;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", flex: "none", overflow: "visible", ...style }}
    >
      {path ? (
        <path
          d={path}
          transform={`translate(${thickness / 2} ${thickness / 2}) scale(${k})`}
          style={{ fill: "none", stroke: tint }}
          strokeWidth={thickness / k}
          strokeLinecap="butt"
          strokeLinejoin="miter"
          strokeMiterlimit={4}
        />
      ) : null}
    </svg>
  );
}
