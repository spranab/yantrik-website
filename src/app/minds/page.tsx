import type { Metadata } from "next";
import { ComingPage } from "@/components/site/ComingPage";

export const metadata: Metadata = { title: "Minds · Yantrik OS", description: "Not built yet: the companion, the five minds that attach, accounts, free AI tiers, Mind View and Agents." };

export default function Minds() {
  return (
    <ComingPage
      name="Minds"
      holds={[
        "The built-in companion, and the five minds that attach over the harness socket.",
        "The accounts the Minds panel shows (Claude, Codex, Gemini), and why they are accounts rather than minds.",
        "What runs on what: which model answers, and whether it is local or cloud.",
        "The free AI tiers in Settings, and how a key reaches the vault without reaching a model.",
        "Mind View, the desktop of its own a mind opens apps in, and the Agents workspace.",
      ]}
      sources={[
        { path: "docs/harness.md", what: "the attach protocol and how to write a harness" },
        { path: "harnesses", what: "the harnesses that ship as source" },
        { path: "design/minds-panel-2026-09-29.md", what: "the Minds panel and accounts" },
        { path: "docs/free-tiers.md", what: "the free tiers the pool uses" },
        { path: "design/mind-view-2026-09-24.md", what: "Mind View" },
        { path: "design/agents-workspace-2026-09-23.md", what: "the Agents workspace" },
      ]}
    />
  );
}
