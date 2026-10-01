import { Icon } from "./Icon";
import { ring, text, v, elide } from "./css";
import type { MindMode } from "./types";

export type ModeChipProps = {
  mode: MindMode;
  /** The chip's words; during either bypass they carry the countdown ("Bypass 14m"). */
  label: string;
  /** Private mode: the Mind is off whatever the mode says, and the chip says that instead. */
  privateMode?: boolean;
};

/**
 * What the mind may do without asking: the status bar's mode chip (status_bar.slint ~388–445).
 * A 32px-tall hit area as wide as its row plus sp-3, holding a 20px pill (r-sm) with the row
 * centred in it: 7px padding, a 12px shield (an eye in Plan), 5px, the label at fs-micro.
 */
export function ModeChip({ mode, label, privateMode = false }: ModeChipProps) {
  const bypass = mode === "bypass" || mode === "bypass_all";
  const plan = mode === "plan" && !privateMode;
  const tone = privateMode ? v("accent") : bypass ? v("color-danger") : plan ? v("amber") : v("text-secondary");
  const fill = privateMode ? v("tint-accent") : bypass ? v("color-danger-dim") : mode === "plan" ? v("tint-amber") : v("hover-fill");
  const edged = privateMode || bypass;
  return (
    <span style={{ display: "flex", alignItems: "center", height: v("status-bar-height"), flex: "none" }}>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          height: 20,
          // The hit area is the row plus sp-3, and the pill fills it.
          padding: `0 calc(7px + ${v("sp-3")} / 2)`,
          borderRadius: v("r-sm"),
          background: fill,
          boxShadow: edged ? ring(privateMode ? v("accent") : v("color-danger")) : undefined,
        }}
      >
        <Icon name={plan ? "eye" : "shield"} size={12} tint={tone} />
        <span style={{ ...text(v("fs-micro"), edged ? 700 : 500, tone), ...elide, maxWidth: 120 }}>
          {privateMode ? "Private" : label}
        </span>
      </span>
    </span>
  );
}
