// `npm run dev`: the live-stream proxy (scripts/dev-live-proxy.mjs) and the Next dev server
// together, on every platform. Arguments after `--` go to `next dev`, e.g. `npm run dev -- -p 3210`.
import { spawn } from "node:child_process";
import "./dev-live-proxy.mjs";

const next = spawn("npx", ["next", "dev", ...process.argv.slice(2)], { stdio: "inherit", shell: process.platform === "win32" });
next.on("exit", (code) => process.exit(code ?? 0));
