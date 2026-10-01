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
export function Claim({ id, as = "p", quiet = false }: { id: string; as?: "p" | "li"; quiet?: boolean }) {
  const c = claim(id);
  const Tag = as;
  return (
    <Tag className="s-claim" data-claim={c.id}>
      <span className="s-claim-text">{c.text}</span>
      {c.limit ? <span className="s-limit">{c.limit}</span> : null}
      {/* `quiet`: the claim is still checked at build against its source, but the page does not
          print the path. For the live machine, whose deploy files are not a map to hand out. */}
      {quiet ? null : <Source paths={[c.source, ...(c.also ?? [])]} />}
    </Tag>
  );
}

export function Claims({ ids, quiet = false }: { ids: string[]; quiet?: boolean }) {
  return (
    <ul className="s-claims">
      {ids.map((id) => (
        <Claim key={id} id={id} as="li" quiet={quiet} />
      ))}
    </ul>
  );
}
