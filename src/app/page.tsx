import Hero from "@/components/hero/Hero";
import { SiteShell } from "@/components/site/SiteShell";
import { LiveSection } from "@/components/home/LiveSection";
import { DownloadSection } from "@/components/home/DownloadSection";
import { MindsSection } from "@/components/home/MindsSection";
import { SecuritySection } from "@/components/home/SecuritySection";
import { AppsSection } from "@/components/home/AppsSection";
import { DocsSection } from "@/components/home/DocsSection";
import { getRelease } from "@/lib/release";

// The homepage: the desktop at the top (the hero, built on its own branch), then a section for
// each deeper page, each saying in plain words what is there and showing one real thing from the
// OS: a frame of the live machine, the release host's own latest.json, the harness protocol, a
// grade in an app's code and the decision table, the apps and a reply one of them gave, the docs.
export default async function Home() {
  const release = await getRelease();
  return (
    <SiteShell>
      <Hero />
      <div style={{ height: 72 }} aria-hidden="true" />
      <LiveSection />
      <DownloadSection release={release} />
      <MindsSection />
      <SecuritySection />
      <AppsSection />
      <DocsSection />
    </SiteShell>
  );
}
