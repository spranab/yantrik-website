import fallback from "@/data/release.json";

// The current nightly image, as the release host itself says: iso.yantrikos.com/nightly/latest.json,
// written by deploy/yantrik-os/server/yantrik-publish whenever an image is published, and read by
// install.sh the same way. The host keeps only the newest few images, so nothing about a build is
// typed into this site: it is read here at build, and read again in the visitor's browser. If the
// host cannot be reached at build, the page falls back to the `latest` alias (which always resolves)
// and to the checksum FILE rather than a checksum it cannot vouch for.

export const ISO_BASE = "https://iso.yantrikos.com/nightly";
export const LATEST_JSON = `${ISO_BASE}/latest.json`;

export type Release = {
  file: string;
  version: string;
  date: string;
  bytes: number;
  sha256: string;
  changelog: string;
  /** Where these values came from: latest.json at build, or the fallback alias. */
  from: "build" | "fallback";
  readAt: string;
};

export function parseLatest(j: unknown): Omit<Release, "from" | "readAt"> | null {
  if (!j || typeof j !== "object") return null;
  const o = j as Record<string, unknown>;
  const file = typeof o.file === "string" ? o.file : "";
  const sha256 = typeof o.sha256 === "string" ? o.sha256 : "";
  if (!/^yantrik-os-[A-Za-z0-9._-]+\.iso$/.test(file) || !/^[0-9a-f]{64}$/.test(sha256)) return null;
  const changelog = typeof o.changelog === "string" && /^yantrik-os-[A-Za-z0-9._-]+\.changelog\.md$/.test(o.changelog) ? o.changelog : "";
  return {
    file,
    sha256,
    version: typeof o.version === "string" ? o.version : "",
    date: typeof o.date === "string" ? o.date : "",
    bytes: typeof o.bytes === "number" && o.bytes > 0 ? o.bytes : 0,
    changelog,
  };
}

/** Read once per build (static export: this runs in `next build`, never in a browser). */
export async function getRelease(): Promise<Release> {
  const readAt = new Date().toISOString().slice(0, 10);
  try {
    const res = await fetch(LATEST_JSON, { cache: "force-cache", signal: AbortSignal.timeout(10_000) });
    if (res.ok) {
      const parsed = parseLatest(await res.json());
      if (parsed) return { ...parsed, from: "build", readAt };
    }
  } catch {
    // The host is down or the build machine is offline: the alias below always resolves.
  }
  return { file: fallback.file, version: fallback.version, date: "", bytes: 0, sha256: "", changelog: "", from: "fallback", readAt };
}

/** 1748850688 → "1.63 GiB", as install.sh's human_bytes prints it. */
export function gib(bytes: number): string {
  return bytes > 0 ? `${(bytes / 2 ** 30).toFixed(2)} GiB` : "";
}

/** The commit an image was built from, from its name (yantrik-os-v0.1.0-1067-gdb55044.iso). */
export function commitOf(file: string): string {
  return /-g([0-9a-f]{7,40})\.iso$/.exec(file)?.[1] ?? "";
}
