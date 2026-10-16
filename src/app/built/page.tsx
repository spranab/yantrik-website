import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { PlayFrame } from "@/components/built/PlayFrame";
import data from "@/data/builds.json";

export const metadata: Metadata = {
  title: "Built on the live machine · Yantrik OS",
  description:
    "Programs the Mind on Yantrik OS's live machine wrote on stream from a brief, copied exactly as it left them, with what works and what does not.",
};

type Build = (typeof data.builds)[number];

/** "16 Oct 2026, 00:23 UTC": the Director's log keeps UTC, and so does this page. */
function when(iso: string) {
  const t = new Date(iso);
  const day = t.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const hm = t.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
  return `${day}, ${hm} UTC`;
}

/** A PLAN.md or IDEAS.md as the checklist it is: ticked lines, unticked lines, and anything else. */
function Checklist({ md }: { md: string }) {
  const lines = md.split("\n").map((l) => l.trim()).filter(Boolean);
  return (
    <ul className="built-checklist">
      {lines.map((l, i) => {
        const m = l.match(/^[-*]\s+\[( |x|X)\]\s+(.*)$/);
        if (m) {
          const done = m[1] !== " ";
          return (
            <li key={i} data-done={done}>
              <span className="built-box" aria-label={done ? "ticked" : "not ticked"}>{done ? "✓" : ""}</span>
              {m[2]}
            </li>
          );
        }
        return (
          <li key={i} className="built-plain">
            {l.replace(/^#+\s*/, "")}
          </li>
        );
      })}
    </ul>
  );
}

const MARK = { true: "✓", false: "✗", null: "–" } as const;
const SAID = { true: "works", false: "does not work", null: "not checked" } as const;

function BuildArticle({ b }: { b: Build }) {
  const head = `built-${b.id}`;
  return (
    <article id={b.id} className="built-item" aria-labelledby={head}>
      <PlayFrame id={b.id} name={b.name} thumb={`/built-thumbs/${b.id}.webp`} />
      <div className="built-text">
        <h2 id={head} className="s-h2">
          {b.title}
        </h2>
        <dl className="built-facts">
          <div>
            <dt>Finished</dt>
            <dd>{when(b.finished)}</dd>
          </div>
          <div>
            <dt>Its last run</dt>
            <dd>
              {b.final_run.turns} {b.final_run.turns === 1 ? "turn" : "turns"}, {b.final_run.minutes}{" "}
              {b.final_run.minutes === 1 ? "minute" : "minutes"}
              {b.final_run.page_checked ? ", the page loaded clean" : ""}
            </dd>
          </div>
          <div>
            <dt>Mind</dt>
            <dd className="mono">{b.made_with.mind}</dd>
          </div>
          <div>
            <dt>Model</dt>
            <dd>{b.made_with.model}</dd>
          </div>
        </dl>
        <h3 className="s-h3">What we found when we played it</h3>
        <ul className="built-found">
          {b.checked.map((c, i) => {
            const k = String(c.ok) as "true" | "false" | "null";
            return (
              <li key={i} data-ok={k}>
                <span className="built-mark" aria-label={SAID[k]}>
                  {MARK[k]}
                </span>
                <span>{c.text}</span>
              </li>
            );
          })}
        </ul>
        {b.note ? <p className="built-note">{b.note}</p> : null}
        <details className="built-more">
          <summary>The brief, as the Director typed it</summary>
          <p className="built-brief">{b.brief}</p>
        </details>
        {b.plan ? (
          <details className="built-more">
            <summary>The Mind&rsquo;s plan, PLAN.md, with its own ticks</summary>
            <Checklist md={b.plan} />
          </details>
        ) : null}
        {b.ideas ? (
          <details className="built-more">
            <summary>What it would do next, IDEAS.md</summary>
            <Checklist md={b.ideas} />
          </details>
        ) : null}
        <details className="built-more">
          <summary>
            The files, {b.files.length} of them, {b.files.reduce((n, f) => n + f.bytes, 0).toLocaleString("en-GB")} bytes
          </summary>
          <table className="s-table built-files">
            <thead>
              <tr>
                <th scope="col">File</th>
                <th scope="col">Bytes</th>
                <th scope="col">SHA-256</th>
              </tr>
            </thead>
            <tbody>
              {b.files.map((f) => (
                <tr key={f.name}>
                  <td>
                    <a className="s-link mono" href={`/built-files/${b.id}/${f.name}`}>
                      {f.name}
                    </a>
                  </td>
                  <td className="mono">{f.bytes.toLocaleString("en-GB")}</td>
                  <td className="mono" title={f.sha256}>
                    {f.sha256.slice(0, 16)}…
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </div>
    </article>
  );
}

export default function Built() {
  const builds = data.builds;
  return (
    <SiteShell>
      <div className="s-wrap" style={{ paddingTop: 72 }}>
        <p className="s-route">yantrikos.com/built</p>
        <h1 className="s-display">Built on the live machine, and not touched since.</h1>
        <p className="s-sub">
          These are programs the Mind on the <a className="s-link" href="/live/">live machine</a> wrote on stream, from a
          brief and nothing else. They are copied here byte for byte as it left them, and they play as they are, bugs
          included. Under each is what we found when we played it.
        </p>
        <div className="s-prose built-how">
          <p>
            A small program on the machine, the Director, types each brief into the Mind&rsquo;s conversation the way a
            person would, then says &ldquo;keep going&rdquo; until the Mind says it is finished. The Mind does the work in a
            terminal of its own, writing a plan first and ticking its steps off. After every turn the Director loads the
            page in a headless browser, and a &ldquo;finished&rdquo; does not count while the page throws an error.
          </p>
          <p>
            A clean load is not a working program. Two of these ticked steps whose buttons do nothing, and say so below.
            Nothing here was fixed by hand.
          </p>
        </div>
        <nav className="built-index" aria-label="The builds">
          {builds.map((b) => (
            <a key={b.id} href={`#${b.id}`} className="built-index-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/built-thumbs/${b.id}.webp`} alt="" width={176} height={115} loading="lazy" decoding="async" />
              <span>{b.name}</span>
            </a>
          ))}
        </nav>
      </div>
      <div className="s-wrap built-list">
        {builds.map((b) => (
          <BuildArticle key={b.id} b={b} />
        ))}
      </div>
      <div className="s-wrap" style={{ paddingBottom: 120 }}>
        <p className="s-src">
          Imported from {data.machine} on {data.imported}. Each program runs in a sandboxed frame with scripts only: it
          cannot reach this page, your cookies or the network beyond its own files.
        </p>
      </div>
    </SiteShell>
  );
}
