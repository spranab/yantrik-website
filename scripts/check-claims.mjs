// Every claim the site makes must have a source that exists in the OS repository at the pinned
// commit, and must have been checked within 60 days. Run at build (`pnpm check:claims`); it fails
// the build rather than let a sentence outlive the code it describes.
//
// The OS checkout is found at $YANTRIK_OS (default ../yantrik-os). Without one (CI with no
// checkout) it asks GitHub for each path at the commit instead.

import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const register = JSON.parse(readFileSync(new URL("../src/data/claims.json", import.meta.url), "utf8"));
const osRepo = resolve(process.env.YANTRIK_OS ?? "../yantrik-os");
const local = existsSync(resolve(osRepo, ".git"));
const MAX_AGE_DAYS = 60;
const today = new Date();
const problems = [];
const seen = new Set();

async function exists(path) {
  if (local) {
    try {
      execFileSync("git", ["-C", osRepo, "cat-file", "-e", `${register.commit}:${path}`], { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  }
  const url = `https://api.github.com/repos/${register.os_repo}/contents/${encodeURI(path)}?ref=${register.commit}`;
  const headers = process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
  const res = await fetch(url, { headers });
  return res.ok;
}

for (const c of register.claims) {
  if (seen.has(c.id)) problems.push(`${c.id}: the id is used twice`);
  seen.add(c.id);
  if (!c.text || !c.source || !c.checked) problems.push(`${c.id}: needs text, source and checked`);
  for (const path of [c.source, ...(c.also ?? [])]) {
    if (!(await exists(path))) problems.push(`${c.id}: ${path} does not exist at ${register.commit.slice(0, 8)}`);
  }
  const age = (today - new Date(c.checked)) / 86_400_000;
  if (!(age >= 0 && age <= MAX_AGE_DAYS)) problems.push(`${c.id}: checked ${c.checked}, more than ${MAX_AGE_DAYS} days ago (or in the future)`);
}

if (problems.length) {
  console.error(`claims: ${problems.length} problem(s)\n  ` + problems.join("\n  "));
  process.exit(1);
}
console.log(`claims: ${register.claims.length} claims, every source present at ${register.commit.slice(0, 8)} (${local ? "local checkout" : "GitHub"})`);
