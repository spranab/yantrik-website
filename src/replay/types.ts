// The hero replay's timeline, exactly as design/replay-timeline.md defines it. That document is
// the contract between the recorder's converter and the engine; change it there first.

export type Timeline = {
  version: 1;
  fixture?: true; // present only on the hand-written stand-in
  source: {
    machine: string; // "yantrik-live-001 (VM 561)"
    os_build: string; // /opt/yantrik/BUILD, e.g. "v0.1.0-1083-g0f94c815"
    mind: string; // "Yantrik Mind"
    model: string; // "deepseek-v4.1-flash on Ollama Cloud"
    mode: "ask"; // the Mind mode the run was recorded under
    recorded: string; // ISO time the shared run began
    sha256: string; // of the raw capture's SHA256SUMS file
  };
  task: string; // what the person typed, verbatim
  prefix: Event[]; // from the task being sent up to and including the card
  branches: { deny: Event[]; allow: Event[] }; // each begins at the visitor's answer, t = 0
};

export type Event = { t: number } & ( // t: ms since the start of its list
  | { type: "user_message"; text: string }
  | { type: "mind_thinking"; on: boolean }
  | { type: "tool_call"; id: string; tool: string; app: string; action: string; args: object }
  | { type: "tool_result"; id: string; ok: boolean; summary: string } // one line, as recorded
  | { type: "mind_message"; text: string }
  | { type: "window"; app: string; title: string; state: "open" | "front" | "closed" }
  | { type: "notes"; title: string; body: string } // the note as Notes shows it
  | {
      type: "card";
      caller: string;
      agent: string;
      app: string;
      action: string;
      grade: "standard" | "sensitive" | "dangerous";
      says: string;
      does: string;
      args: Record<string, string>;
    }
  | { type: "card_answer"; answer: "deny" | "allow_once" } // first event of a branch
  | { type: "file"; path: string; exists: boolean; bytes?: number } // what landed on disk
);

/** One event of a given type. */
export type EventOf<K extends Event["type"]> = Extract<Event, { type: K }>;
