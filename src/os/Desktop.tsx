import "./os.css";
import type { ReactNode } from "react";
import { ApprovalCard } from "./ApprovalCard";
import { Lens, type LensProps } from "./Lens";
import { MindModeMenu, type MindModeMenuProps } from "./MindModeMenu";
import { MindPanel, type MindPanelProps } from "./MindPanel";
import { MindView, type MindViewProps } from "./MindView";
import { StatusBar, type StatusBarProps } from "./StatusBar";
import { Taskbar, type TaskbarProps } from "./Taskbar";
import { v } from "./css";
import type { ApprovalRequest } from "./types";

export type DesktopProps = {
  width?: number;
  height?: number;
  /** The wallpaper preset's bitmap, stretched over everything under the status bar. */
  wallpaper?: string;
  statusBar: Omit<StatusBarProps, "width">;
  taskbar: Omit<TaskbarProps, "width">;
  /** Mind View's window and where the person's labwc has it. */
  mindView?: (MindViewProps & { x: number; y: number }) | null;
  /**
   * Which is in front: the apps' windows, or the shell. The shell is one fullscreen window to
   * the compositor, and an approval card or the Lens opening raises it (windows.rs
   * `raise_shell`), over every window, Mind View included.
   */
  front?: "windows" | "shell";
  /** The Lens open in chat mode. While it is, it holds the approval card itself. */
  lens?: LensProps | null;
  /** The card in the desktop's corner, drawn when the Lens is not the one showing it. */
  approval?: ApprovalRequest | null;
  onDeny?: (id: string) => void;
  onAllow?: (id: string) => void;
  mindPanel?: MindPanelProps | null;
  modeMenu?: MindModeMenuProps | null;
  /** The desktop screen's own content (greeting, ask bar, workspace), under everything else. */
  home?: ReactNode;
};

const at = (x: number, y: number, z: number, children: ReactNode, w?: number) => (
  <div style={{ position: "absolute", left: x, top: y, zIndex: z, width: w }}>{children}</div>
);

/**
 * The desktop, composed as app.slint composes it, in the OS's own logical pixels (1280×800 by
 * default) for the caller to scale as one unit. Stateless: every value is a prop.
 *
 * The shell's window, bottom to top: `bg-deep`; the wallpaper from y = 32; the desktop's own
 * content; the mind panel (hidden while the Lens is up, its room kept); the Lens; the corner
 * card; the mode menu; the status bar and the taskbar. Mind View is a window of its own, above
 * the shell or under it.
 */
export function Desktop({
  width = 1280,
  height = 800,
  wallpaper = "/os/wallpapers/serenity.png",
  statusBar,
  taskbar,
  mindView,
  front = "windows",
  lens,
  approval,
  onDeny,
  onAllow,
  mindPanel,
  modeMenu,
  home,
}: DesktopProps) {
  const bar = 32; // Theme.status-bar-height
  const task = 40; // Theme.taskbar-height
  const docks = width >= 1100;
  const panelCovered = !!lens;
  return (
    <div className="y-os" style={{ position: "relative", width, height, overflow: "hidden", background: v("bg-deep") }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={wallpaper} alt="" style={{ position: "absolute", left: 0, top: bar, width, height: height - bar, objectFit: "fill" }} />
      {/* In light mode the desktop washes the wallpaper (desktop.slint:333); in dark the wash is transparent. */}
      <div style={{ position: "absolute", left: 0, top: bar, width, height: height - bar, background: "var(--y-os-wallpaper-wash)" }} />
      {home ? at(0, bar, 1, home, width) : null}

      {mindPanel && !panelCovered
        ? mindPanel.open && docks
          ? at(width - 302 - 16, bar + 16, 2, <MindPanel {...mindPanel} heightCeiling={height - bar - task - 32} />)
          : at(width - 44, bar, 2, <div style={{ height: height - bar - task }}><MindPanel {...mindPanel} open={false} /></div>)
        : null}

      {lens ? at(width - 380, bar, 3, <Lens {...lens} height={height - bar - task} onDeny={onDeny} onAllow={onAllow} />) : null}

      {approval && !lens
        ? at(width - 420, bar + 16, 4, <ApprovalCard data={approval} onDeny={onDeny ? () => onDeny(approval.id) : undefined} onAllow={onAllow ? () => onAllow(approval.id) : undefined} />, 404)
        : null}

      {modeMenu ? at(width - 352, bar + 4, 5, <MindModeMenu {...modeMenu} />) : null}

      {at(0, 0, 6, <StatusBar {...statusBar} width={width} />)}
      {at(0, height - task, 6, <Taskbar {...taskbar} width={width} />)}

      {mindView && front === "windows" ? at(mindView.x, mindView.y, 10, <MindView {...mindView} />) : null}
    </div>
  );
}
