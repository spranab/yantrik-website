import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { ModeChip } from "./ModeChip";
import { MindChip } from "./MindChip";
import { YantrikMark } from "./YantrikMark";
import { elide, ring, text, v } from "./css";
import type { CompanionStatus, MindMode } from "./types";

export type StatusBarProps = {
  /** The bar's width, which decides what it has room for (it is the screen's). */
  width?: number;
  clock: string;
  date?: string;
  companionStatus?: CompanionStatus;
  companionOnline?: boolean;
  cpuPercent: number;
  memText: string;
  mode: MindMode;
  modeLabel: string;
  privateMode?: boolean;
  /** Which mind is answering. Empty or "companion" is the built-in one and draws no chip. */
  harnessId?: string;
  harnessName?: string;
  /** An attached mind is answering, which hides the built-in companion's privacy badge. */
  harnessDriving?: boolean;
  aiPrivacyMode?: "local" | "cloud" | "hybrid";
  aiProviderLabel?: string;
  networkOnline?: boolean;
  networkMedium?: "" | "wifi" | "ethernet";
  notificationUnread?: number;
  whisperHintCount?: number;
  pendingCount?: number;
  incognito?: boolean;
  dnd?: boolean;
  assistantOfflineNotice?: string;
  mindsNotice?: string;
  activeProject?: string;
  aiContextText?: string;
  /** The free-AI card's "paste the key" chip label, while a key is awaited. */
  freeAiChipLabel?: string;
  battery?: { level: number; charging: boolean };
};

const BAR = v("status-bar-height");

/** A 20px chip on the 32px line, as every chip on the bar is drawn. */
function Pill({ children, fill, edge, padX = 7 }: { children: ReactNode; fill: string; edge?: string; padX?: number }) {
  return (
    <span style={{ display: "flex", alignItems: "center", height: BAR, flex: "none" }}>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          height: 20,
          padding: `0 calc(${padX}px + ${v("sp-3")} / 2)`,
          borderRadius: v("r-sm"),
          background: fill,
          boxShadow: edge ? ring(edge) : undefined,
        }}
      >
        {children}
      </span>
    </span>
  );
}

