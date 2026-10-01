import { Icon } from "./Icon";
import { text, v, elide } from "./css";

/**
 * Which mind is answering: the status bar's mind chip (status_bar.slint ~447–489). Drawn only
 * while that is not the built-in companion; the caller decides, as the bar does, from the
 * harness id. A 20px `tint-accent` pill, the companion glyph at 12px and the mind's name at
 * fs-micro 500, both in the accent.
 */
export function MindChip({ name }: { name: string }) {
  return (
    <span style={{ display: "flex", alignItems: "center", height: v("status-bar-height"), flex: "none" }}>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          height: 20,
          padding: `0 calc(7px + ${v("sp-3")} / 2)`,
          borderRadius: v("r-sm"),
          background: v("tint-accent"),
        }}
      >
        <Icon name="companion" size={12} tint={v("accent")} />
        <span style={{ ...text(v("fs-micro"), 500, v("accent")), ...elide, maxWidth: 150 }}>{name}</span>
      </span>
    </span>
  );
}
