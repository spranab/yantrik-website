import { ToolCallCard } from "./ToolCallCard";
import { ring, text, v, wrap } from "./css";
import type { ContentBlock, MessageData } from "./types";

/**
 * One message in the conversation: MessageBubble in crates/yantrik-ui-kit/slint/message_bubble.slint.
 *
 * The person's: a right-aligned pill (radius 18, `bg-elevated`, `border-subtle`, padding 10/14),
 * 60px in from the left. The mind's: left-aligned, an 8px `cyan` dot 7px down and the words at 14
 * beside it, 40px clear of the right; the desktop speaking for itself wears an amber dot and the
 * label "From the desktop". The dot's 8px glow is not drawn (the site draws no glows).
 */
export function MessageBubble({ data }: { data: MessageData }) {
  const isUser = data.role === "user";
  const isDesktop = data.role === "desktop";
  const blocks = data.blocks ?? [];
  const hasBlocks = blocks.length > 0 && !data.isStreaming;
  if (isUser) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "4px 16px 4px 60px" }}>
        <div style={{ borderRadius: 18, background: v("bg-elevated"), boxShadow: ring(v("border-subtle")), padding: "10px 14px", minWidth: 0 }}>
          <div style={{ ...text(v("font-body")), ...wrap }}>{data.content}</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "4px 40px 4px 16px" }}>
      <span style={{ width: 8, height: 8, borderRadius: 4, marginTop: 7, flex: "none", background: isDesktop ? v("amber") : v("cyan") }} />
      <div style={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        {isDesktop ? <span style={text(v("font-small"), 600, v("amber-light"))}>From the desktop</span> : null}
        {!hasBlocks ? <div style={{ ...text(v("font-body")), ...wrap }}>{data.content}</div> : null}
        {hasBlocks ? blocks.map((b, i) => <Block key={i} block={b} />) : null}
        {data.run && !data.isStreaming ? (
          <span style={{ ...text(v("font-small"), 600, v("cyan-light")), paddingTop: 4 }}>
            {data.run === "private:leave" ? "Leave Private mode →" : "Open the run →"}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function Block({ block }: { block: ContentBlock }) {
  if (block.blockType === "tool" && block.call) return <ToolCallCard call={block.call} />;
  if (block.blockType === "code") {
    return (
      <div style={{ background: v("bg-card"), borderRadius: 6, boxShadow: ring(v("border-subtle")), padding: "8px 10px" }}>
        <div style={{ ...text(v("font-small"), 400, v("cyan-light")), ...wrap }}>{block.text}</div>
      </div>
    );
  }
  const heading = block.blockType === "heading";
  return (
    <div style={{ paddingLeft: block.blockType === "bullet" ? 8 : 0, ...text(heading ? v("font-title") : v("font-body"), heading ? 600 : 400, heading ? v("amber-light") : v("text-primary")), ...wrap }}>
      {block.text}
    </div>
  );
}
