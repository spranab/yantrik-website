import { readFileSync } from "node:fs";
import { join } from "node:path";
import "@/os/os.css";
import { AppTile } from "@/os/AppTile";
import { Section } from "@/components/site/Section";
import { Claims, Source } from "@/components/site/Claim";
import { Terminal } from "@/components/site/Terminal";

// The sixteen that ship, in the README's order (README.md, "Built-in apps"), under the shell ids
// whose colour and glyph the launcher gives them (app_color.slint, icon.slint).
const APPS: [string, string][] = [
  ["notes", "Notes"],
  ["email", "Email"],
  ["calendar", "Calendar"],
  ["weather", "Weather"],
  ["terminal", "Terminal"],
  ["editor", "Editor"],
  ["documents", "yDoc"],
  ["presentation", "yPresent"],
  ["image", "Images"],
  ["downloads", "Downloads"],
  ["snippets", "Snippets"],
  ["containers", "Containers"],
  ["network", "Network"],
  ["sysmonitor", "System Monitor"],
  ["arcade", "Arcade"],
  ["studio", "Studio"],
];

type Measure = {
  machine: string;
  mind: string;
  yantrik_way: { calls: { tool: string; arguments: Record<string, unknown>; reply: string; tokens: number }[] };
};

/**
 * A real reply: Calendar answering describe, as a mind received it while doing a task on
 * v0.1.0-250 (public/measure/calendar-task.json, recorded for the token comparison). The reply is
 * cut after its fifth action (delete_event, the sensitive one), and the cut is marked.
 */
function calendarReply() {
  const m: Measure = JSON.parse(readFileSync(join(process.cwd(), "public/measure/calendar-task.json"), "utf8"));
  const call = m.yantrik_way.calls.find((c) => c.tool === "os_describe" && c.reply.includes("act: "));
  if (!call) throw new Error("calendar-task.json has no describe reply with actions");
  const lines = call.reply.split("\n");
  const firstAct = lines.findIndex((l) => l.trimStart().startsWith("act: "));
  // Keep the summary, the revision and the state, then actions until the fifth one has ended.
  let acts = 0;
  let end = lines.length;
  for (let i = firstAct; i < lines.length; i++) {
    if (lines[i].trimStart().startsWith("act: ") && ++acts === 6) {
      end = i;
      break;
    }
  }
  const hidden = lines.slice(end).filter((l) => l.trimStart().startsWith("act: ")).length;
  return { shown: lines.slice(0, end), hidden, machine: m.machine, mind: m.mind };
}

export function AppsSection() {
  const r = calendarReply();
  return (
    <Section
      id="apps"
      route="yantrikos.com/apps"
      routeHref="/apps"
      layout="stack"
      title="Sixteen apps, and each one tells a mind what it may do to it."
      more={{ href: "/apps", label: "Every app, its surface, and the grade of each action" }}
      art={
        <div className="apps-art">
          <figure className="s-figure">
            <ul className="app-row y-os" aria-label="The sixteen apps that ship">
              {APPS.map(([id, name]) => (
                <li key={id}>
                  <AppTile appId={id} size={44} />
                  <span>{name}</span>
                </li>
              ))}
            </ul>
            <figcaption>
              <Source paths={["README.md", "crates/yantrik-ui-kit/slint/app_color.slint"]}>
                Each tile in its own colour and glyph, as the launcher draws it. From{" "}
              </Source>
            </figcaption>
          </figure>
          <figure className="s-figure">
            <Terminal title="os_describe calendar" meta="recorded 21 Sep 2026">
              {r.shown.map((line, i) =>
                line.trimStart().startsWith("act: ") ? (
                  <span key={i}>
                    <span className={line.includes("[sensitive") || line.includes("[dangerous") ? "t-amber" : "t-acc"}>{line}</span>
                    {"\n"}
                  </span>
                ) : (
                  <span key={i}>
                    {line}
                    {"\n"}
                  </span>
                ),
              )}
              <span className="t-dim">{`  … ${r.hidden} more actions, cut here for this page`}</span>
            </Terminal>
            <figcaption>
              <span className="s-src">
                {r.machine}. {r.mind}. The whole reply, and the task it was part of, are in{" "}
                <a href="/measure/calendar-task.json">calendar-task.json</a>.
              </span>
            </figcaption>
          </figure>
        </div>
      }
    >
      <Claims ids={["C-01", "C-02"]} />
    </Section>
  );
}
