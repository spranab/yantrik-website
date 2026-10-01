import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import "@/os/os.css";
import { Desktop } from "@/os/Desktop";
import { StatusBar, type StatusBarProps } from "@/os/StatusBar";
import { Taskbar } from "@/os/Taskbar";
import { ApprovalCard, DecidedRecord } from "@/os/ApprovalCard";
import { MindPanel } from "@/os/MindPanel";
import { MindModeMenu } from "@/os/MindModeMenu";
import { WindowFrame } from "@/os/WindowFrame";
import { LabwcFrame } from "@/os/LabwcFrame";
import { ChromiumWindow } from "@/os/ChromiumWindow";
import { NotesWindow } from "@/os/NotesWindow";
import { AppTile } from "@/os/AppTile";
import { MindMark } from "@/os/MindMark";
import { MessageBubble } from "@/os/MessageBubble";
import { ICONS } from "@/os/icons";
import { allowedRecord, chromium, debianFavicon, deniedRecord, exportCard, messages, mindNow, notes, noteText, noteWords } from "./fixture";

export const metadata: Metadata = {
  title: "OS replica preview",
  description: "Development preview of the desktop replica's components. Sample data, not a recording.",
  robots: { index: false, follow: false },
};

const bar: Omit<StatusBarProps, "width"> = {
  clock: "14:07",
  date: "Thu 1 Oct",
  companionStatus: "idle",
  cpuPercent: 4,
  memText: "1.9 GB / 7.8 GB",
  mode: "ask",
  modeLabel: "Ask",
  harnessId: "yantrik-mind",
  harnessName: "Yantrik Mind",
  harnessDriving: true,
  networkOnline: true,
  networkMedium: "ethernet",
};

const label: CSSProperties = {
  font: "500 11px/1.4 var(--font-jetbrains-mono), monospace",
  color: "var(--y-text-dim)",
  letterSpacing: 0.5,
  margin: "0 0 8px",
};

function Specimen({ title, children, note }: { title: string; children: ReactNode; note?: string }) {
  return (
    <section style={{ margin: "0 24px 40px" }}>
      <h2 style={{ font: "600 16px/1.3 var(--font-barlow), sans-serif", color: "var(--y-text-primary)", margin: "0 0 4px" }}>{title}</h2>
      {note ? <p style={{ ...label, letterSpacing: 0 }}>{note}</p> : null}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>{children}</div>
    </section>
  );
}

/** A piece of shell chrome on the shell's own ground, as the desktop draws it. */
const ground = (children: ReactNode, style?: CSSProperties) => (
  <div className="y-os" style={{ background: "var(--y-bg-deep)", ...style }}>
    {children}
  </div>
);

const onWallpaper = (children: ReactNode, w: number, h: number, pad = 16) => (
  <div className="y-os" style={{ width: w, height: h, padding: pad, background: "var(--y-bg-deep) url(/os/wallpapers/serenity.png) center / cover" }}>{children}</div>
);

