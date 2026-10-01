import { Section } from "@/components/site/Section";
import { Claims } from "@/components/site/Claim";
import { ReleaseBlock } from "@/components/site/ReleaseBlock";
import type { Release } from "@/lib/release";

export function DownloadSection({ release }: { release: Release }) {
  return (
    <Section
      id="download"
      route="yantrikos.com/download"
      routeHref="/download"
      title="Take it: one live ISO, booted under QEMU before it was published."
      more={{ href: "/download", label: "Verify it, boot it in a VM, install it, update it" }}
      art={<ReleaseBlock initial={release} />}
    >
      <div className="s-prose">
        <p>
          You boot the image and try the desktop before anything touches a disk. The page behind this one has every
          command, each with the file it comes from, and says which hardware has been measured and which has not.
        </p>
      </div>
      <Claims ids={["C-31", "C-21", "C-34"]} />
    </Section>
  );
}
