import type { CSSProperties } from "react";
import { Icon } from "./Icon";
import { elide, ring, text, v, wrap } from "./css";
import type { MindAuditEntry, MindMode, MindRule } from "./types";

export type MindModeMenuProps = {
  mode: MindMode;
  modeLabel: string;
  ceiling: string;
  rules?: MindRule[];
  rulesCleared?: string;
  audit?: MindAuditEntry[];
  /** The bypass confirmation, a second screen inside the same box. */
  confirmingBypass?: boolean;
  bypassKind?: "bypass" | "bypass_all";
  showingAudit?: boolean;
  mindViewOn?: boolean;
  privateMode?: boolean;
};

const rule: CSSProperties = { height: 1, flex: "none", background: v("border-subtle") };

/** One mode row, fixed at 44px so its centre is arithmetic. */
function ModeRow({ label, means, selected, danger = false }: { label: string; means: string; selected: boolean; danger?: boolean }) {
  return (
    <div
      style={{
        height: 44,
        flex: "none",
        borderRadius: v("r-md"),
        background: selected ? (danger ? v("color-danger-dim") : v("tint-accent")) : "transparent",
        boxShadow: selected ? ring(danger ? v("color-danger") : v("accent-dim")) : undefined,
        display: "flex",
        alignItems: "center",
        gap: v("sp-2"),
        padding: `0 ${v("sp-2")}`,
      }}
    >
      <span style={{ width: 4, height: 22, borderRadius: 2, flex: "none", background: selected ? (danger ? v("color-danger") : v("accent")) : "transparent" }} />
      <span style={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ ...text(v("fs-body"), selected ? 600 : 500, danger ? v("color-danger") : v("text-primary")), ...elide }}>{label}</span>
        <span style={{ ...text(v("fs-micro"), 400, v("text-dim")), ...elide }}>{means}</span>
      </span>
    </div>
  );
}

/** A full-width 36px button. */
function MenuButton({ label, danger = false }: { label: string; danger?: boolean }) {
  return (
    <div
      style={{
        height: 36,
        flex: "none",
        borderRadius: v("r-md"),
        background: danger ? "transparent" : v("bg-elevated"),
        boxShadow: ring(danger ? v("color-danger") : v("border-default")),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ ...text(v("fs-body-strong"), 400, danger ? v("color-danger") : v("text-primary")), ...elide }}>{label}</span>
    </div>
  );
}

/**
 * What the mind may do without being asked: MindModeMenu in
 * crates/yantrik-ui-slint/ui/components/mind_mode_menu.slint, which opens from the mode chip at
 * x = W − 352, y = 36. 340px of opaque `bg-card`, r-lg (its 18px shadow is not drawn, as no
 * Slint shadow is on the OS's software renderer), its edge
 * `glass-border-strong` or, in either bypass, `color-danger`. Every row a fixed height.
 */
