import type { ReactNode } from "react";
import { claim, osLink } from "@/lib/os-repo";

/** A source line: "from <path>" linked at the pinned commit, and any further files. */
export function Source({ paths, checked, children }: { paths: string[]; checked?: string; children?: ReactNode }) {
  return (
    <span className="s-src">
      {children ?? "from "}
      {paths.map((p, i) => (
        <span key={p}>
          {i ? " · " : null}
          <a href={osLink(p)}>{p}</a>
        </span>
      ))}
      {checked ? ` · checked ${checked}` : null}
    </span>
  );
}

/**
 * One sentence from the claims register (src/data/claims.json), rendered with its limit beside it
 * and its source under it, so the words and where they come from cannot drift apart.
 */
export function Claim({ id, as = "p" }: { id: string; as?: "p" | "li" }) {
  const c = claim(id);
  const Tag = as;
  return (
    <Tag className="s-claim" data-claim={c.id}>
      <span className="s-claim-text">{c.text}</span>
      {c.limit ? <span className="s-limit">{c.limit}</span> : null}
      <Source paths={[c.source, ...(c.also ?? [])]} />
    </Tag>
  );
}

export function Claims({ ids }: { ids: string[] }) {
  return (
    <ul className="s-claims">
      {ids.map((id) => (
        <Claim key={id} id={id} as="li" />
      ))}
    </ul>
  );
}
