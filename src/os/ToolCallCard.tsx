import { elide, mono, ring, text, v } from "./css";
import type { ToolCallData } from "./types";

/** A mono Text with `wrap: word-wrap`. */
const wrapMono = { whiteSpace: "pre-wrap", overflowWrap: "anywhere", minWidth: 0 } as const;

/**
 * One call a mind made, closed: ToolCallCard in crates/yantrik-ui-kit/slint/tool_call.slint.
 * `bg-card`, radius 6, a `border-subtle` hairline, padding 6/10; one line of a ⚙, the call in
 * JetBrains Mono 12 `cyan-light`, its status, and "show all" when there is more to open.
 * `expanded` is the Slint card's own open state: the line wrapped, then the arguments and the
 * output (in a `bg-input` box, radius 4, padding 6) in full.
 */
export function ToolCallCard({ call, badge = "", expanded = false }: { call: ToolCallData; badge?: string; expanded?: boolean }) {
  const hasMore = !!(call.arguments || call.output);
  const status = call.status ?? "";
  return (
    <div style={{ background: v("bg-card"), borderRadius: 6, boxShadow: ring(v("border-subtle")), padding: "6px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: expanded ? "flex-start" : "center", gap: 8 }}>
        <span style={text(v("font-small"), 400, v("text-dim"))}>⚙</span>
        <span style={{ ...mono(12, v("cyan-light")), ...(expanded ? wrapMono : elide), flex: "1 1 0" }}>{call.summary || call.name}</span>
        {badge ? <span style={text(v("font-caption"), 400, v("text-dim"))}>{badge}</span> : null}
        {status ? (
          <span style={text(v("font-caption"), 400, status === "failed" ? v("color-danger") : status === "done" ? v("color-success") : v("amber-light"))}>
            {status}
          </span>
        ) : null}
        {hasMore ? <span style={text(v("font-caption"), 400, v("text-dim"))}>{expanded ? "less" : "show all"}</span> : null}
      </div>
      {expanded && call.arguments ? <span style={{ ...mono(12, v("text-secondary")), ...wrapMono }}>{call.arguments}</span> : null}
      {expanded && call.output ? (
        <div style={{ background: v("bg-input"), borderRadius: 4, padding: 6 }}>
          <span style={{ ...mono(12), ...wrapMono, display: "block" }}>{call.output}</span>
        </div>
      ) : null}
    </div>
  );
}