export function MindModeMenu({
  mode,
  modeLabel,
  ceiling,
  rules = [],
  rulesCleared = "",
  audit = [],
  confirmingBypass = false,
  bypassKind = "bypass",
  showingAudit = false,
  mindViewOn = true,
  privateMode = false,
}: MindModeMenuProps) {
  const bypass = mode === "bypass" || mode === "bypass_all";
  return (
    <div
      role="dialog"
      aria-label="What the mind may do without asking"
      style={{
        width: 340,
        boxSizing: "border-box",
        borderRadius: v("r-lg"),
        background: v("bg-card"),
        boxShadow: ring(bypass ? v("color-danger") : v("glass-border-strong")),
        padding: v("sp-3"),
        display: "flex",
        flexDirection: "column",
        gap: v("sp-2"),
      }}
    >
      {confirmingBypass ? (
        <>
          <span style={{ ...text(v("fs-body-strong"), 600, v("color-danger")), height: 18, display: "flex", alignItems: "center" }}>Stop asking me, for a while</span>
          <ModeRow label="Bypass" means="Asks before what can't be undone; commands once." selected={bypassKind === "bypass"} danger />
          <ModeRow label="Full bypass" means="Asks nothing, not even those." selected={bypassKind === "bypass_all"} danger />
          <span style={{ ...text(v("fs-caption"), 400, v("text-secondary")), ...wrap, height: 96, flex: "none" }}>
            {`Bypass still asks before anything an app marks as impossible to undo, such as a purchase or a calendar delete, and once per session before running commands. Full bypass asks nothing. Your ceiling (${ceiling}) still holds.`}
          </span>
          <MenuButton label="15 minutes" danger />
          <MenuButton label="1 hour" danger />
          <MenuButton label="Until the shell restarts" danger />
          <MenuButton label="Cancel" />
        </>
      ) : (
        <>
          <span style={{ ...text(v("fs-micro"), 600, v("text-dim")), ...elide, height: 16, display: "flex", alignItems: "center" }}>What the mind may do without asking</span>
          <div style={{ display: "flex", flexDirection: "column", gap: v("sp-1") }}>
            <ModeRow label="Plan" means="Look, don't touch. It reads; changes nothing." selected={mode === "plan"} />
            <ModeRow label="Ask" means="It asks you before anything that could matter." selected={mode === "ask"} />
            <ModeRow label="Auto" means="Gets on with it. Destructive ones still ask." selected={mode === "auto"} />
            <ModeRow label={bypass ? modeLabel : "Bypass"} means="It stops asking, for a while. Time-boxed, and it says so." selected={bypass} danger />
          </div>
          <div style={rule} />
          <span style={{ ...text(v("fs-micro"), 400, v("text-dim")), ...wrap, height: 30, flex: "none" }}>
            {`This machine never allows a caller past ${ceiling}, whatever the mode says. Settings → AI & Intelligence.`}
          </span>
          {rules.length > 0 || rulesCleared ? (
            <div style={{ display: "flex", flexDirection: "column", gap: v("sp-1") }}>
              <div style={rule} />
              <span style={{ ...text(v("fs-micro"), 600, v("text-dim")), height: 16, display: "flex", alignItems: "center" }}>Allowed for this session</span>
              {rules.length === 0 ? <span style={{ ...text(v("fs-micro"), 400, v("text-dim")), ...elide, height: 24, display: "flex", alignItems: "center" }}>{rulesCleared}</span> : null}
              {rules.map((r) => (
                <div key={`${r.app}.${r.action}`} style={{ height: 24, display: "flex", gap: v("sp-2") }}>
                  <span style={{ ...text(v("fs-caption")), ...elide, flex: "1 1 0", display: "flex", alignItems: "center" }}>{r.label}</span>
                  <span style={{ width: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="close" size={12} tint={v("text-dim")} />
                  </span>
                </div>
              ))}
            </div>
          ) : null}
          <div style={rule} />
          <div style={{ height: 28, flex: "none", display: "flex", alignItems: "center", padding: `0 ${v("sp-2")}`, borderRadius: v("r-sm") }}>
            <span style={{ ...text(v("fs-caption"), 400, v("text-secondary")), ...elide, flex: "1 1 0" }}>See what it did without asking</span>
            <span style={text(v("fs-micro"), 400, v("text-dim"))}>{audit.length}</span>
          </div>
          {showingAudit ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {audit.length === 0 ? (
                <span style={{ ...text(v("fs-micro"), 400, v("text-dim")), ...elide, height: 20, display: "flex", alignItems: "center" }}>
                  Nothing yet. In Ask mode there is nothing to list — you were asked.
                </span>
              ) : null}
              {audit.map((e, i) => (
                <div key={i} style={{ height: 20, display: "flex", alignItems: "center", gap: v("sp-2") }}>
                  <span style={text(v("fs-micro"), 400, v("text-dim"))}>{e.at}</span>
                  <span style={text(v("fs-micro"))}>{e.what}</span>
                  <span style={{ ...text(v("fs-micro"), 400, v("text-secondary")), ...elide, flex: "1 1 0" }}>{e.actor}</span>
                  <span style={{ ...text(v("fs-micro"), 400, v("text-dim")), ...elide, flex: "1 1 0" }}>{e.args}</span>
                  <span style={text(v("fs-micro"), 400, e.outcome === "ok" ? v("color-success") : v("color-warning"))}>{e.outcome}</span>
                </div>
              ))}
              <span style={{ ...text(v("fs-micro"), 400, v("text-dim")), ...elide, height: 26, display: "flex", alignItems: "center" }}>
                The full list is in ~/.local/share/yantrik/mind-audit.jsonl
              </span>
            </div>
          ) : null}
          <div style={rule} />
          <div style={{ height: 28, flex: "none", display: "flex", alignItems: "center", gap: v("sp-2"), padding: `0 ${v("sp-2")}`, borderRadius: v("r-sm") }}>
            <span style={{ ...text(v("fs-caption"), 400, v("text-secondary")), ...elide, flex: "1 1 0" }}>Apps it opens go</span>
            <span style={text(v("fs-caption"), 600, mindViewOn ? v("accent") : v("text-primary"))}>{mindViewOn ? "in Mind View" : "on my desktop"}</span>
          </div>
          <div style={rule} />
          <ModeRow
            label={privateMode ? "Private: on" : "Private"}
            means={privateMode ? "The Mind is off and nothing is recorded. Press to end." : "Turn the Mind off and record nothing, until you end it."}
            selected={privateMode}
          />
        </>
      )}
    </div>
  );
}
