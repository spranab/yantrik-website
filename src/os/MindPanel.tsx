import type { CSSProperties, ReactNode } from "react";
import { Icon } from "./Icon";
import { MindMark } from "./MindMark";
import { elide, ring, text, v } from "./css";
import type { MindMode, MindPanelAct, MindPanelAgent, MindPanelNow, MindPanelRecipe } from "./types";

export type MindPanelProps = {
  /** Expanded (the 302px card) or the 44px strip. */
  open: boolean;
  now: MindPanelNow;
  agents?: MindPanelAgent[];
  recipes?: MindPanelRecipe[];
  acts?: MindPanelAct[];
  mode: MindMode;
  modeLabel: string;
  ceiling: string;
  agentMode?: boolean;
  machine?: { cpuPercent: number; memPercent: number; memText: string; swapPercent: number; swapText: string; diskPercent: number; diskText: string };
  /** The card's ceiling: the panel's height less sp-4 above and below. */
  heightCeiling?: number;
};

const sectionLabel = (s: string, extra?: CSSProperties) => (
  <span style={{ ...text(v("fs-micro"), 500, v("text-dim")), letterSpacing: 1, display: "flex", alignItems: "center", ...extra }}>{s}</span>
);

/** 11px of space, a 1px `separator`, 11px of space. */
const separator = (
  <div style={{ flex: "none" }}>
    <div style={{ height: 11 }} />
    <div style={{ height: 1, background: v("separator") }} />
    <div style={{ height: 11 }} />
  </div>
);

function KeyValue({ k, value, dim = false }: { k: string; value: string; dim?: boolean }) {
  return (
    <div style={{ height: 22, flex: "none", display: "flex", alignItems: "center", gap: v("sp-2") }}>
      <span style={{ ...text(v("fs-caption"), 400, v("text-secondary")), width: 62, flex: "none" }}>{k}</span>
      <span style={{ ...text(v("fs-caption"), dim ? 400 : 500, dim ? v("text-dim") : v("text-primary")), ...elide, flex: "1 1 0", textAlign: "right" }}>{value}</span>
    </div>
  );
}

const stateColor = (s: string) =>
  s === "waiting_for_you"
    ? v("amber")
    : s === "thinking" || s === "running_tool" || s === "running"
      ? v("accent")
      : s === "ready" || s === "attached"
        ? v("color-success")
        : s === "offline" || s === "failed"
          ? v("color-danger")
          : v("text-dim");

const StateDot = ({ state }: { state: string }) => <span style={{ width: 7, height: 7, borderRadius: 3.5, flex: "none", background: stateColor(state) }} />;

