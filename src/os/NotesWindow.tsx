import { AppHeader } from "./AppHeader";
import { Icon } from "./Icon";
import { YButton } from "./YButton";
import { ICONS } from "./icons";
import { elide, ring, text, v, wrap } from "./css";

export type NoteRow = { id: string; title: string; preview: string; date: string; pinned?: boolean; selected?: boolean };
export type BookRow = { name: string; count: number };

export type NotesWindowProps = {
  width: number;
  height: number;
  status: string;
  notes: NoteRow[];
  books?: BookRow[];
  allCount: number;
  pinCount: number;
  /** The open note. Without one, the empty "A little space to think." page. */
  noteTitle?: string;
  content?: string;
  words?: number;
  notebook?: string;
  modified?: boolean;
  focusMode?: boolean;
};

const SIDEBAR = 268;

/**
 * The Notes app as a mind's window shows it: NotesApp in apps/notes/ui/app.slint, inside the kit's
 * AppWindow (crates/yantrik-ui-kit/slint/app_window.slint). The window is frameless, so it
 * carries its own controls in the AppHeader and a 1px `border-default` round the edge.
 * Library on the left (268px of `bg-surface`), the open note on the right: its 54px title row,
 * the 44px notebook row, the text at 16px, and the 38px footer with the word count.
 */
