# The hero replay's timeline format

The homepage hero replays a real session recorded on the live instance (VM 561). The visitor
watches the desktop replica (`src/os/*`) play it, and when the Mind's approval card comes up, the
visitor answers it: **Deny** plays what really happened when Deny was pressed, and **Allow once**
plays the run where it was allowed. Both branches were recorded on the real machine, from the same
task, by the same Mind.

The recorder on 561 captures screens, `yos describe shell`, `yos describe notes` and the Mind's
journal. A converter (written alongside the recording, not by the engine) turns those into one
`public/replay/session.json` in this format. Until it exists, the engine plays
`src/replay/fixture.json`, a hand-written timeline in the same format, marked as a fixture.

```ts
type Timeline = {
  version: 1;
  fixture?: true;                      // present only on the hand-written stand-in
  source: {
    machine: string;                   // "yantrik-live-001 (VM 561)"
    os_build: string;                  // /opt/yantrik/BUILD, e.g. "v0.1.0-1083-g0f94c815"
    mind: string;                      // "Yantrik Mind"
    model: string;                     // "deepseek-v4.1-flash on Ollama Cloud"
    mode: "ask";                       // the Mind mode the run was recorded under
    recorded: string;                  // ISO time the shared run began
    sha256: string;                    // of the raw capture's SHA256SUMS file
  };
  task: string;                        // what the person typed, verbatim
  prefix: Event[];                     // from the task being sent up to and including the card
  branches: { deny: Event[]; allow: Event[] };  // each begins at the visitor's answer, t = 0
};

type Event = { t: number } & (        // t: ms since the start of its list
  | { type: "user_message"; text: string }
  | { type: "mind_thinking"; on: boolean }
  | { type: "tool_call"; id: string; tool: string; app: string; action: string; args: object }
  | { type: "tool_result"; id: string; ok: boolean; summary: string }   // one line, as recorded
  | { type: "mind_message"; text: string }
  | { type: "window"; app: string; title: string; state: "open" | "front" | "closed" }
  | { type: "notes"; title: string; body: string }                        // the note as Notes shows it
  | { type: "card"; caller: string; agent: string; app: string; action: string;
      grade: "standard" | "sensitive" | "dangerous"; says: string; does: string;
      args: Record<string, string> }
  | { type: "card_answer"; answer: "deny" | "allow_once" }               // first event of a branch
  | { type: "file"; path: string; exists: boolean; bytes?: number }       // what landed on disk
);
```

Rules the engine keeps:
- Times are real. The engine may compress idle gaps longer than 1.5 s to 1.5 s, and says so
  ("idle time shortened"), but never reorders events or invents one.
- Text is shown as recorded: the replica renders `text`, `summary`, `says`, `does` and `args`
  verbatim.
- `prefers-reduced-motion`: no animated typing or cursor; each event appears in place.
- A visitor who does not answer the card sees it wait, as the real one did. Nothing auto-answers.
- After a branch ends: "Watch the other answer" plays the other branch from the card; "From the
  start" replays the prefix.
- The caption under the hero names `source` in one line: machine, build, Mind, model, mode, date.
