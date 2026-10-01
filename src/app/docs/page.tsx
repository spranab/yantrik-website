import type { Metadata } from "next";
import { ComingPage } from "@/components/site/ComingPage";

export const metadata: Metadata = { title: "Docs · Yantrik OS", description: "Not built yet: the OS repository's docs, rendered unedited at a pinned commit and grouped by what you are doing." };

export default function Docs() {
  return (
    <ComingPage
      name="Docs"
      holds={[
        "The OS repository's docs/ folder, rendered at a pinned commit, each page's body unedited and with its source line.",
        "Grouped by what you are doing: start, drive it, build a surface, attach a mind, reference.",
      ]}
      sources={[
        { path: "docs", what: "the whole folder" },
        { path: "docs/getting-started.md", what: "where to begin" },
        { path: "docs/app-control.md", what: "driving the desktop through its surfaces" },
        { path: "docs/sdk/README.md", what: "putting your own program where a mind can find it" },
        { path: "docs/harness.md", what: "attaching a mind" },
      ]}
    />
  );
}
