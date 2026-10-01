// The shapes the replica's components take as props. Each mirrors a struct or a set of `in`
// properties in the Slint source it ports, with the same names in camelCase.

/** What the mind may do without asking (status_bar.slint `mind-mode`). */
export type MindMode = "plan" | "ask" | "auto" | "bypass" | "bypass_all";

/** The companion's state as the status bar and the taskbar read it. */
export type CompanionStatus = "idle" | "thinking" | "listening";

/** A taskbar entry (window_switcher.slint `WindowItem`, the fields the taskbar reads). */
export type WindowItem = {
  appId: string;
  title: string;
  /** What the strip shows for Mind View instead of its compositor title. */
  subtitle?: string;
};

/** intent_lens.slint `ApprovalRequest`. */
export type ApprovalRequest = {
  id: string;
  agent: string;
  onBehalf: string;
  requester: string;
  verified: string;
  discrepancies: string[];
  app: string;
  action: string;
  summary: string;
  purpose: string;
  callerSays: string;
  grade: "safe" | "standard" | "sensitive" | "dangerous";
  args: string[];
  target: string;
  explained: string;
  warning: string;
  canSession: boolean;
  /** "" while waiting; then allowed | denied | expired. */
  decision: "" | "allowed" | "denied" | "expired";
  record: string;
  ageText: string;
};

/** tool_call.slint `ToolCallData`. */
export type ToolCallData = {
  name: string;
  target?: string;
  summary: string;
  arguments?: string;
  status?: "" | "running" | "done" | "failed";
  output?: string;
};

/** message_bubble.slint `ContentBlock`. */
export type ContentBlock = {
  blockType: "text" | "code" | "heading" | "bullet" | "tool";
  text: string;
  call?: ToolCallData;
};

/** message_bubble.slint `MessageData`. */
export type MessageData = {
  role: "user" | "assistant" | "desktop";
  content: string;
  isStreaming?: boolean;
  blocks?: ContentBlock[];
  run?: string;
};

/** mind_panel.slint `MindPanelNow`. */
export type MindPanelNow = {
  known: boolean;
  mind: string;
  initial: string;
  builtin: boolean;
  model: string;
  modelNamed: boolean;
  state: string;
  project: string;
  memory: string;
  memoryKnown: boolean;
  minds: string;
  running: number;
  needsYou: number;
  moreAgents: number;
  recipesKnown: boolean;
  services: string;
  servicesTrouble: boolean;
};

/** mind_panel.slint `MindPanelAgent`. */
export type MindPanelAgent = { id: string; mind: string; title: string; state: string; label: string; since: string };
/** mind_panel.slint `MindPanelRecipe`. */
export type MindPanelRecipe = { id: string; name: string; step: string; status: "running" | "waiting" };
/** mind_panel.slint `MindPanelAct`. */
export type MindPanelAct = { what: string; when: string; outcome: string };

/** mind_mode_menu.slint `MindRule` and `MindAuditEntry`. */
export type MindRule = { app: string; action: string; label: string };
export type MindAuditEntry = { at: string; what: string; actor: string; args: string; outcome: string };
