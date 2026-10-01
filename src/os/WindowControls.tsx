import { Icon } from "./Icon";
import { v } from "./css";

/**
 * Minimise, maximise, close: WindowControls in crates/yantrik-ui-kit/slint/window_controls.slint.
 * Three 46px buttons, flush, as tall as the bar they sit in, each a 20px icon box at a 1.6px
 * stroke in `text-secondary`. Rest state is bare; the hover fills are not drawn, since nothing
 * in the replica is hovered.
 */
export function WindowControls({ barHeight = 32, maximized = false, showMinimize = true }: { barHeight?: number; maximized?: boolean; showMinimize?: boolean }) {
  const glyphs = [
    ...(showMinimize ? (["minus"] as const) : []),
    maximized ? ("win-restore" as const) : ("win-maximize" as const),
    "close" as const,
  ];
  return (
    <span style={{ display: "flex", flex: "none", height: barHeight }} aria-hidden="true">
      {glyphs.map((g) => (
        <span key={g} style={{ width: 46, height: barHeight, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={g} size={20} thickness={1.6} tint={v("text-secondary")} />
        </span>
      ))}
    </span>
  );
}
