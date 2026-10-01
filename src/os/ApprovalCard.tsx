import type { CSSProperties, ReactNode } from "react";
import { elide, ring, text, v, wrap } from "./css";
import type { ApprovalRequest } from "./types";

export type ApprovalCardProps = {
  data: ApprovalRequest;
  /** The two answers. Real buttons, Deny first in tab order, as the OS draws them. */
  onDeny?: () => void;
  onAllow?: () => void;
  /**
   * Whether the app's paragraph runs past the 42px clamp, which is when the card offers
   * "show more". Measured in the OS; here the caller says, or a character count estimates it.
   */
  purposeOverflows?: boolean;
  /** "show more" was pressed: the paragraph in full. */
  purposeOpen?: boolean;
  callerOverflows?: boolean;
  callerOpen?: boolean;
  /** Why the session row is not pressable here, for assistive technology. */
  sessionDisabledNote?: string;
};

const micro = (color = v("text-dim"), w = 400): CSSProperties => ({ ...text(v("fs-micro"), w, color), ...elide });
const label = (s: string) => <span style={micro()}>{s}</span>;

/** A pair read as value over label: no gap inside it, the sp-2 between pairs (intent_lens ~291). */
const pair = (value: ReactNode, under: string) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    {value}
    {label(under)}
  </div>
);

/** The 3px bar beside a line that matters (decided records, discrepancies, the warning). */
const bar = (color: string) => <span style={{ width: 3, alignSelf: "stretch", flex: "none", background: color }} />;