/** A count badge: 20px tall, at least 20 wide, round (status_bar.slint ~547–658). */
function Count({ n, fill, color }: { n: string; fill: string; color: string }) {
  return (
    <span style={{ display: "flex", alignItems: "center", height: BAR, padding: "0 2px", flex: "none" }}>
      <span
        style={{
          ...text(v("fs-micro"), 700, color),
          minWidth: 20,
          height: 20,
          padding: "0 5px",
          borderRadius: 10,
          background: fill,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {n}
      </span>
    </span>
  );
}

/**
 * The whole machine on one 32px line: crates/yantrik-ui-slint/ui/components/status_bar.slint.
 * Three zones of equal stretch; the left starts at sp-3, the right ends at sp-3, sp-3 between
 * items. `glass-panel` over the shell's `bg-deep`, and a 1px `separator` along the bottom.
 */
export function StatusBar(p: StatusBarProps) {
  const width = p.width ?? 1280;
  const online = p.companionOnline ?? true;
  const status = p.companionStatus ?? "idle";
  const thinking = status === "thinking";
  const dot = !online ? v("color-danger") : thinking ? v("accent") : status === "listening" ? v("accent-light") : v("text-dim");
  const showMind = !!p.harnessId && p.harnessId !== "companion";
  const privacy = p.aiPrivacyMode ?? "local";
  const micro = v("fs-micro");

  return (
    <div
      style={{
        position: "relative",
        height: BAR,
        width,
        background: v("glass-panel"),
        display: "flex",
        padding: `0 ${v("sp-3")}`,
        boxSizing: "border-box",
      }}
    >
      {/* Bottom border — single subtle line */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1, background: v("separator") }} />

      {/* LEFT: the mark, the companion's dot, the name */}
      <div style={{ flex: "1 1 0", display: "flex", alignItems: "center", gap: v("sp-3"), minWidth: "max-content" }}>
        <YantrikMark size={20} />
        <span style={{ width: 24, height: BAR, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <span
            className={thinking ? "y-thinking" : undefined}
            style={{ width: 6, height: 6, borderRadius: 3, background: dot, transition: `background ${v("dur-normal")}` }}
          />
        </span>
        <span style={text(v("fs-body"), 600)}>Yantrik</span>
        {p.assistantOfflineNotice ? (
          <Pill fill={v("color-danger-dim")} edge={v("color-danger")}>
            <Icon name="warning" size={12} tint={v("color-danger")} />
            <span style={{ ...text(micro, 700, v("color-danger")), ...elide, maxWidth: 300 }}>{p.assistantOfflineNotice}</span>
          </Pill>
        ) : null}
        {p.mindsNotice ? (
          <Pill fill={v("color-danger-dim")} edge={v("color-danger")}>
            <Icon name="warning" size={12} tint={v("color-danger")} />
            <span style={{ ...text(micro, 700, v("color-danger")), ...elide, maxWidth: 300 }}>{p.mindsNotice}</span>
          </Pill>
        ) : null}
        {p.activeProject && width >= 1000 ? (
          <span
            style={{
              ...text(micro, 500, v("accent")),
              height: 20,
              padding: `0 calc(${v("sp-3")} / 2)`,
              borderRadius: 10,
              background: v("tint-accent"),
              boxShadow: ring(v("border-subtle")),
              display: "flex",
              alignItems: "center",
            }}
          >
            {p.activeProject}
          </span>
        ) : null}
      </div>

      {/* CENTRE: the AI context lane */}
      <div style={{ flex: "1 1 0", display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0 }}>
        {p.aiContextText && width >= 1200 ? (
          <span style={{ ...text(v("fs-caption"), 400, v("text-dim")), ...elide, maxWidth: 300 }}>{p.aiContextText}</span>
        ) : null}
      </div>

      {/* RIGHT: load | mode | mind | badges | network | power | clock + date */}
      <div style={{ flex: "1 1 0", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: v("sp-3"), minWidth: "max-content" }}>
        {width >= 1100 ? (
          <span style={{ display: "flex", alignItems: "center", gap: v("sp-2") }}>
            <span style={text(micro, 500, v("text-dim"))}>CPU</span>
            <span style={{ ...text(micro, 500, p.cpuPercent >= 90 ? v("color-warning") : v("text-secondary")), minWidth: 26 }}>
              {p.cpuPercent}%
            </span>
            <span style={text(micro, 500, v("text-dim"))}>MEM</span>
            <span style={text(micro, 500, v("text-secondary"))}>{p.memText}</span>
          </span>
        ) : null}
        <span style={{ width: 1, height: 14, background: v("separator"), flex: "none" }} />
        {p.freeAiChipLabel ? (
          <Pill fill={v("tint-amber")} edge={v("amber")}>
            <span style={{ ...text(micro, 600, v("amber")), ...elide, maxWidth: 320 }}>
              {p.freeAiChipLabel} · clipboard history paused
            </span>
          </Pill>
        ) : null}
        <ModeChip mode={p.mode} label={p.modeLabel} privateMode={p.privateMode} />
        {showMind ? <MindChip name={p.harnessName ?? ""} /> : null}
        {!p.harnessDriving ? (
          <Pill fill={v("hover-fill")}>
            <Icon
              name={privacy === "local" ? "lock" : privacy === "cloud" ? "cloud" : "hybrid"}
              size={12}
              tint={privacy === "local" ? v("color-success") : privacy === "cloud" ? v("holo-blue") : v("color-warning")}
            />
            <span style={{ ...text(micro, 500, v("text-secondary")), ...elide, maxWidth: 150 }}>
              {p.aiProviderLabel || (privacy === "local" ? "Local" : privacy === "cloud" ? "Cloud" : "Hybrid")}
            </span>
          </Pill>
        ) : null}
        {p.whisperHintCount ? <Count n={String(p.whisperHintCount)} fill={v("accent-dim")} color={v("text-on-accent")} /> : null}
        {p.notificationUnread ? (
          <Count n={p.notificationUnread > 99 ? "99+" : String(p.notificationUnread)} fill={v("accent")} color={v("text-on-accent")} />
        ) : null}
        {p.incognito ? (
          <span style={{ ...text(micro, 700, v("color-danger")), letterSpacing: 0.5, height: 20, padding: "0 5px", borderRadius: v("r-sm"), background: v("color-danger-dim"), display: "flex", alignItems: "center" }}>
            INC
          </span>
        ) : null}
        {p.dnd ? (
          <span style={{ ...text(micro, 700, v("color-warning")), letterSpacing: 0.5, height: 20, padding: "0 5px", borderRadius: v("r-sm"), background: v("color-warning-dim"), display: "flex", alignItems: "center" }}>
            DND
          </span>
        ) : null}
        {p.pendingCount ? <Count n={String(p.pendingCount)} fill={v("amber-dim")} color={v("amber")} /> : null}

        {/* Network + battery */}
        <span style={{ display: "flex", alignItems: "center", gap: v("sp-2"), height: BAR }}>
          <Icon
            name={p.networkMedium === "wifi" ? "wifi" : "network"}
            size={13}
            tint={p.networkOnline ? v("color-success") : v("text-dim")}
          />
          {p.battery ? <Battery {...p.battery} /> : null}
        </span>

        {/* Power */}
        <span style={{ width: 22, height: BAR, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <Icon name="power" size={13} tint={v("text-dim")} />
        </span>

        {/* Clock + date, right-most */}
        <span style={text(v("fs-caption"), 500)}>{p.clock}</span>
        {p.date && width >= 1000 ? <span style={text(v("fs-caption"), 400, v("text-dim"))}>{p.date}</span> : null}
      </div>
    </div>
  );
}

/** The battery glyph (status_bar.slint ~680–720), only when there is a battery. */
function Battery({ level, charging }: { level: number; charging: boolean }) {
  const low = level <= 20;
  const fill = charging ? v("color-success") : low ? v("color-danger") : level <= 50 ? v("color-warning") : v("text-secondary");
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ position: "relative", width: 20, height: 10, borderRadius: 2, boxShadow: ring(low ? v("color-danger") : v("text-dim")) }}>
        <span style={{ position: "absolute", left: 1.5, top: 1.5, height: 5, width: Math.max(0, (15 * level) / 100), borderRadius: 1, background: fill }} />
        <span style={{ position: "absolute", left: 20, top: 2.5, width: 1.5, height: 4, borderRadius: 0.5, background: v("text-dim") }} />
      </span>
      <span style={text(v("fs-micro"), 400, low ? v("color-danger") : v("text-dim"))}>{level}%</span>
    </span>
  );
}
