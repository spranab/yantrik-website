// The engine's state, drawn with the replica's own components: ReplayState → DesktopProps.
// Every word on the replica comes from the timeline; what is not in it is left out, not guessed.

import type { DesktopProps } from "@/os/Desktop";
import { NotesWindow } from "@/os/NotesWindow";
import { LabwcFrame } from "@/os/LabwcFrame";
import { v } from "@/os/css";
import type { ApprovalRequest, ContentBlock, MessageData, WindowItem } from "@/os/types";
import type { CardState, ReplayState, ToolItem } from "@/replay/engine";
import { clockText, dateText, notesDateText } from "@/replay/engine";
import type { Timeline } from "@/replay/types";

export const W = 1280;
export const H = 800;

/** Where Mind View sits on the desktop and how big its display is (70% of 1280×800). */
export const MIND_VIEW = { x: 0, y: 80, width: 896, height: 560 };
/** Where an app's window sits on Mind View's display. The timeline carries no geometry. */
const APP_IN_MIND_VIEW = { x: 68, y: 30, width: 760, height: 500 };
const NOTES_SIDEBAR = 268;

/** The two regions a narrow screen can show at a legible size, in desktop pixels. */
export const REGIONS = {
  lens: { start: W - 380, end: W },
  mindview: {
    start: MIND_VIEW.x + 1 + APP_IN_MIND_VIEW.x + NOTES_SIDEBAR + 1,
    end: MIND_VIEW.x + 1 + APP_IN_MIND_VIEW.x + APP_IN_MIND_VIEW.width,
  },
} as const;

const MODE_LABEL: Record<string, string> = { plan: "Plan", ask: "Ask", auto: "Auto", bypass: "Bypass" };
export const modeLabel = (mode: string) => MODE_LABEL[mode] ?? mode;

/** `key="value"` for each argument, long values cut, as the chat's one-line summary is. */
function argLine(args: object): string {
  return Object.entries(args as Record<string, unknown>)
    .map(([k, val]) => {
      const s = JSON.stringify(val) ?? String(val);
      return `${k}=${s.length > 46 ? `${s.slice(0, 44)}…"` : s}`;
    })
    .join(" ");
}

function toolBlock(m: ToolItem): ContentBlock {
  return {
    blockType: "tool",
    text: "",
    call: {
      name: m.tool,
      target: `${m.app}.${m.action}`,
      summary: `${m.tool} ${m.app}.${m.action} ${argLine(m.args)}`.trim(),
      status: m.result ? (m.result.ok ? "done" : "failed") : "running",
      output: m.result?.summary ?? "",
    },
  };
}

/** The transcript as the Lens draws it: the person's messages, and the mind's turns between them. */
export function toMessages(s: ReplayState): MessageData[] {
  const out: MessageData[] = [];
  for (const m of s.transcript) {
    if (m.kind === "user") {
      out.push({ role: "user", content: m.text });
      continue;
    }
    const block: ContentBlock = m.kind === "tool" ? toolBlock(m) : { blockType: "text", text: m.text };
    const last = out.at(-1);
    if (last && last.role === "assistant") last.blocks!.push(block);
    else out.push({ role: "assistant", content: "", blocks: [block] });
  }
  return out;
}

/** The card as the Lens holds it; once answered, the record it leaves (approvals.rs ~1174–1179). */
export function toApproval(card: CardState, recorded: string): ApprovalRequest {
  const name = `${card.app}.${card.action}`;
  const at = clockText(recorded, card.realMs);
  const decision = card.answer === "allow_once" ? "allowed" : card.answer === "deny" ? "denied" : "";
  return {
    id: "replay-card",
    agent: card.agent,
    onBehalf: "",
    requester: card.caller,
    verified: "",
    discrepancies: [],
    app: card.app,
    action: card.action,
    summary: card.does,
    purpose: card.says,
    callerSays: "",
    grade: card.grade,
    args: Object.entries(card.args).map(([k, val]) => `${k}: ${val}`),
    target: "",
    explained: "",
    warning: "",
    canSession: card.grade !== "dangerous",
    decision,
    record: decision === "allowed" ? `Allowed once: ${name} — ${at}` : decision === "denied" ? `Denied: ${name} — ${at}` : "",
    ageText: "",
  };
}