const button: CSSProperties = {
  appearance: "none",
  border: "none",
  margin: 0,
  padding: 0,
  font: "inherit",
  cursor: "pointer",
  height: v("h-regular"),
  flex: "1 1 0",
  minWidth: 0,
  borderRadius: v("r-md"),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

/** Roughly how many 12px Barlow lines a sentence takes in the card's column (~62 per line at 380px). */
const lines = (s: string, perLine = 62) => Math.ceil(s.length / perLine);

/**
 * One request, or the line it leaves behind: ApprovalCard in
 * crates/yantrik-ui-slint/ui/components/intent_lens.slint (~138–788), every row, in order.
 *
 * Waiting: an opaque `bg-card` card, r-lg, its 1px edge coloured by the grade (`color-warning`
 * for sensitive, `color-danger` for dangerous, else `glass-border-strong`), an 18px
 * `overlay-shadow` in the source (not drawn: see below), padding sp-3 and sp-2 between rows. Who is asking twice (the caller's claim,
 * then what the kernel established), the agent, the action by its exact name, the app's first
 * sentence, its whole paragraph clamped to three lines, the arguments in mono, the grade line;
 * then Deny (filled `bg-elevated`) and Allow once (an amber outline), both 32px r-md, and the
 * session row under them. Decided: one 12px dim line beside a 3px bar, green or red.
 *
 * Width comes from the parent: 404 in the desktop's corner (x = W − 420, y = 48), the panel's
 * width less sp-2 a side in the Lens.
 */
export function ApprovalCard({ data, onDeny, onAllow, purposeOverflows, purposeOpen = false, callerOverflows, callerOpen = false, sessionDisabledNote }: ApprovalCardProps) {
  if (data.decision !== "") return <DecidedRecord decision={data.decision} record={data.record} />;

  const edge = data.grade === "dangerous" ? v("color-danger") : data.grade === "sensitive" ? v("color-warning") : v("glass-border-strong");
  // Three lines are 43.2px, past the 42px clamp, so a three-line paragraph already offers "show more".
  const purposeMore = purposeOverflows ?? lines(data.purpose) >= 3;
  const callerMore = callerOverflows ?? lines(data.callerSays) >= 2;
  const caption = (color = v("text-primary")): CSSProperties => ({ ...text(v("fs-caption"), 400, color), ...wrap });
  const showMore = (open: boolean) => (
    <span style={{ ...micro(), height: 20, display: "flex", alignItems: "center" }}>{open ? "show less" : "show more"}</span>
  );

  return (
    <section
      aria-label={`${data.requester} asks to use ${data.app}.${data.action}`}
      style={{
        borderRadius: v("r-lg"),
        background: v("bg-card"),
        // The 18px `overlay-shadow` is not drawn: the software renderer the OS runs on has no
        // drop shadows (i-slint-renderer-software `draw_box_shadow` is a TODO), and no capture
        // of the card shows one.
        boxShadow: ring(edge),
        padding: v("sp-3"),
        display: "flex",
        flexDirection: "column",
        gap: v("sp-2"),
      }}
    >
      {/* identity: pinned */}
      <div style={{ display: "flex", flexDirection: "column", gap: v("sp-2") }}>
        <div style={{ display: "flex", gap: v("sp-2") }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, marginTop: 5, flex: "none", background: v("amber") }} />
          <span style={{ ...micro(v("text-primary"), 600), flex: "1 1 0" }}>{data.requester}</span>
          <span style={text(v("fs-micro"), 400, v("text-dim"))}>{data.ageText}</span>
        </div>
        {label("says the caller · nothing on this machine checked that name")}
        {/* A replay whose recording did not carry the kernel's answer leaves it out rather than guess. */}
        {data.verified ? pair(<span style={micro(v("text-primary"), 600)}>{data.verified}</span>, "verified by this machine · the kernel said so, not the caller") : null}
        {data.agent
          ? pair(
              <span style={micro(v("text-primary"), 600)}>{`agent ${data.onBehalf ? `${data.onBehalf} · ` : ""}${data.agent}`}</span>,
              "named by the token the desktop gave it · also asked in its pane",
            )
          : null}
        {data.discrepancies.map((said) => (
          <div key={said} style={{ display: "flex", gap: v("sp-2") }}>
            {bar(v("color-danger"))}
            <span style={{ ...text(v("fs-caption"), 400, v("color-danger")), ...elide, flex: "1 1 0" }}>{said}</span>
          </div>
        ))}
        <span style={{ ...text(v("fs-body-strong"), 600), ...wrap }}>{`${data.app}.${data.action}`}</span>
        {/* Not behind an `if` in the OS: an empty summary is a zero-height row that still takes its gap. */}
        <div style={{ height: data.summary ? undefined : 0, overflow: "hidden" }}>
          {data.summary ? pair(<span style={caption()}>{data.summary}</span>, "what it does · the app's own first sentence") : null}
        </div>
      </div>

      {/* details: what yields when the card may not be as tall as it likes */}
      <div style={{ display: "flex", flexDirection: "column", gap: v("sp-2") }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ maxHeight: purposeOpen ? undefined : 42, overflow: "hidden" }}>
            <div style={caption(v("text-secondary"))}>{data.purpose}</div>
          </div>
          {purposeMore ? showMore(purposeOpen) : null}
          {label("says the app about the action · the same for every call of it")}
        </div>
        {data.callerSays ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ maxHeight: callerOpen ? undefined : 28, overflow: "hidden" }}>
              <div style={{ ...caption(v("text-secondary")), fontStyle: "italic" }}>{data.callerSays}</div>
            </div>
            {callerMore ? showMore(callerOpen) : null}
            {label("says the caller about this call · nothing checks it")}
          </div>
        ) : null}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ borderRadius: v("r-sm"), background: v("bg-input"), padding: v("sp-2"), display: "flex", flexDirection: "column" }}>
            {data.args.map((line) => (
              // fs-mono's size, in the default face: the Slint Text names no font-family (~566).
              <span key={line} style={{ ...text(v("fs-mono")), ...elide }}>
                {line}
              </span>
            ))}
          </div>
          {label("asked for in this call · the grant is bound to exactly these")}
        </div>
        {data.explained ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={caption()}>{data.explained}</span>
            <span style={{ ...text(v("fs-micro"), 400, v("text-dim")), ...wrap }}>
              says the app about this one call, with these arguments · the grant binds to the argument box above, not to this sentence
            </span>
          </div>
        ) : null}
        {data.target
          ? pair(
              <span style={{ ...text(v("fs-caption")), ...elide }}>{data.target}</span>,
              "says the app what its handle means · the grant binds to the arguments above, not to this line",
            )
          : null}
        {data.warning ? (
          <div style={{ display: "flex", gap: v("sp-2") }}>
            {bar(v("color-danger"))}
            <span style={{ ...caption(v("color-danger")), flex: "1 1 0" }}>{data.warning}</span>
          </div>
        ) : null}
        <span style={{ ...text(v("fs-micro"), 400, v("text-dim")), ...wrap }}>{`Graded ${data.grade}. Allowing covers this one action, once.`}</span>
      </div>

      {/* decide: pinned. Deny first, and neither button dressed up as the obvious one. */}
      <div style={{ display: "flex", flexDirection: "column", gap: v("sp-2") }}>
        <div style={{ display: "flex", gap: v("sp-2"), paddingTop: v("sp-1") }}>
          <button type="button" onClick={onDeny} style={{ ...button, background: v("bg-elevated"), boxShadow: ring(v("border-default")) }}>
            <span style={text(v("fs-body-strong"))}>Deny</span>
          </button>
          <button type="button" onClick={onAllow} style={{ ...button, background: "transparent", boxShadow: ring(v("amber")) }}>
            <span style={text(v("fs-body-strong"), 400, v("amber-light"))}>Allow once</span>
          </button>
        </div>
        {data.canSession ? (
          <div style={{ display: "flex", flexDirection: "column", gap: v("sp-1") }}>
            <button
              type="button"
              aria-disabled="true"
              title={sessionDisabledNote}
              style={{ ...button, flex: "none", height: 30, cursor: "default", background: "transparent", boxShadow: ring(v("border-subtle")), padding: "0 8px" }}
            >
              <span style={{ ...micro(), fontSize: v("fs-caption") }}>{`Allow ${data.app}.${data.action} for this session`}</span>
            </button>
            <span style={{ ...micro(), textAlign: "center" }}>covers every mind and caller, until restart or the mode is lowered</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/**
 * What a decided request leaves in the conversation (intent_lens.slint ~184–206): a 3px bar,
 * `color-success` for allowed and `color-danger` for denied, and the record in 12px `text-dim`,
 * sp-4 in from the sides and sp-1 above and below.
 */
export function DecidedRecord({ decision, record }: { decision: ApprovalRequest["decision"]; record: string }) {
  const color = decision === "allowed" ? v("color-success") : decision === "denied" ? v("color-danger") : v("text-dim");
  return (
    <div style={{ display: "flex", gap: v("sp-2"), padding: `${v("sp-1")} ${v("sp-4")}` }}>
      {bar(color)}
      <span style={{ ...text(v("fs-caption"), 400, v("text-dim")), ...elide, flex: "1 1 0" }}>{record}</span>
    </div>
  );
}
