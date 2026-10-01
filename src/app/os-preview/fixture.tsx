// Sample data for the replica's preview. Not a recording: the shapes and the OS's own words
// (labels, the app's published sentences) are real; the transcript, the pid and the counts are
// stand-ins until the session is captured on VM 561. The Debian page and its favicon are a
// headless Chrome capture of www.debian.org/releases/trixie/ at the content area's size.

import type { ApprovalRequest, MessageData, MindPanelNow } from "@/os/types";
import type { ChromiumPalette } from "@/os/ChromiumWindow";
import type { NoteRow } from "@/os/NotesWindow";

/**
 * Chromium's own chrome, sampled from a 1280×800 capture of the browser on the desktop
 * (1 Oct 2026, "Untitled - Chromium", VM 520): frame (500,40), tab and toolbar (300,40),
 * omnibox (500,80), tab-search button (140,40), the rule under the toolbar (500,118), text
 * (302,95), the disabled back arrow (151,95). DejaVu Sans is Chromium's UI font on Debian
 * (fonts-dejavu-core); Verdana shares its metrics where DejaVu is not installed.
 */
export const chromium: ChromiumPalette = {
  frame: "#d3e3fd",
  tab: "#ffffff",
  toolbar: "#ffffff",
  omnibox: "#edf2fa",
  button: "#ecf3fe",
  separator: "#e1e3e1",
  text: "#1f1f1f",
  icon: "#bfbfbf",
  font: '"DejaVu Sans", Verdana, sans-serif',
};

// The task, verbatim from design/art-direction-2026-10-01.md B.5.
const task =
  "Read the Debian 13 trixie release notes on debian.org, write a five-point note in Notes called 'Debian 13 — what changed', then export it to ~/Documents/debian-13-notes.md.";

export const messages: MessageData[] = [
  { role: "user", content: task },
  {
    role: "assistant",
    content: "",
    blocks: [
      { blockType: "tool", text: "", call: { name: "os_act", summary: 'os_act shell.open_app name="browser"' } },
      { blockType: "tool", text: "", call: { name: "web_read", summary: 'web_read url="https://www.debian.org/releases/trixie/"' } },
      { blockType: "tool", text: "", call: { name: "os_act", summary: 'os_act notes.create title="Debian 13 — what changed"' } },
      { blockType: "text", text: "The note is written. Exporting it needs your answer." },
    ],
  },
];

// notes.export as apps/notes/src/main.rs (~1699–1711) publishes it; summary_of() takes its first sentence.
const purpose =
  "Write the open note's text to a file outside the library, at this path. It refuses rather than overwrite anything already there, and the note stays open.";

export const exportCard: ApprovalRequest = {
  id: "appr-1",
  agent: "yantrik-mind:main",
  onBehalf: "",
  requester: "Yantrik Mind",
  verified: "yantrik-mind (pid 2417) · the attached mind",
  discrepancies: [],
  app: "notes",
  action: "export",
  summary: "Write the open note's text to a file outside the library, at this path.",
  purpose,
  callerSays: "",
  grade: "sensitive",
  args: ["path: ~/Documents/debian-13-notes.md"],
  target: "",
  explained: "",
  warning: "",
  canSession: true,
  decision: "",
  record: "",
  ageText: "94s left",
};

// The two records a decided card leaves (crates/yantrik-ui/src/approvals.rs ~1174–1179).
export const allowedRecord: ApprovalRequest = { ...exportCard, id: "appr-a", decision: "allowed", record: "Allowed once: notes.export — 14:07" };
export const deniedRecord: ApprovalRequest = { ...exportCard, id: "appr-d", decision: "denied", record: "Denied: notes.export — 14:07" };

export const noteText = [
  "# Debian 13 — what changed",
  "",
  "1. Linux 6.12 LTS is the kernel.",
  "2. 64-bit RISC-V is an official architecture.",
  "3. i386 is no longer an installation target.",
  "4. APT 3.0 brings a new solver and colour output.",
  "5. GNOME 48, KDE Plasma 6.3 and Xfce 4.20 ship.",
].join("\n");

export const noteWords = noteText.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

export const notes: NoteRow[] = [
  { id: "n1", title: "Debian 13 — what changed", preview: "# Debian 13 — what changed", date: "Oct 1 · 14:06", selected: true },
  { id: "n2", title: "Welcome", preview: "Notes are Markdown files on this device.", date: "Sep 30 · 09:12" },
];

export const mindNow: MindPanelNow = {
  known: true,
  mind: "Yantrik Mind",
  initial: "Y",
  builtin: false,
  model: "qwen3.5:9b",
  modelNamed: true,
  state: "ready",
  project: "",
  memory: "YantrikDB · 1,284 memories",
  memoryKnown: true,
  minds: "3 minds · 2 keep memory",
  running: 0,
  needsYou: 0,
  moreAgents: 0,
  recipesKnown: true,
  services: "6 running",
  servicesTrouble: false,
};

export const debianFavicon = (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/os-preview/debian-favicon.png" alt="" width={16} height={16} style={{ display: "block" }} />
);
