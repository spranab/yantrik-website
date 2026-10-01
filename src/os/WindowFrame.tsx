import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { WindowControls } from "./WindowControls";
import { alpha, text, v, elide } from "./css";

export type WindowFrameProps = {
  title?: string;
  /** A stroke glyph's path commands for the title bar's icon. */
  iconPath?: string;
  /** The icon's colour; its 22px badge is the same at 16% (Slint `with-alpha(0.16)`). */
  iconColor?: string;
  maximized?: boolean;
  /** The screen inside draws its own controls, so a maximised frame draws no title bar. */
  contentHasControls?: boolean;
  width: number;
  height: number;
  children?: ReactNode;
};

/**
 * The shell's own window chrome: WindowFrame in crates/yantrik-ui-slint/ui/components/window_frame.slint.
 *
 * Floating: radius 12 (its 24px shadow is not drawn on the OS's renderer), and the frame's one gradient, a 1px border that
 * fades from `border-strong` at the top through `separator` to `border-subtle` (~98–102). A 36px
 * title bar of `bg-surface` at 56% with a 1px top-edge reflection, the 22px icon badge, the title
 * at 14/500 in `text-secondary`, and the 46×36 controls. Under it the holographic separator, the
 * OS's other gradient (~239–248), at 60%; then the content on `bg-deep` at 85%, over the frame's
 * own `bg-deep` at 91%.
 */
export function WindowFrame({
  title = "",
  iconPath = "",
  iconColor = v("cyan"),
  maximized = false,
  contentHasControls = false,
  width,
  height,
  children,
}: WindowFrameProps) {
  const radius = maximized ? 0 : 12;
  const showBar = !maximized || !contentHasControls;
  return (
    // The frame's `clip: true` does not round what it clips under the OS's software renderer
    // (~123–125), so the clip here is square and only the fills are rounded; and its 24px
    // `overlay-shadow` is not drawn, as no Slint drop shadow is on that renderer.
    <div style={{ position: "relative", width, height, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, borderRadius: radius, background: alpha("bg-deep", 91) }} />
      {/* The 180° border, drawn under the children as Slint draws it */}
      {!maximized ? (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius,
            padding: 1,
            background: `linear-gradient(180deg, ${v("border-strong")} 0%, ${v("separator")} 50%, ${v("border-subtle")} 100%)`,
            WebkitMask: "linear-gradient(black, black) content-box, linear-gradient(black, black)",
            WebkitMaskComposite: "xor",
            mask: "linear-gradient(black, black) content-box exclude, linear-gradient(black, black)",
            pointerEvents: "none",
          }}
        />
      ) : null}

      {showBar ? (
        <div
          style={{
            position: "relative",
            height: 36,
            flex: "none",
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
            background: alpha("bg-surface", 56),
            display: "flex",
            alignItems: "center",
            paddingLeft: 12,
          }}
        >
          {/* Top edge reflection */}
          <div
            style={{
              position: "absolute",
              left: 12,
              right: 12,
              top: 0,
              height: 1,
              background: `linear-gradient(90deg, transparent 0%, ${v("border-default")} 30%, ${v("border-strong")} 50%, ${v("border-default")} 70%, transparent 100%)`,
            }}
          />
          <div style={{ flex: "1 1 0", minWidth: 0, display: "flex", alignItems: "center", gap: 8, visibility: !maximized || !contentHasControls ? "visible" : "hidden" }}>
            {iconPath ? (
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 5,
                  flex: "none",
                  background: `color-mix(in srgb, ${iconColor} 16%, transparent)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon d={iconPath} size={14} tint={iconColor} thickness={1.7} />
              </span>
            ) : null}
            {title ? <span style={{ ...text(v("fs-body"), 500, v("text-secondary")), ...elide }}>{title}</span> : null}
          </div>
          <WindowControls barHeight={36} maximized={maximized} />
        </div>
      ) : null}

      {/* Separator — holographic edge */}
      <div
        style={{
          position: "relative",
          height: 1,
          flex: "none",
          opacity: 0.6,
          background: `linear-gradient(90deg, transparent 5%, ${v("separator")} 20%, ${v("cyan-glow")} 50%, ${v("separator")} 80%, transparent 95%)`,
        }}
      />

      {/* Content area — slightly translucent */}
      <div style={{ position: "relative", flex: "1 1 0", minHeight: 0, overflow: "hidden", background: alpha("bg-deep", 85) }}>{children}</div>
    </div>
  );
}
