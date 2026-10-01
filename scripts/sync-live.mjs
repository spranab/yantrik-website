// /live is a framework-free page (public/live/), served under its own strict CSP. It shares the
// site's tokens, theme and the OS's typefaces by copying them next to it at build: the same
// tokens.css gen-tokens.mjs writes for the site, src/theme's boot script and stylesheet, and the
// font files sync-os-assets.mjs takes from the OS.
// Run after both. Nothing here is edited by hand; change the source and rebuild.

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const copies = [
  ["src/fonts/Barlow-Regular.ttf", "public/live/fonts/Barlow-Regular.ttf"],
  ["src/fonts/Barlow-Medium.ttf", "public/live/fonts/Barlow-Medium.ttf"],
  ["src/fonts/Barlow-SemiBold.ttf", "public/live/fonts/Barlow-SemiBold.ttf"],
  ["src/fonts/JetBrainsMono-Regular.ttf", "public/live/fonts/JetBrainsMono-Regular.ttf"],
  ["public/brand/yantrik-mark.svg", "public/live/mark.svg"],
  // The site's theme: the boot script the app inlines, and the roles and toggle it styles.
  ["src/theme/theme-boot.js", "public/live/theme.js"],
  ["src/theme/theme.css", "public/live/theme.css"],
];
mkdirSync("public/live/fonts", { recursive: true });
for (const [from, to] of copies) copyFileSync(from, to);

const tokens = readFileSync("src/os/tokens.css", "utf8");
writeFileSync(
  "public/live/tokens.css",
  `/* Copied from src/os/tokens.css by scripts/sync-live.mjs. Do not edit. */\n${tokens}`,
);
console.log(`live: tokens and ${copies.length} files beside public/live/index.html`);
