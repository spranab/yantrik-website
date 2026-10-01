import { AppTile } from "./AppTile";
import { Icon } from "./Icon";
import { appOrWindow } from "./icons";
import { elide, ring, text, v } from "./css";
import type { CompanionStatus, WindowItem } from "./types";

export type TaskbarProps = {
  width?: number;
  /** Open windows, most recently focused first; the first is drawn as active. */
  windows: WindowItem[];
  launcherLabel?: string;
  /** The mind the chat talks to: "Chat · Yantrik Mind". Empty: just "Chat". */
  chatWith?: string;
  companionCount?: number;
  companionOnline?: boolean;
  companionStatus?: CompanionStatus;
  /** A shell screen set aside by its own minimise button, drawn first. */
  minimized?: { title: string; appId: string };
};

const sep = <span style={{ width: 1, height: 20, background: v("separator"), flex: "none" }} />;

/**
 * Launcher, open windows, the companion: crates/yantrik-ui-slint/ui/components/taskbar.slint.
 * 40px of `glass-panel` with a 1px `separator` on top; padding 4 above and below, sp-2 at the
 * left and 12 + sp-2 at the right, where the Show desktop strip reaches the corner.
 */
export function Taskbar({
  width = 1280,
  windows,
  launcherLabel = "Apps",
  chatWith = "",
  companionCount = 0,
  companionOnline = true,
  companionStatus = "idle",
  minimized,
}: TaskbarProps) {
  const chatDot = !companionOnline ? v("color-danger") : companionStatus === "thinking" ? v("accent-light") : v("accent");
  return (
    <div style={{ position: "relative", width, height: v("taskbar-height"), background: v("glass-panel") }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 1, background: v("separator") }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: v("sp-2"),
          height: "100%",
          boxSizing: "border-box",
          padding: `4px calc(12px + ${v("sp-2")}) 4px ${v("sp-2")}`,
        }}
      >
        {/* Launcher: the accent button, its row centred with 10px either side */}
        <span
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            padding: "0 10px",
            borderRadius: v("r-sm"),
            background: v("accent"),
            flex: "none",
          }}
        >
          <Icon name="apps" tint={v("text-on-accent")} thickness={1.8} />
          <span style={text(v("font-label"), 600, v("text-on-accent"))}>{launcherLabel}</span>
        </span>

        {sep}

        {/* Open windows */}
        <div style={{ flex: "1 1 0", minWidth: 0, height: "100%", display: "flex", alignItems: "stretch", gap: 5, overflow: "hidden" }}>
          {minimized ? <Entry title={minimized.title} appId={minimized.appId} active={false} minimizedScreen /> : null}
          {windows.map((w, i) => (
            <Entry key={`${w.appId}:${w.title}`} title={w.appId === "mind-view" ? w.subtitle ?? w.title : w.title} appId={w.appId} active={i === 0} />
          ))}
        </div>

        {sep}

        {/* Companion: "Chat · <mind>" outlined, a 6px dot before it */}
        <span
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            padding: "0 11px",
            borderRadius: v("r-sm"),
            boxShadow: ring(v("border-default")),
            flex: "none",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: 3, background: chatDot, flex: "none" }} />
          <span style={text(v("fs-caption"))}>{chatWith ? `Chat · ${chatWith}` : "Chat"}</span>
          {companionCount > 0 ? <span style={text(v("fs-micro"), 600, v("accent"))}>{companionCount}</span> : null}
        </span>
      </div>

      {/* Show desktop: a 12px strip in the corner with a hairline on its left */}
      <span style={{ position: "absolute", right: 0, top: 0, width: 12, height: "100%" }}>
        <span style={{ position: "absolute", left: 0, top: "20%", width: 1, height: "60%", background: v("separator") }} />
      </span>
    </div>
  );
}

/** One window entry: the app's 22px tile, 8px, the title at fs-caption; 10px either side. */
function Entry({ title, appId, active, minimizedScreen = false }: { title: string; appId: string; active: boolean; minimizedScreen?: boolean }) {
  return (
    <span
      style={{
        position: "relative",
        // min(220px, the row + 22px): the 22 is extra room the row is laid out in.
        maxWidth: 220,
        paddingRight: 22,
        boxSizing: "border-box",
        display: "flex",
        flex: "none",
        borderRadius: v("r-sm"),
        background: active ? v("hover-fill-strong") : "transparent",
        overflow: "hidden",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 10px", minWidth: 0 }}>
        <AppTile size={22} appId={appId} glyph={appOrWindow(appId)} dimmed={minimizedScreen || !active} />
        <span style={{ ...text(v("fs-caption"), active ? 500 : 400, active ? v("text-primary") : v("text-secondary")), ...elide, maxWidth: 170 }}>
          {title}
        </span>
      </span>
      {/* The active underline: the one piece of state on the bar */}
      <span
        style={{
          position: "absolute",
          left: "50%",
          bottom: 0,
          width: 24,
          height: 3,
          marginLeft: -12,
          borderRadius: 1.5,
          background: active ? v("accent") : "transparent",
        }}
      />
    </span>
  );
}