export default function OsPreview() {
  const nested = { width: 896, height: 560 };
  return (
    <main id="main" style={{ padding: "0 0 48px" }}>
      {/* The full composition: the approval card is up. 1280×800, the OS's logical pixels. */}
      <div style={{ width: 1280, height: 800, position: "relative", overflow: "hidden" }}>
        <Desktop
          statusBar={bar}
          taskbar={{ windows: [{ appId: "mind-view", title: "Mind View", subtitle: "Mind View · Browser, Notes" }], chatWith: "Yantrik Mind" }}
          front="windows"
          mindView={{
            x: 0,
            y: 102,
            ...nested,
            windows: [
              {
                key: "browser",
                x: 16,
                y: 14,
                node: (
                  <ChromiumWindow
                    width={620}
                    height={400}
                    title="Debian -- Debian “trixie” Release Information"
                    url="debian.org/releases/trixie/"
                    pageSrc="/os-preview/debian-trixie.png"
                    favicon={debianFavicon}
                    palette={chromium}
                  />
                ),
              },
              {
                key: "notes",
                x: 200,
                y: 86,
                node: (
                  <NotesWindow
                    width={680}
                    height={460}
                    status="All changes saved"
                    notes={notes}
                    allCount={2}
                    pinCount={0}
                    noteTitle="Debian 13 — what changed"
                    content={noteText}
                    words={noteWords}
                  />
                ),
              },
            ],
          }}
          lens={{ mindName: "Yantrik Mind", messages, approvals: [exportCard], canOpenInAgents: true, sessionDisabledNote: "In the replay only Allow once and Deny were recorded." }}
          mindPanel={{ open: true, now: mindNow, mode: "ask", modeLabel: "Ask", ceiling: "sensitive" }}
        />
      </div>

      <div style={{ paddingTop: 40 }}>
        <p style={{ ...label, margin: "0 24px 32px" }}>
          Sample data for layout, not a recording. Each piece below is the same component alone, in its states.
        </p>

        <Specimen title="Status bar: the mode chip in each mode, and the mind chip" note="ask · plan · auto · bypass with its countdown · full bypass · private · a mind thinking (the dot pulses only then)">
          {(
            [
              ["ask", "Ask"],
              ["plan", "Plan"],
              ["auto", "Auto"],
              ["bypass", "Bypass 14m"],
              ["bypass_all", "Full bypass 43m"],
            ] as const
          ).map(([mode, modeLabel]) => (
            <div key={mode}>{ground(<StatusBar {...bar} width={1232} mode={mode} modeLabel={modeLabel} />)}</div>
          ))}
          {ground(<StatusBar {...bar} width={1232} privateMode />)}
          {ground(<StatusBar {...bar} width={1232} companionStatus="thinking" cpuPercent={38} />)}
        </Specimen>

        <Specimen title="Status bar: what it has room for" note="width 1050: no CPU/MEM (shown at ≥1100) · width 960: no date (≥1000) · the built-in companion: no mind chip, the privacy badge instead">
          {ground(<StatusBar {...bar} width={1050} />)}
          {ground(<StatusBar {...bar} width={960} />)}
          {ground(<StatusBar {...bar} width={1232} harnessId="companion" harnessDriving={false} aiPrivacyMode="local" aiProviderLabel="qwen3.5:9b" notificationUnread={3} />)}
        </Specimen>

        <Specimen title="Taskbar">
          {ground(
            <Taskbar
              width={1232}
              windows={[
                { appId: "mind-view", title: "Mind View", subtitle: "Mind View · Browser, Notes" },
                { appId: "notes", title: "Notes" },
                { appId: "terminal", title: "Yantrik Terminal" },
                { appId: "browser", title: "Untitled - Chromium" },
              ]}
              chatWith="Yantrik Mind"
              companionCount={2}
            />,
          )}
        </Specimen>

        <Specimen title="The approval card, alone, and the records it leaves" note="404px wide, as in the desktop's corner (x = W − 420, y = 48) · then Allowed once and Denied">
          {onWallpaper(<ApprovalCard data={exportCard} sessionDisabledNote="In the replay only Allow once and Deny were recorded." />, 436, 560)}
          {ground(
            <div style={{ width: 380, padding: "8px 0", display: "flex", flexDirection: "column", gap: 4 }}>
              <DecidedRecord decision="allowed" record={allowedRecord.record} />
              <DecidedRecord decision="denied" record={deniedRecord.record} />
            </div>,
          )}
        </Specimen>

        <Specimen title="Mind panel" note="expanded (302px) on the desktop · the collapsed strip">
          {onWallpaper(<MindPanel open now={mindNow} mode="ask" modeLabel="Ask" ceiling="sensitive" />, 334, 470)}
          {onWallpaper(<div style={{ height: 300 }}><MindPanel open={false} now={mindNow} mode="ask" modeLabel="Ask" ceiling="sensitive" /></div>, 44, 300, 0)}
        </Specimen>

        <Specimen title="The mode menu" note="opens from the mode chip at x = W − 352, y = 36 · the bypass confirmation">
          {onWallpaper(<MindModeMenu mode="ask" modeLabel="Ask" ceiling="sensitive" />, 372, 520)}
          {onWallpaper(<MindModeMenu mode="ask" modeLabel="Ask" ceiling="sensitive" confirmingBypass />, 372, 520)}
        </Specimen>

        <Specimen title="Frames" note="the shell's WindowFrame, floating · labwc's frame, inactive">
          {onWallpaper(
            <WindowFrame title="Settings" iconPath={ICONS.settings} iconColor="var(--y-app-slate)" width={520} height={300}>
              <div style={{ padding: 20, color: "var(--y-text-secondary)", fontSize: 14 }}>Content area</div>
            </WindowFrame>,
            580,
            360,
            30,
          )}
          {onWallpaper(
            <LabwcFrame title="Yantrik Terminal" active={false} contentWidth={420} contentHeight={200} shadow>
              <div style={{ position: "absolute", inset: 0, background: "var(--y-bg-deep)" }} />
            </LabwcFrame>,
            500,
            300,
            30,
          )}
        </Specimen>

        <Specimen title="The Notes window alone" note="at its preferred 1120px, empty, as a mind's Notes looked in Mind View on 24 Sep 2026">
          {ground(
            <NotesWindow
              width={1120}
              height={701}
              status="All changes saved"
              allCount={17}
              pinCount={0}
              books={[{ name: "Welcome", count: 1 }]}
              notes={[
                { id: "a", title: "US Market Status — Wed 23 Sep 2026", preview: "**Meeting:** Thursday 24 September 2026", date: "Sep 23 · 16:14" },
                { id: "b", title: "Writers' room — Voice B, beat 1", preview: "Cast: Voice A, Voice B, Narrator. Voice B speaks", date: "Sep 23 · 12:18" },
                { id: "c", title: "Writers' room — Voice A, beat 1", preview: "Cast: Voice A, Voice B, Narrator. Voice A speaks", date: "Sep 23 · 12:17" },
                { id: "d", title: "Groceries", preview: "- Milk", date: "Sep 23 · 11:55" },
              ]}
            />,
          )}
        </Specimen>

        <Specimen title="App tiles, Mind mark, messages">
          {ground(
            <div style={{ display: "flex", gap: 12, padding: 16, alignItems: "center" }}>
              {["files", "browser", "terminal", "notes", "email", "calendar", "mind-view"].map((id) => (
                <AppTile key={id} appId={id} size={44} />
              ))}
              {["files", "notes", "mind-view"].map((id) => (
                <AppTile key={`s-${id}`} appId={id} size={22} />
              ))}
              <MindMark initial="Y" />
              <MindMark initial="Y" builtin />
              <MindMark initial="H" online={false} />
            </div>,
          )}
          {ground(
            <div style={{ width: 380, padding: "8px 0" }}>
              {messages.map((m, i) => (
                <MessageBubble key={i} data={m} />
              ))}
            </div>,
          )}
        </Specimen>
      </div>
    </main>
  );
}
