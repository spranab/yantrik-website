import { elide, mono, ring, text, v } from "./css";
import type { ToolCallData } from "./types";

/**
 * One call a mind made, closed: ToolCallCard in crates/yantrik-ui-kit/slint/tool_call.slint.
 * `bg-card`, radius 6, a `border-subtle` hairline, padding 6/10; one line of a ⚙, the call in
 * JetBrains Mono 12 `cyan-light`, its status, and "show all" when there is more to open.
 */
export function ToolCallCard({ call, badge = "" }: { call: ToolCallData; badge?: string }) {
  const hasMore = !!(call.arguments || call.output);
  const status = call.status ?? "";
  return (
    <div style={{ background: v("bg-card"), borderRadius: 6, boxShadow: ring(v("border-subtle")), padding: "6px 10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={text(v("font-small"), 400, v("text-dim"))}>⚙</span>
        <span style={{ ...mono(12, v("cyan-light")), ...elide, flex: "1 1 0" }}>{call.summary || call.name}</span>
        {badge ? <span style={text(v("font-caption"), 400, v("text-dim"))}>{badge}</span> : null}
        {status ? (
          <span style={text(v("font-caption"), 400, status === "failed" ? v("color-danger") : status === "done" ? v("color-success") : v("amber-light"))}>
            {status}
          </span>
        ) : null}
        {hasMore ? <span style={text(v("font-caption"), 400, v("text-dim"))}>show all</span> : null}
      </div>
    </div>
  );
}
