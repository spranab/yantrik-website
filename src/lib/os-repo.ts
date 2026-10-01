import claims from "@/data/claims.json";

/** The OS repository this site describes, and the commit every claim was checked against. */
export const OS_REPO = "https://github.com/yantrikos/yantrik-os";
export const OS_COMMIT: string = claims.commit;
export const OS_COMMIT_SHORT = OS_COMMIT.slice(0, 7);

/**
 * A link to a path in the OS repository at the pinned commit, so a source line on the page opens
 * the file as it was when the sentence was checked, not as it is today. A path with no extension
 * is a directory (`harnesses`, `skills`).
 */
export function osLink(path: string): string {
  const isDir = !/\.[A-Za-z0-9]+$/.test(path.split("/").pop() ?? "") || path.endsWith("/");
  return `${OS_REPO}/${isDir ? "tree" : "blob"}/${OS_COMMIT}/${path.replace(/\/$/, "")}`;
}

export type Claim = {
  id: string;
  text: string;
  source: string;
  also?: string[];
  checked: string;
  limit?: string;
};

const byId = new Map<string, Claim>((claims.claims as Claim[]).map((c) => [c.id, c]));

export function claim(id: string): Claim {
  const c = byId.get(id);
  if (!c) throw new Error(`claims.json has no ${id}`);
  return c;
}
