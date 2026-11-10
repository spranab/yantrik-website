"use client";

import { useEffect, useState } from "react";
import { CopyButton } from "./CopyButton";
import { ISO_BASE, LATEST_ALIAS, LATEST_JSON, commitOf, gib, parseLatest, type Release } from "@/lib/release";
import { OS_REPO } from "@/lib/os-repo";

/**
 * The current image as a block of fields, each value copyable: read from latest.json when the
 * site was built, then read again in the browser, so a visitor a week later still gets the image
 * the host has now rather than one it has since deleted.
 */
export function ReleaseBlock({ initial, compact = false }: { initial: Release; compact?: boolean }) {
  const [r, setR] = useState(initial);
  const [fresh, setFresh] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(LATEST_JSON, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((j) => {
        const parsed = parseLatest(j);
        if (!cancelled && parsed) {
          setR((prev) => ({ ...prev, ...parsed, from: "build" }));
          setFresh(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // One link, always: the host's `latest` alias, which yantrik-publish re-points at every nightly.
  // Never a build's own filename: the host keeps only the newest few images, so a filename on a
  // page is a 404 a week later. The live site linked builds 1067 and 1084 for days after both were
  // pruned. Pranab, 10 Oct: "We should have one version latest, and that should always resolve to
  // the latest nightly." The fields above still say which build that is today.
  const url = `${ISO_BASE}/${LATEST_ALIAS}`;
  const commit = commitOf(r.file);
  const rows: [string, React.ReactNode, string?][] = [
    ["file", r.file, r.file],
    ["version", r.version || "unknown"],
    ...(r.date ? ([["built", r.date]] as [string, string][]) : []),
    ...(r.bytes ? ([["size", `${gib(r.bytes)}  (${r.bytes} bytes)`]] as [string, string][]) : []),
    ...(commit
      ? ([
          [
            "commit",
            <a key="c" className="s-link" href={`${OS_REPO}/commit/${commit}`}>
              {commit}
            </a>,
          ],
        ] as [string, React.ReactNode][])
      : []),
    r.sha256
      ? ["sha256", r.sha256, r.sha256]
      : [
          "sha256",
          <a key="s" className="s-link" href={`${url}.sha256`}>
            {`${r.file}.sha256`}
          </a>,
        ],
    ["channel", "nightly — the only one with builds"],
  ];

  return (
    <div className="s-release">
      <div className="s-term">
        <div className="s-term-bar">
          <span className="s-term-title">latest.json</span>
          <span className="s-term-meta">iso.yantrikos.com/nightly</span>
        </div>
        <dl className="s-release-dl">
          {rows.map(([k, val, copy]) => (
            <div key={k} className="s-release-row">
              <dt>{k}</dt>
              <dd>
                <span className="s-release-val">{val}</span>
                {copy && !compact ? <CopyButton value={copy} label={k} /> : null}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="s-release-actions">
        <a className="s-btn" href={url}>
          Download the ISO{r.bytes ? ` · ${gib(r.bytes)}` : ""}
        </a>
        <a className="s-btn s-btn-quiet" href={`${url}.sha256`}>
          Its sha256 file
        </a>
        {r.changelog && !compact ? (
          <a className="s-btn s-btn-quiet" href={`${ISO_BASE}/yantrik-os-latest.changelog.md`}>
            What changed in it
          </a>
        ) : null}
      </div>
      <span className="s-src">
        {r.from === "fallback" && !fresh
          ? "latest.json could not be read when this page was built, so these are the host's always-current alias and its checksum file."
          : fresh
            ? `Read from ${LATEST_JSON} just now, in your browser.`
            : `Read from ${LATEST_JSON} when this page was built (${r.readAt}); your browser reads it again.`}
      </span>
    </div>
  );
}
