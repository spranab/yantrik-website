import "@/os/os.css";
import { MindMark } from "@/os/MindMark";
import { MindChip } from "@/os/MindChip";
import { Section } from "@/components/site/Section";
import { Claims } from "@/components/site/Claim";
import { Terminal } from "@/components/site/Terminal";
import { Source } from "@/components/site/Claim";
import { osLink } from "@/lib/os-repo";

// docs/harness.md lines 16–24 at the pinned commit, verbatim. Do not reflow: it is the doc's own
// layout, continuation lines and all.
const METHODS = `harness.attach   {id, name, detail?, tools?, memory?, conversations?}  → {session}
harness.poll     {session}              → {turn_id, text, context, conversation, agent_token, origin?} | {}
                                          … either may also carry cancelled: [turn_id], ended: [conversation],
                                            answers: [{turn_id, request_id, answer}]
harness.chunk    {session, turn_id, delta}             → {}
harness.event    {session, turn_id, event}             → {}      (optional — see below)
harness.complete {session, turn_id}                    → {}
harness.fail     {session, turn_id, error}             → {}
harness.detach   {session}                             → {}`;

// The five that attach today (claim C-06), as the Minds panel draws a mind that has not attached
// here: on a web page, none has.
const MINDS = [
  ["Y", "Yantrik Mind"],
  ["H", "Hermes"],
  ["P", "Pi"],
  ["D", "DeepSeek"],
  ["O", "OpenClaw"],
] as const;

export function MindsSection() {
  return (
    <Section
      id="minds"
      route="yantrikos.com/minds"
      routeHref="/minds"
      layout="stack"
      title="Any mind can answer. The OS has nowhere to put your key."
      more={{ href: "/minds", label: "The minds, the accounts, and what runs on what" }}
      art={
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Terminal title="the harness socket" meta="docs/harness.md, lines 16–24" nowrap label="The seven harness methods, from docs/harness.md">
            {METHODS}
          </Terminal>
          <Source paths={["docs/harness.md"]}>verbatim from </Source>
        </div>
      }
    >
      <div className="s-prose">
        <p>
          A mind is a program that dials in to the desktop and asks for work. The desktop never connects out to it, so
          it never needs your endpoint, your model name or your key.
        </p>
      </div>
      <ul className="mind-list" aria-label="The five minds that attach">
        {MINDS.map(([initial, name]) => (
          <li key={name}>
            <span className="y-os">
              <MindMark initial={initial} online={false} size={30} />
            </span>
            <span>{name}</span>
          </li>
        ))}
      </ul>
      <Claims ids={["C-06", "C-08", "C-39"]} />
      <div className="mind-chip-row">
        <span className="y-os" style={{ display: "inline-flex", background: "var(--y-glass-panel)", borderRadius: 6, padding: "0 4px" }}>
          <MindChip name="Yantrik Mind" />
        </span>
        <span className="s-src" style={{ margin: 0 }}>
          the status bar&rsquo;s mind chip, as{" "}
          <a href={osLink("crates/yantrik-ui-slint/ui/components/status_bar.slint")}>
            status_bar.slint
          </a>{" "}
          draws it when an attached mind is answering
        </span>
      </div>
    </Section>
  );
}
