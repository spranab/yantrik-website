import type { Metadata } from "next";
import { ComingPage } from "@/components/site/ComingPage";

export const metadata: Metadata = { title: "Apps · Yantrik OS", description: "Not built yet: the sixteen apps, the Blender and LibreOffice adapters, the two shelved apps, and each app's surface." };

export default function Apps() {
  return (
    <ComingPage
      name="Apps"
      holds={[
        "The sixteen apps that ship, each with its surface: what it publishes and the grade of each action.",
        "Blender and LibreOffice, programs nobody here wrote, joining through an adapter.",
        "The two shelved apps, ySheets and Music, and what would bring them back.",
      ]}
      sources={[
        { path: "README.md", what: "the apps that ship, and the shelved two" },
        { path: "docs/app-control.md", what: "every surface, every action and its grade" },
        { path: "design/shelved-2026-09-20.md", what: "why two apps were taken out" },
        { path: "design/blender-surface-2026-09-22.md", what: "the Blender surface" },
        { path: "adapters/libreoffice/README.md", what: "the LibreOffice adapter" },
      ]}
    />
  );
}