function MiniMeter({ name, value, percent, tone }: { name: string; value: string; percent: number; tone: string }) {
  return (
    <div style={{ flex: "1 1 0", display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
      <div style={{ display: "flex" }}>
        <span style={{ ...text(v("fs-micro"), 400, v("text-secondary")), flex: "1 1 0" }}>{name}</span>
        <span style={{ ...text(v("fs-micro"), 500), ...elide }}>{value}</span>
      </div>
      <div style={{ height: 3, borderRadius: 1.5, background: v("border-strong") }}>
        <div style={{ height: 3, width: `${Math.max(0, Math.min(100, percent))}%`, borderRadius: 1.5, background: tone }} />
      </div>
    </div>
  );
}

/**
 * The right edge of every screen: MindPanel in crates/yantrik-ui-slint/ui/components/mind_panel.slint.
 *
 * Expanded, a 302px card of `glass-rail` (r-lg, a `border-card` hairline, padding sp-4) placed sp-4
 * in from the right and below the status bar: Now (the 34px MindMark, the mind at headline and
 * its state dot), the mode and the ceiling, then CONTEXT, WORKING and RECENT ACTIONS, each under
 * an 11px SectionLabel between 1px separators, rows of 22px. Collapsed, the 44px strip.
 */
export function MindPanel(p: MindPanelProps) {
  return p.open ? <MindCard {...p} /> : <MindStrip now={p.now} recipes={p.recipes?.length ?? 0} />;
}

function MindCard({ now, agents = [], recipes = [], acts = [], mode, modeLabel, ceiling, agentMode = false, machine, heightCeiling }: MindPanelProps) {
  const bypass = mode === "bypass" || mode === "bypass_all";
  const modeTone = bypass ? v("color-danger") : mode === "plan" ? v("amber") : v("text-secondary");
  return (
    <div
      style={{
        width: 302,
        maxHeight: heightCeiling,
        boxSizing: "border-box",
        borderRadius: v("r-lg"),
        background: v("glass-rail"),
        boxShadow: ring(v("border-card")),
        overflow: "hidden",
        padding: v("sp-4"),
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Now */}
      <div style={{ height: 40, flex: "none", display: "flex", gap: 10 }}>
        <div style={{ flex: "1 1 0", minWidth: 0, display: "flex", alignItems: "center", gap: 10, paddingLeft: 2 }}>
          <MindMark initial={now.initial} builtin={now.builtin} online={now.state !== "offline" && now.known} />
          <div style={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{ ...text(v("fs-headline"), 600), ...elide }}>{now.known ? now.mind : "Mind not known yet"}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <StateDot state={now.state} />
              <span style={{ ...text(v("fs-caption"), 400, now.modelNamed ? v("text-secondary") : v("text-dim")), ...elide, flex: "1 1 0" }}>
                {now.known ? `${now.state} · ${now.model}` : "the host has not said yet"}
              </span>
            </span>
          </div>
        </div>
        <span style={{ width: 28, flex: "none", display: "flex", alignItems: "center" }}>
          <span style={{ width: 28, height: 28, borderRadius: v("r-sm"), display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="chevron-right" size={14} thickness={1.8} tint={v("text-secondary")} />
          </span>
        </span>
      </div>
      <div style={{ height: 10, flex: "none" }} />
      {/* The mode and the machine's ceiling */}
      <div style={{ height: 24, flex: "none", display: "flex", alignItems: "center", gap: v("sp-2") }}>
        <span
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "0 9px 0 8px",
            borderRadius: v("r-sm"),
            flex: "none",
            background: bypass ? v("color-danger-dim") : mode === "plan" ? v("tint-amber") : v("hover-fill"),
            boxShadow: bypass ? ring(v("color-danger")) : undefined,
          }}
        >
          <Icon name={mode === "plan" ? "eye" : "shield"} size={12} tint={modeTone} />
          <span style={text(v("fs-micro"), bypass ? 700 : 500, bypass ? v("color-danger") : mode === "plan" ? v("amber") : v("text-primary"))}>{`Mode ${modeLabel}`}</span>
        </span>
        <span style={{ ...text(v("fs-micro"), 400, v("text-secondary")), ...elide, flex: "1 1 0" }}>{ceiling ? `ceiling ${ceiling}` : "ceiling not known"}</span>
      </div>

      {separator}
      {sectionLabel("CONTEXT", { height: 16 })}
      <div style={{ height: 4, flex: "none" }} />
      <KeyValue k="Project" value={now.project || "not detected"} dim={!now.project} />
      <KeyValue k="Memory" value={now.memory} dim={!now.memoryKnown} />
      <KeyValue k="Minds" value={now.minds} dim={!now.known} />

      {separator}
      <div style={{ height: 18, flex: "none", display: "flex", alignItems: "center", gap: 6 }}>
        {sectionLabel("WORKING", { flex: "1 1 0" })}
        {now.needsYou > 0 ? <span style={text(v("fs-micro"), 600, v("amber"))}>{`${now.needsYou} need${now.needsYou === 1 ? "s" : ""} you`}</span> : null}
        {now.running > 0 ? <span style={text(v("fs-micro"), 400, v("text-secondary"))}>{`${now.running} at work`}</span> : null}
      </div>
      <div style={{ height: 4, flex: "none" }} />
      {agents.length === 0 && recipes.length === 0 ? (
        <span style={{ ...text(v("fs-caption"), 400, v("text-dim")), height: 22, flex: "none", display: "flex", alignItems: "center" }}>
          {now.recipesKnown ? "Nothing at work." : "No agents at work. Recipes not known yet."}
        </span>
      ) : null}
      {agents.map((a) => (
        <Row key={a.id} height={40}>
          <span style={{ alignSelf: "flex-start", paddingTop: 9 }}>
            <StateDot state={a.state} />
          </span>
          <span style={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{ display: "flex", gap: 6 }}>
              <span style={text(v("fs-caption"), 600)}>{a.mind}</span>
              <span style={{ ...text(v("fs-caption"), 400, v("text-secondary")), ...elide, flex: "1 1 0" }}>{a.title}</span>
            </span>
            <span style={{ ...text(v("fs-micro"), a.state === "waiting_for_you" ? 600 : 400, a.state === "waiting_for_you" ? v("amber") : v("text-dim")), ...elide }}>
              {a.since ? `${a.label} · ${a.since}` : a.label}
            </span>
          </span>
        </Row>
      ))}
      {now.moreAgents > 0 ? (
        <Row height={22}>
          <span style={text(v("fs-micro"), 400, v("text-secondary"))}>{`+${now.moreAgents} more in Agents`}</span>
        </Row>
      ) : null}
      {recipes.map((r) => (
        <Row key={r.id} height={22}>
          <Icon name="template" size={11} tint={r.status === "waiting" ? v("amber") : v("accent")} />
          <span style={{ ...text(v("fs-caption"), 500), ...elide, maxWidth: 110 }}>{r.name}</span>
          <span style={{ ...text(v("fs-micro"), 400, r.status === "waiting" ? v("amber") : v("text-dim")), ...elide, flex: "1 1 0" }}>{r.step}</span>
        </Row>
      ))}

      {separator}
      <div style={{ height: 18, flex: "none", display: "flex", alignItems: "center" }}>
        {sectionLabel("RECENT ACTIONS", { flex: "1 1 0" })}
        <span style={text(v("fs-micro"), 400, v("text-dim"))}>unasked · mind audit</span>
      </div>
      <div style={{ height: 4, flex: "none" }} />
      {acts.length === 0 ? (
        <span style={{ ...text(v("fs-caption"), 400, v("text-dim")), height: 22, flex: "none", display: "flex", alignItems: "center" }}>Nothing has run without asking.</span>
      ) : null}
      {acts.map((a, i) => (
        <div key={i} style={{ height: 22, flex: "none", display: "flex", alignItems: "center", gap: 8, padding: "0 6px" }}>
          <Icon
            name={a.outcome === "ok" ? "check" : a.outcome === "failed" ? "warning" : "clock"}
            size={11}
            thickness={1.8}
            tint={a.outcome === "ok" ? v("color-success") : a.outcome === "failed" ? v("color-danger") : v("text-dim")}
          />
          <span style={{ ...text(v("fs-caption")), ...elide, flex: "1 1 0" }}>{a.what}</span>
          {a.outcome !== "ok" ? (
            <span style={{ ...text(v("fs-micro"), 400, a.outcome === "failed" ? v("color-danger") : v("text-secondary")), ...elide, maxWidth: 70 }}>{a.outcome}</span>
          ) : null}
          <span style={text(v("fs-micro"), 400, v("text-dim"))}>{a.when}</span>
        </div>
      ))}

      {agentMode && machine ? (
        <>
          {separator}
          {sectionLabel("MACHINE", { height: 16 })}
          <div style={{ height: 6, flex: "none" }} />
          <div style={{ display: "flex", gap: v("sp-3") }}>
            <MiniMeter name="CPU" value={`${machine.cpuPercent}%`} percent={machine.cpuPercent} tone={machine.cpuPercent >= 90 ? v("color-warning") : v("accent")} />
            <MiniMeter name="Memory" value={machine.memText} percent={machine.memPercent} tone={machine.memPercent >= 90 ? v("color-warning") : v("accent")} />
          </div>
          <div style={{ height: 8, flex: "none" }} />
          <div style={{ display: "flex", gap: v("sp-3") }}>
            <MiniMeter name="Swap" value={machine.swapText} percent={machine.swapPercent} tone={machine.swapPercent > 0 ? v("color-warning") : v("color-success")} />
            <MiniMeter name="Disk" value={machine.diskText} percent={machine.diskPercent} tone={machine.diskPercent >= 90 ? v("color-danger") : v("text-secondary")} />
          </div>
          <div style={{ height: 8, flex: "none" }} />
          <div style={{ height: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, flex: "none", background: now.servicesTrouble ? v("color-danger") : v("color-success") }} />
            <span style={{ ...text(v("fs-caption"), 400, now.servicesTrouble ? v("color-danger") : v("text-secondary")), ...elide }}>{`Services: ${now.services}`}</span>
          </div>
        </>
      ) : null}
    </div>
  );
}

function Row({ height, children }: { height: number; children: ReactNode }) {
  return <div style={{ height, flex: "none", display: "flex", alignItems: "center", gap: 8, padding: "0 6px", borderRadius: v("r-sm") }}>{children}</div>;
}

/** Collapsed: the 44px `glass-rail` strip with its hairline, the 28px mark, a dot per agent, the chevron. */
function MindStrip({ now, recipes }: { now: MindPanelNow; recipes: number }) {
  const dots = Math.min(now.running, 6);
  return (
    <div style={{ position: "relative", width: 44, height: "100%", background: v("glass-rail") }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1, height: "100%", background: v("border-card") }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "10px 0" }}>
        <span style={{ position: "relative", width: 34, height: 34 }}>
          <span style={{ position: "absolute", left: 3, top: 3 }}>
            <MindMark initial={now.initial} builtin={now.builtin} online={now.state !== "offline" && now.known} size={28} />
          </span>
          {now.needsYou > 0 ? <span style={{ position: "absolute", inset: 0, borderRadius: 17, boxShadow: ring(v("amber"), 2) }} /> : null}
        </span>
        {Array.from({ length: dots }, (_, i) => (
          <span key={i} style={{ height: 8, display: "flex", alignItems: "center" }}>
            <span style={{ width: 7, height: 7, borderRadius: 3.5, background: i < now.needsYou ? v("amber") : v("accent") }} />
          </span>
        ))}
        {now.running > 6 ? <span style={text(v("fs-micro"), 400, v("text-secondary"))}>{`+${now.running - 6}`}</span> : null}
        {recipes > 0 ? <Icon name="template" size={12} tint={v("text-secondary")} /> : null}
      </div>
      <span style={{ position: "absolute", left: 15, bottom: 12 }}>
        <Icon name="chevron-left" size={14} thickness={1.8} tint={v("text-dim")} />
      </span>
    </div>
  );
}