export function NotesWindow(p: NotesWindowProps) {
  const opened = p.noteTitle !== undefined;
  const editorW = p.width - (p.focusMode ? 0 : SIDEBAR + 1);
  const textX = Math.max(28, (editorW - 720) / 2);
  return (
    <div style={{ position: "relative", width: p.width, height: p.height, background: v("bg-deep"), display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <AppHeader
        width={p.width}
        title="Notes"
        subtitle={p.status}
        icon={ICONS.notes}
        appId="notes"
        windowBar
        leadingActions={[{ id: "focus", icon: ICONS.list, label: p.focusMode ? "Library" : "Focus", active: !!p.focusMode }]}
        actions={[
          { id: "reload", icon: ICONS.refresh, label: "Refresh" },
          { id: "import", icon: ICONS.import, label: "Import" },
          { id: "new", icon: ICONS.plus, label: "New note", emphasis: 2 },
        ]}
      />
      <div style={{ flex: "1 1 0", minHeight: 0, display: "flex" }}>
        {!p.focusMode ? <Library {...p} /> : null}
        {!p.focusMode ? <div style={{ width: 1, background: v("separator"), flex: "none" }} /> : null}
        <div style={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column" }}>
          {opened ? (
            <>
              <div style={{ height: 54, flex: "none", background: v("bg-surface"), display: "flex", alignItems: "center", gap: 6, padding: "0 14px 0 20px" }}>
                <span style={{ ...text(15, 600), ...elide, flex: "1 1 0" }}>{p.noteTitle}</span>
                <YButton iconPath={ICONS.star} iconOnly size={0} variant={2} />
                <YButton label="Preview" size={0} variant={2} />
                <YButton iconPath={ICONS.export} iconOnly size={0} variant={2} />
                <YButton iconPath={ICONS.trash} iconOnly size={0} variant={2} />
              </div>
              <div style={{ height: 44, flex: "none", display: "flex", alignItems: "center", gap: 10, padding: "0 24px" }}>
                <span style={text(11, 400, v("text-dim"))}>Notebook</span>
                <Field value={p.notebook ?? ""} placeholder="Unfiled" />
              </div>
              <div style={{ position: "relative", flex: "1 1 0", minHeight: 0, overflow: "hidden" }}>
                <div style={{ position: "absolute", left: textX, top: 30, width: Math.min(720, editorW - 56), ...text(16), ...wrap, whiteSpace: "pre-wrap" }}>
                  {p.content}
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: "1 1 0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 18, padding: 50 }}>
              {/* A fixed-width element in a Slint VerticalLayout sits at the layout's left edge. */}
              <span style={{ alignSelf: "flex-start" }}>
                <Icon name="notes" size={46} tint={v("amber")} />
              </span>
              <span style={text(30, 600)}>A little space to think.</span>
              <span style={{ ...text(14, 400, v("text-secondary")), ...wrap, whiteSpace: "pre-line", textAlign: "center" }}>
                {"Gather ideas. Keep the details. Make something of them.\nChoose a note, or start a fresh page."}
              </span>
              <YButton label="Create a note" variant={0} />
              <span style={{ ...text(11, 400, v("text-dim")), whiteSpace: "pre" }}>{"Ctrl+N  New     Ctrl+F  Search     Ctrl+E  Focus"}</span>
            </div>
          )}
          <div style={{ height: 1, background: v("separator"), flex: "none" }} />
          <div style={{ height: 38, flex: "none", background: v("bg-surface"), display: "flex", alignItems: "center", gap: 14, padding: "0 16px 0 24px" }}>
            <span style={text(11, 400, v("text-dim"))}>{opened ? `${p.words ?? 0} words` : "Ready when you are"}</span>
            <span style={{ ...text(11, 400, p.modified ? v("amber") : v("text-secondary")), ...elide, flex: "1 1 0" }}>{p.status}</span>
          </div>
        </div>
      </div>
      {/* The frameless window's own edge (app_window.slint, when not maximised) */}
      <div style={{ position: "absolute", inset: 0, boxShadow: ring(v("border-default")), pointerEvents: "none" }} />
    </div>
  );
}

function Library(p: NotesWindowProps) {
  const books = p.books ?? [];
  return (
    <div style={{ width: SIDEBAR, flex: "none", background: v("bg-surface"), display: "flex", flexDirection: "column", gap: 10, padding: 14, boxSizing: "border-box", overflow: "hidden" }}>
      <span style={{ ...text(10, 600, v("text-dim")), letterSpacing: 1.6, height: 24, flex: "none" }}>YOUR LIBRARY</span>
      <span style={{ display: "flex", gap: 5, flex: "none" }}>
        <YButton label={`All  ${p.allCount}`} variant={1} size={0} grow />
        <YButton label={`Pinned  ${p.pinCount}`} variant={2} size={0} grow />
        <YButton iconPath={ICONS.trash} iconOnly size={0} variant={2} grow />
      </span>
      <Field value="" placeholder="Search title, text, tags" lead={ICONS.search} column />
      {books.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 2, height: Math.min(112, books.length * 30), flex: "none" }}>
          {books.map((b) => (
            <span key={b.name} style={{ height: 28, flex: "none", display: "flex", alignItems: "center", gap: 8, padding: "0 8px", borderRadius: 5 }}>
              <Icon name="folder" size={13} tint={v("amber")} />
              <span style={{ ...text(12, 400, v("text-secondary")), ...elide, flex: "1 1 0" }}>{b.name}</span>
              <span style={text(11, 400, v("text-dim"))}>{b.count}</span>
            </span>
          ))}
        </div>
      ) : null}
      {/* A 24px row holding a 28px button: Slint puts the button at the row's top, not its middle. */}
      <span style={{ height: 24, flex: "none", display: "flex", alignItems: "flex-start" }}>
        <span style={{ ...text(10, 400, v("text-dim")), letterSpacing: 1, flex: "1 1 0", alignSelf: "center" }}>{p.notes.length} NOTES</span>
        <YButton label="Recent" variant={2} size={0} />
      </span>
      <div style={{ flex: "1 1 0", minHeight: 0, display: "flex", flexDirection: "column", gap: 5, overflow: "hidden" }}>
        {p.notes.map((n) => (
          <div key={n.id} style={{ position: "relative", height: 99, flex: "none", borderRadius: 9, overflow: "hidden", background: n.selected ? v("hover-fill-strong") : "transparent" }}>
            {n.selected ? <span style={{ position: "absolute", left: 0, top: 16, width: 3, height: 65, borderRadius: 2, background: v("amber") }} /> : null}
            {/* The card's layout is given 99px and shares what its rows do not use among all three,
                each row's text at the top of its share (Slint's default alignment). */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5, padding: 12, height: "100%" }}>
              <span style={{ display: "flex", alignItems: "flex-start", gap: 5, minWidth: 0, flex: "1 1 auto" }}>
                {n.pinned ? <Icon name="star" size={12} tint={v("amber")} /> : null}
                <span style={{ ...text(14, 600), ...elide }}>{n.title}</span>
              </span>
              <span style={{ ...text(12, 400, v("text-secondary")), ...elide, flex: "1 1 auto" }}>{n.preview}</span>
              <span style={{ ...text(10, 400, v("text-dim")), ...elide, flex: "1 1 auto" }}>{n.date}</span>
            </div>
          </div>
        ))}
      </div>
      <span style={{ ...text(10, 400, v("text-dim")), height: 20, flex: "none", display: "flex", alignItems: "center" }}>Markdown files · Stored on this device</span>
    </div>
  );
}

/** The kit's YInput at rest (crates/yantrik-ui-kit/slint/y_input.slint): 32px, r-md, `bg-input`. */
function Field({ value, placeholder, lead, column = false }: { value: string; placeholder: string; lead?: string; column?: boolean }) {
  return (
    <span
      style={{
        position: "relative",
        height: v("h-regular"),
        flex: column ? "none" : "1 1 auto",
        minWidth: 100,
        borderRadius: v("r-md"),
        background: v("bg-input"),
        boxShadow: ring(v("border-default")),
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 8px 0 10px",
      }}
    >
      {lead ? <Icon d={lead} size={14} thickness={1.7} tint={v("text-dim")} /> : null}
      <span style={{ ...text(v("fs-body"), 400, value ? v("text-primary") : v("text-dim")), ...elide }}>{value || placeholder}</span>
    </span>
  );
}