const wordCount = (s: string) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

function appWindow(app: string, title: string, s: ReplayState, tl: Timeline, active: boolean) {
  const { width, height } = APP_IN_MIND_VIEW;
  if (app === "notes") {
    const n = s.notes;
    return (
      <NotesWindow
        width={width}
        height={height}
        status="All changes saved"
        notes={n ? [{ id: "replay-note", title: n.title, preview: n.body.split("\n").find((l) => l.trim()) ?? "", date: notesDateText(tl.source.recorded, n.realMs), selected: true }] : []}
        allCount={n ? 1 : 0}
        pinCount={0}
        noteTitle={n?.title}
        content={n?.body}
        words={n ? wordCount(n.body) : 0}
      />
    );
  }
  // An app the replica has no window for: labwc's frame and its title, nothing drawn inside.
  return (
    <LabwcFrame title={title} active={active} contentWidth={width} contentHeight={height - 26}>
      <div style={{ position: "absolute", inset: 0, background: v("bg-deep") }} />
    </LabwcFrame>
  );
}

export function toDesktop(s: ReplayState, tl: Timeline, handlers: { onDeny?: () => void; onAllow?: () => void }): DesktopProps {
  const src = tl.source;
  const hasMindView = s.windows.some((w) => w.app === "mind-view");
  const inner = hasMindView ? s.windows.filter((w) => w.app !== "mind-view" && w.app !== "shell") : [];
  const thinking = s.thinking ? "thinking" : "idle";

  // The taskbar lists the person's own windows, the focused one first.
  const desktopWindows: WindowItem[] = hasMindView
    ? [{ appId: "mind-view", title: "Mind View", subtitle: inner.length ? `Mind View · ${inner.map((w) => w.title).join(", ")}` : "Mind View" }]
    : s.windows.filter((w) => w.app !== "shell").map((w) => ({ appId: w.app, title: w.title }));
  desktopWindows.sort((a, b) => Number(b.appId === s.front) - Number(a.appId === s.front));

  const approvals = s.card ? [toApproval(s.card, src.recorded)] : [];
  const waiting = s.status === "waiting";

  return {
    statusBar: {
      clock: clockText(src.recorded, s.realMs),
      date: dateText(src.recorded, s.realMs),
      companionStatus: thinking,
      mode: src.mode,
      modeLabel: modeLabel(src.mode),
      harnessId: src.mind.toLowerCase().replace(/\s+/g, "-"),
      harnessName: src.mind,
      harnessDriving: true,
      // The model is a cloud one, so the machine was online; its load was not recorded.
      networkOnline: true,
    },
    taskbar: { windows: desktopWindows, chatWith: src.mind, companionStatus: thinking },
    front: s.front === "shell" ? "shell" : "windows",
    mindView: hasMindView
      ? {
          ...MIND_VIEW,
          active: s.front !== null && s.front !== "shell",
          windows: inner.map((w) => ({
            key: w.app,
            x: APP_IN_MIND_VIEW.x,
            y: APP_IN_MIND_VIEW.y,
            node: <div className="y-hero-appear">{appWindow(w.app, w.title, s, tl, s.front === w.app)}</div>,
          })),
        }
      : null,
    lens: {
      mindName: src.mind,
      messages: toMessages(s),
      approvals,
      isGenerating: s.thinking,
      canOpenInAgents: true,
      sessionDisabledNote: "In the replay only Allow once and Deny were recorded.",
      expandCalls: true,
    },
    onDeny: waiting ? handlers.onDeny : undefined,
    onAllow: waiting ? handlers.onAllow : undefined,
  };
}
