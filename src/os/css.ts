import type { CSSProperties } from "react";

// Small helpers so every component speaks Slint's vocabulary in CSS, from the generated tokens
// only (src/os/tokens.css). Nothing here holds a colour of its own.

/** A theme token: `v("bg-card")` is `var(--y-bg-card)`. */
export const v = (token: string) => `var(--y-${token})`;

/**
 * Slint's `transparentize(p)` keeps (1 − p) of a colour's alpha; `with-alpha(a)` on an opaque
 * colour is the same thing. `alpha("bg-deep", 91)` is `Theme.bg-deep.transparentize(9%)`.
 */
export const alpha = (token: string, keepPercent: number) =>
  `color-mix(in srgb, var(--y-${token}) ${keepPercent}%, transparent)`;

/**
 * A Slint `border-width`/`border-color`. Slint draws the border inside the rectangle and does not
 * inset the children for it, so it is an inset ring here rather than a CSS border, which would.
 */
export const ring = (color: string, width = 1) => `inset 0 0 0 ${width}px ${color}`;

/**
 * The OS ships Barlow at 400, 500 and 600 only (crates/yantrik-design-tokens/slint/fonts), so a
 * Slint `font-weight: 700` is drawn with the 600 face. The site loads the same three.
 */
export const weight = (w: number) => (w > 600 ? 600 : w);

/**
 * A Slint Text: Barlow at a size, no synthetic bold. Its line is the font's own ascent + descent
 * (1.2 em; Barlow's hhea is 1000/−200 on 1000 units), and a single-line Text is laid out at that
 * height rounded UP to a whole pixel: 11px text takes 14px, 12px takes 15, 14px takes 17. Measured
 * off the OS's own card (22 Sep 2026 capture: every row lands where ceil(1.2 × size) puts it).
 */
export function text(size: number | string, w = 400, color = v("text-primary")): CSSProperties {
  const fs = typeof size === "number" ? `${size}px` : size;
  return {
    fontSize: fs,
    fontWeight: weight(w),
    color,
    lineHeight: `round(up, calc(${fs} * 1.2), 1px)`,
    whiteSpace: "nowrap",
  };
}

/** `overflow: elide` on a single-line Slint Text. */
export const elide: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  minWidth: 0,
};

/** `wrap: word-wrap`: lines at the font's own 1.2 em pitch (14.4px at 12px, measured). */
export const wrap: CSSProperties = { whiteSpace: "normal", overflowWrap: "break-word", lineHeight: 1.2 };

/** JetBrains Mono, whose line is its own 1.32 em (hhea 1020/−300), rounded up as Barlow's is. */
export const mono = (size: number, color = v("text-primary")): CSSProperties => ({
  fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
  fontSize: `${size}px`,
  lineHeight: `${Math.ceil(size * 1.32)}px`,
  color,
  whiteSpace: "nowrap",
});

/** A row (Slint HorizontalLayout) with its items centred on the cross axis. */
export const row = (gap = 0): CSSProperties => ({ display: "flex", alignItems: "center", gap });

/** A column (Slint VerticalLayout). */
export const col = (gap = 0): CSSProperties => ({ display: "flex", flexDirection: "column", gap });
