import type { Metadata } from "next";
import { ComingPage } from "@/components/site/ComingPage";

export const metadata: Metadata = { title: "Security · Yantrik OS", description: "Not built yet: grades, the ceiling, modes, the approval card, the vault, egress, and what is not protected." };

export default function Security() {
  return (
    <ComingPage
      name="Security"
      holds={[
        "Grades, the machine's ceiling, and the modes that decide what runs without asking.",
        "The approval card row by row: the caller as it names itself and as the kernel names it, and a grant bound to exact arguments.",
        "The audit of what ran unasked, and the taint rule no mode turns off.",
        "The vault, Private mode, and the egress proxy that starts in audit.",
        "What is not protected, said as plainly as what is.",
      ]}
      sources={[
        { path: "design/mind-modes-2026-09-21.md", what: "modes, the decision table, the invariants" },
        { path: "design/approvals-2026-09-21.md", what: "the approval card and grants" },
        { path: "docs/app-control.md", what: "every action and the grade it holds" },
        { path: "design/vault-unlock-2026-09-21.md", what: "the vault" },
        { path: "design/mind-egress-2026-09-29.md", what: "the egress proxy" },
      ]}
    />
  );
}
