import "@/os/os.css";
import { WindowFrame } from "@/os/WindowFrame";
import { ICONS } from "@/os/icons";
import { Section } from "@/components/site/Section";
import { Claims } from "@/components/site/Claim";
import { LivePill } from "@/components/site/LivePill";

// One frame of the live stream, captured with ffmpeg from https://yantrikos.com/live/hls/ at
// 2026-10-01T21:11:40Z (public/captures/live-2026-10-01T2111Z.json says how). It is a still and
// is captioned as one; the stream itself is only on /live, after a click, never autoplayed here.
const FRAME = "/captures/live-2026-10-01T2111Z.webp";

/** The shell's WindowFrame, at a width that fits each layout without scaling its 14px title. */
function Frame({ width }: { width: number }) {
  const h = Math.round((width - 2) * 0.625);
  return (
    <div className="y-os">
      <WindowFrame title="Yantrik Live · the public machine" iconPath={ICONS.media} iconColor="var(--y-color-success)" width={width} height={36 + 1 + h + 1}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={FRAME}
          alt="The live machine's desktop at 16:11 its time: Notes open in Mind View with no notes yet, the status bar showing Ask mode and Yantrik Mind, the taskbar showing Mind View · Notes."
          width={1280}
          height={800}
          loading="lazy"
          decoding="async"
          style={{ display: "block", width: width - 2, height: h, marginLeft: 1 }}
        />
      </WindowFrame>
    </div>
  );
}

export function LiveSection() {
  return (
    <Section
      id="live"
      route="yantrikos.com/live"
      routeHref="/live/"
      title="One of these machines works in public. You can watch it."
      more={{ href: "/live/", label: "Watch the live machine" }}
      art={
        <figure className="s-figure">
          <div className="lf">
            <div className="lf-a">
              <Frame width={680} />
            </div>
            <div className="lf-b">
              <Frame width={556} />
            </div>
            <div className="lf-c">
              <Frame width={592} />
            </div>
            <div className="lf-d">
              <Frame width={343} />
            </div>
          </div>
          <figcaption className="lf-cap">
            <span className="s-label">The machine right now:</span>
            <LivePill />
            <span className="s-src" style={{ margin: 0 }}>
              The picture above is one frame of the stream, captured 1 Oct 2026 at 21:11 UTC: a still, not the stream.
            </span>
          </figcaption>
        </figure>
      }
    >
      <div className="s-prose">
        <p>
          The page at <a className="s-link" href="/live/">/live</a> shows the screen of a Yantrik OS machine that works on
          its own, with a mind attached. You watch; nothing you do there reaches it.
        </p>
      </div>
      <Claims ids={["C-24", "C-27", "C-28"]} />
    </Section>
  );
}
