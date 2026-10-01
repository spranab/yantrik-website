import "@/os/os.css";
import { ModeChip } from "@/os/ModeChip";
import type { MindMode } from "@/os/types";
import { Section } from "@/components/site/Section";
import { Claims, Source } from "@/components/site/Claim";
import { Terminal } from "@/components/site/Terminal";

// apps/notes/src/main.rs at the pinned commit, lines 1700–1708, with the eight spaces of
// indentation every line shares taken off. Nothing else changed.
const EXPORT = `// Sensitive: it writes a file outside the notes directory, at a path the caller chooses.
// It cannot overwrite — the store publishes the new file with a hard link, which fails if
// something is already there — so it is not \`dangerous\`.
act(
    "export",
    "Write the open note's text to a file outside the library, at this path. It refuses \\
     rather than overwrite anything already there, and the note stays open.",
)
.risk("sensitive")`;

// The decision table, design/mind-modes-2026-09-21.md lines 41–47 at the pinned commit.
type Cell = "run" | "refuse" | "ask" | "logged";
const GRADES = ["safe", "standard", "sensitive", "dangerous"] as const;
const TABLE: [MindMode, string, Cell[]][] = [
  ["plan", "Plan", ["run", "refuse", "refuse", "refuse"]],
  ["ask", "Ask", ["run", "run", "ask", "ask"]],
  ["auto", "Auto", ["run", "run", "logged", "ask"]],
  ["bypass", "Bypass", ["run", "run", "logged", "logged"]],
  ["bypass_all", "Full bypass", ["run", "run", "logged", "logged"]],
];

const word = (c: Cell) =>
  c === "logged" ? (
    <>
      run <span className="dt-logged">(logged)</span>
    </>
  ) : (
    c
  );

export function SecuritySection() {
  return (
    <Section
      id="security"
      route="yantrikos.com/security"
      routeHref="/security"
      layout="stack"
      title="The app grades every action. Your mode decides what runs without asking."
      more={{ href: "/security", label: "Grades, modes, the approval card, and what is not protected" }}
      art={
        <div className="sec-art-grid">
          <figure className="s-figure dt-fig">
            <div className="s-pane dt-pane">
              <table className="s-table dt" data-stack>
                <caption className="sr-only">What runs without asking, by mode and by the action&rsquo;s grade</caption>
                <thead>
                  <tr>
                    <th scope="col">mode</th>
                    {GRADES.map((g) => (
                      <th key={g} scope="col">
                        {g}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TABLE.map(([mode, label, cells]) => (
                    <tr key={mode} data-mode={mode}>
                      <th scope="row">
                        <span className="y-os dt-chip">
                          <ModeChip mode={mode} label={label} />
                        </span>
                        {mode === "ask" ? <span className="dt-default">the default</span> : null}
                      </th>
                      {cells.map((c, i) => (
                        <td key={GRADES[i]} data-label={GRADES[i]} data-cell={c}>
                          {word(c)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <figcaption>
              <span className="s-src">
                <strong className="dt-ask-key">ask</strong> puts the approval card in front of you. Either bypass is
                time-boxed and never saved across a restart; plain bypass still asks before anything an app says cannot be
                undone.
              </span>
              <Source paths={["design/mind-modes-2026-09-21.md"]} />
            </figcaption>
          </figure>
          <figure className="s-figure">
            <Terminal title="apps/notes/src/main.rs" meta="lines 1700–1708" nowrap label="The export action in apps/notes/src/main.rs">
              {EXPORT}
            </Terminal>
            <figcaption>
              <Source paths={["apps/notes/src/main.rs"]}>
                The grade is a line in the app&rsquo;s own code. An action that declares none, such as{" "}
                open_note, is standard. From{" "}
              </Source>
            </figcaption>
          </figure>
        </div>
      }
    >
      <Claims ids={["C-41", "C-40", "C-04"]} />
    </Section>
  );
}
