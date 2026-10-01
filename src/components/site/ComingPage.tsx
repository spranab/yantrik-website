import { SiteShell } from "./SiteShell";
import { osLink } from "@/lib/os-repo";

/**
 * An honest stub for a page that is planned and not built: what it will hold, in plain words,
 * and the files in the OS repository it will be built from, so a visitor can read the source
 * today instead of meeting a 404 or a page of filler.
 */
export function ComingPage({ name, holds, sources }: { name: string; holds: string[]; sources: { path: string; what: string }[] }) {
  return (
    <SiteShell>
      <div className="s-wrap" style={{ paddingTop: 72, paddingBottom: 120 }}>
        <p className="s-route">yantrikos.com/{name.toLowerCase()}</p>
        <h1 className="s-display">{name}: not built yet.</h1>
        <p className="s-sub">This page is planned and has not been written. Nothing below is a placeholder for content; it is what the page will cover, and where that is written down today.</p>
        <div className="coming-grid">
          <section aria-labelledby="holds">
            <h2 id="holds" className="s-h3">What it will hold</h2>
            <ul className="coming-list">
              {holds.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="sources">
            <h2 id="sources" className="s-h3">Read it at the source until then</h2>
            <ul className="coming-list coming-src">
              {sources.map((s) => (
                <li key={s.path}>
                  <a className="s-link mono" href={osLink(s.path)}>
                    {s.path}
                  </a>
                  <span>{s.what}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </SiteShell>
  );
}
