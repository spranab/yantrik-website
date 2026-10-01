import { ApprovalCard } from "./ApprovalCard";
import { Icon } from "./Icon";
import { MessageBubble } from "./MessageBubble";
import { alpha, elide, ring, text, v } from "./css";
import type { ApprovalRequest, MessageData } from "./types";

export type LensProps = {
  /** The answering mind, named in the header. */
  mindName: string;
  messages: MessageData[];
  /** Decided records first, then the one request waiting, as the Lens orders them. */
  approvals?: ApprovalRequest[];
  approvalsWaiting?: number;
  isGenerating?: boolean;
  /** The conversation is an attached mind's own agent, so History and "open in Agents" are offered. */
  canOpenInAgents?: boolean;
  /** The panel is the window between the bars: screen height − 32 − 40. */
  height?: number;
  onDeny?: (id: string) => void;
  onAllow?: (id: string) => void;
  sessionDisabledNote?: string;
};

const headerHit = (label: string, color: string) => (
  <span style={{ ...text(v("fs-caption"), 400, color), height: 28, padding: "0 8px", borderRadius: 6, display: "flex", alignItems: "center", flex: "none" }}>
    {label}
  </span>
);

/**
 * The Intent Lens in chat mode, right-docked between the two bars: IntentLens in
 * crates/yantrik-ui-slint/ui/components/intent_lens.slint (~981–2407).
 *
 * `chat-panel-width` (380) wide, solid `bg-deep` while it holds a conversation (its 30px shadow is
 * not drawn: the OS's software renderer draws no drop shadows), and a 1px left edge that runs cyan → amber →
 * cyan (~1169–1180, a gradient the OS draws). A 48px `bg-surface` header with who is answering;
 * the transcript; the approvals block between the transcript and the reply box (padding sp-2,
 * sp-1 apart); the 48px reply bar with the mic, the field and the send button. The field is
 * disabled here: nothing typed into the replica goes anywhere.
 */
export function Lens({ mindName, messages, approvals = [], approvalsWaiting = 0, isGenerating = false, canOpenInAgents = false, height = 728, onDeny, onAllow, sessionDisabledNote }: LensProps) {
  const transcriptMin = approvals.length > 0 ? 96 : 200;
  return (
    <aside
      aria-label={`Conversation with ${mindName}`}
      style={{
        position: "relative",
        width: v("chat-panel-width"),
        height,
        background: v("bg-deep"),
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Left edge */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1,
          height: "100%",
          zIndex: 1,
          background: `linear-gradient(180deg, ${v("cyan-glow")} 0%, ${alpha("cyan", 13)} 30%, ${alpha("amber", 13)} 70%, ${v("cyan-glow")} 100%)`,
        }}
      />

      {/* Header */}
      <div style={{ position: "relative", height: v("lens-input-height"), flex: "none", background: v("bg-surface"), display: "flex", alignItems: "center", gap: 10, padding: "0 8px 0 16px" }}>
        <Icon name="companion" size={16} tint={v("accent")} />
        <span style={{ ...text(v("fs-body"), 600), ...elide, flex: "1 1 0" }}>{mindName || "Conversation"}</span>
        {messages.length > 0 ? headerHit("New chat", v("text-secondary")) : null}
        {canOpenInAgents ? headerHit("History", v("text-secondary")) : null}
        {canOpenInAgents ? headerHit("open in Agents", v("accent")) : null}
        <span style={{ width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <Icon name="close" size={14} tint={v("text-dim")} />
        </span>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1, background: v("separator") }} />
      </div>

      {/* Transcript. It follows the newest message (JumpToPresent): from the top while it fits,
          held at the bottom once it does not. column-reverse puts the overflow at the top, and the
          auto margin keeps a short transcript at the top. */}
      <div style={{ flex: "1 1 0", minHeight: transcriptMin, overflow: "hidden", display: "flex", flexDirection: "column-reverse" }}>
        <div style={{ marginBottom: "auto", flex: "none" }}>
          {messages.map((m, i) => (
            <MessageBubble key={i} data={m} />
          ))}
        </div>
      </div>

      {/* Approvals and their records, between the conversation and the reply box */}
      {approvals.length > 0 ? (
        <div style={{ flex: "none", display: "flex", flexDirection: "column", gap: v("sp-1"), padding: v("sp-2") }}>
          {approvals.map((a) => (
            <ApprovalCard
              key={a.id}
              data={a}
              onDeny={onDeny ? () => onDeny(a.id) : undefined}
              onAllow={onAllow ? () => onAllow(a.id) : undefined}
              sessionDisabledNote={sessionDisabledNote}
            />
          ))}
          {approvalsWaiting > 0 ? (
            <span style={{ ...text(v("fs-micro"), 400, v("text-dim")), textAlign: "center" }}>{`${approvalsWaiting} more waiting — this one first`}</span>
          ) : null}
        </div>
      ) : null}

      {/* Typing indicator, drawn at the first step of its pulse */}
      {isGenerating ? (
        <div style={{ display: "flex", gap: 6, padding: "0 0 8px 20px", flex: "none" }}>
          {[0.3, 0.79, 0.99].map((o, i) => (
            <span key={i} style={{ width: 5, height: 5, borderRadius: 2.5, background: v("cyan"), opacity: o }} />
          ))}
        </div>
      ) : null}

      {/* Reply bar */}
      <div style={{ position: "relative", height: 48, flex: "none", background: v("bg-deep"), display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", boxSizing: "border-box" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 1, background: v("separator") }} />
        <span style={{ position: "relative", width: 32, height: 32, borderRadius: 16, background: v("bg-card"), boxShadow: ring(v("cyan-dim")), flex: "none" }}>
          <span style={{ position: "absolute", left: 12, top: 8, width: 8, height: 10, borderRadius: 4, background: v("cyan") }} />
        </span>
        <span style={{ flex: "1 1 0", height: 32, borderRadius: 16, background: v("bg-input"), boxShadow: ring(v("border-subtle")), display: "flex", alignItems: "center", overflow: "hidden" }}>
          <input
            type="text"
            disabled
            aria-label={`Reply to ${mindName} (not available here)`}
            placeholder="Continue conversation..."
            className="y-os-field"
            style={{ ...text(v("fs-body")), width: "100%", height: "100%", padding: "0 12px", border: "none", outline: "none", background: "transparent", font: "inherit", fontSize: v("fs-body"), lineHeight: 1.2 }}
          />
        </span>
        <span style={{ width: 32, height: 32, borderRadius: 16, background: v("bg-card"), display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <span style={text(v("fs-title-2"), 700, v("text-dim"))}>&gt;</span>
        </span>
      </div>
    </aside>
  );
}
