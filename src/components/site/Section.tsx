import type { ReactNode } from "react";

/**
 * A homepage section: where it leads (the route, in mono, as a link), a head that is a sentence,
 * what is there in plain words, and one real artefact. "split" puts the artefact beside the words
 * (5 + 7 of 12 columns); "stack" puts it under them at full width, for a table or a row of tiles.
 */
export function Section({
  id,
  route,
  routeHref,
  title,
  children,
  art,
  more,
  layout = "split",
}: {
  id: string;
  route: string;
  routeHref: string;
  title: ReactNode;
  children: ReactNode;
  art: ReactNode;
  more?: { href: string; label: string };
  layout?: "split" | "stack";
}) {
  const head = `${id}-head`;
  return (
    <section id={id} className="s-sec" aria-labelledby={head}>
      <div className="s-wrap s-sec-grid" data-layout={layout}>
        <div className="s-sec-text">
          <div className="s-sec-head">
            <p className="s-route">
              <a href={routeHref}>{route}</a>
            </p>
            <h2 id={head} className="s-h2">
              {title}
            </h2>
          </div>
          <div className="s-sec-body">
            {children}
            {more ? (
              <a className="s-more" href={more.href}>
                {more.label}
                <span aria-hidden="true">→</span>
              </a>
            ) : null}
          </div>
        </div>
        <div className="s-sec-art">{art}</div>
      </div>
    </section>
  );
}
