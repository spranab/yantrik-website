import { Icon } from "./Icon";
import { ring, text, v } from "./css";

/**
 * The answering mind's mark: its initial on a disc, or the companion glyph for the built-in one
 * (MindMark in crates/yantrik-ui-slint/ui/components/mind_panel.slint ~130–159). `tint-accent`
 * with an `accent-dim` rim while it is reachable; `hover-fill` and `border-strong` when not.
 */
export function MindMark({ initial, builtin = false, online = true, size = 34 }: { initial: string; builtin?: boolean; online?: boolean; size?: number }) {
  const tone = online ? v("accent") : v("text-dim");
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        flex: "none",
        background: online ? v("tint-accent") : v("hover-fill"),
        boxShadow: ring(online ? v("accent-dim") : v("border-strong")),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {builtin ? <Icon name="companion" size={size * 0.52} thickness={1.7} tint={tone} /> : <span style={text(size * 0.44, 700, tone)}>{initial}</span>}
    </span>
  );
}
