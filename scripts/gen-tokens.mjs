// The site's design tokens, generated from the OS's own theme, so the website cannot drift from the
// desktop it shows. Reads yantrik-os/crates/yantrik-design-tokens/slint/theme.slint and evaluates
// every `out property` of the Theme and AccentPreset globals twice (scripts/lib/slint-expr.mjs):
// once with ThemeMode.dark true and once with it false, the accent at the default teal preset and
// ThemeOverrides off, as a stock install has them. Writes src/os/tokens.css as `--y-<name>` custom
// properties: the dark values on `:root`, and every light value that differs from its dark one
// under `prefers-color-scheme: light` (unless the visitor chose dark) and under
// `:root[data-theme="light"]` (src/theme/theme-boot.js sets the attribute).
//
// Fails (non-zero) if a token the site uses has gone from the OS: REQUIRED below.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { evaluate, globals, stripComments } from "./lib/slint-expr.mjs";

const osRepo = resolve(process.env.YANTRIK_OS ?? "../yantrik-os");
const themePath = resolve(osRepo, "crates/yantrik-design-tokens/slint/theme.slint");
const out = new URL("../src/os/tokens.css", import.meta.url);
const all = globals(stripComments(readFileSync(themePath, "utf8")));

const DARK = { dark: true };
const LIGHT = { dark: false };
const isCss = (v) => typeof v === "string" && /^(#[0-9a-fA-F]{3,8}|-?[\d.]+(?:px|ms|pt|%)?)$/.test(v);
const cssValue = (type, v) => (type === "int" || type === "float" ? v.replace(/px$/, "") : v);
const tryEval = (expr, scope, env) => {
  try {
    return evaluate(all, expr, scope, env);
  } catch {
    return null;
  }
};

// [name, dark value, light value or undefined when it is the same].
const vars = [];
const unresolved = [];
// Colours whose expression never reads ThemeMode: one value in both modes, by the OS's definition.
const sameInBoth = [];
function addGlobal(scope, prefix = "") {
  for (const [name, { type, expr }] of Object.entries(all[scope] ?? {})) {
    if (!["color", "length", "duration", "int", "float"].includes(type)) continue;
    const d = tryEval(expr, scope, DARK);
    const l = tryEval(expr, scope, LIGHT);
    if (!d || !isCss(d.value) || !l || !isCss(l.value)) {
      unresolved.push(prefix + name);
      continue;
    }
    if (type === "color" && !d.usesMode) sameInBoth.push(prefix + name);
    const dark = cssValue(type, d.value);
    const light = cssValue(type, l.value);
    // Theme re-exports AccentPreset's accent-* under the same names: one row each, Theme's value.
    const row = [prefix + name, dark, light !== dark ? light : undefined];
    const at = vars.findIndex(([n]) => n === row[0]);
    if (at >= 0) vars[at] = row;
    else vars.push(row);
  }
}
addGlobal("AccentPreset");
addGlobal("Theme");

// ── Every app its own colour: crates/yantrik-ui-kit/slint/app_color.slint ──
//
// The AppColor global's glyph tones (theme-aware) and solid tile fills (the same in both modes, on
// purpose: "an app icon is an object with its own colour"), as `--y-app-<name>`, and its
// `hue-for-app` table as src/os/app-identity.ts, so a tile in the replica wears exactly the colour
// the launcher and the taskbar give that app.
const appColorPath = resolve(osRepo, "crates/yantrik-ui-kit/slint/app_color.slint");
const appColorSrc = readFileSync(appColorPath, "utf8");
Object.assign(all, globals(stripComments(appColorSrc)));
addGlobal("AppColor", "app-");
const hueFn = appColorSrc.match(/function\s+hue-for-app\s*\([^)]*\)[^{]*\{([\s\S]*?)\n\s*\}/);
const hues = {};
if (hueFn) {
  const arm = /id\s*==\s*"([^"]+)"\s*\?\s*"([^"]*)"/g;
  let a;
  while ((a = arm.exec(hueFn[1]))) hues[a[1]] = a[2];
}
// `on-tile`: the three light hues carry the dark ink glyph, every other hue a white one.
const onTile = appColorSrc.match(/function\s+on-tile\s*\([^)]*\)[^{]*\{([\s\S]*?)\n\s*\}/);
const inkHues = onTile ? [...onTile[1].matchAll(/name\s*==\s*"(\w+)"/g)].map((x) => x[1]).filter((h) => h) : [];

// ── The compositor's frame: config/labwc/themerc and the radius and title font in rc.xml ──
//
// labwc draws the frame of every window that does not draw its own (Mind View's, on the person's
// desktop), from these values. `--y-labwc-<key with dots as dashes>`.
const themercPath = resolve(osRepo, "config/labwc/themerc");
for (const line of readFileSync(themercPath, "utf8").split("\n")) {
  const kv = line.replace(/^\s*#.*$/, "").match(/^\s*([\w.-]+)\s*:\s*(\S+)\s*$/);
  if (!kv) continue;
  const v = /^#[0-9a-fA-F]{3,8}$/.test(kv[2]) ? kv[2] : /^\d+$/.test(kv[2]) ? `${kv[2]}px` : null;
  if (v) vars.push([`labwc-${kv[1].replace(/\./g, "-")}`, v]);
}
const rcPath = resolve(osRepo, "config/labwc/rc.xml");
const rc = readFileSync(rcPath, "utf8").replace(/<!--[\s\S]*?-->/g, "");
const radius = rc.match(/<cornerRadius>\s*(\d+)\s*<\/cornerRadius>/);
const activeFont = rc.match(/<font\s+place="ActiveWindow">([\s\S]*?)<\/font>/);
if (radius) vars.push(["labwc-corner-radius", `${radius[1]}px`]);
if (activeFont) {
  const size = activeFont[1].match(/<size>\s*([\d.]+)\s*<\/size>/);
  const weight = activeFont[1].match(/<weight>\s*(\w+)\s*<\/weight>/);
  // labwc hands the font to Pango, whose sizes are points.
  if (size) vars.push(["labwc-font-size", `${size[1]}pt`]);
  const weights = { normal: 400, medium: 500, semibold: 600, bold: 700 };
  vars.push(["labwc-font-weight", String(weights[weight?.[1] ?? "normal"] ?? 400)]);
}

const REQUIRED = [
  "bg-deep", "bg-surface", "bg-card", "bg-elevated", "text-primary", "text-secondary", "text-dim",
  "accent", "accent-light", "accent-dim", "amber", "color-danger", "color-success", "color-warning",
  "border-subtle", "fs-hero", "fs-body", "fs-caption", "fs-micro", "fs-mono", "sp-4", "r-lg", "dur-normal",
  "app-tile-teal", "app-tile-amber", "app-tile-ink", "labwc-window-active-title-bg-color",
  "labwc-window-active-label-text-color", "labwc-window-active-border-color", "labwc-border-width",
  "labwc-button-width", "labwc-button-height", "labwc-corner-radius", "labwc-font-size",
];
const have = new Set(vars.map(([n]) => n));
const missing = REQUIRED.filter((n) => !have.has(n));
if (missing.length || !hueFn || !inkHues.length) {
  if (missing.length) console.error(`tokens: the OS no longer has ${missing.join(", ")} (or they did not resolve)`);
  if (!hueFn) console.error("tokens: app_color.slint has no `hue-for-app` to read");
  if (!inkHues.length) console.error("tokens: app_color.slint has no `on-tile` to read");
  process.exit(1);
}

// Light: only what differs. The labwc frame has no light theme (config/labwc/themerc is one
// file, read by the compositor whatever the shell's mode), so --y-labwc-* stay as they are.
const lightVars = vars.filter(([, , l]) => l !== undefined);
const block = (rows, indent = "  ") => rows.map((r) => indent + r).join("\n");
const darkRows = ["color-scheme: dark;", ...vars.map(([n, d]) => `--y-${n}: ${d};`)];
const lightRows = ["color-scheme: light;", ...lightVars.map(([n, , l]) => `--y-${n}: ${l};`)];
// A screen of the OS shown on a light page stays the OS in its dark mode, as the live stream does:
// the desktop replica in the hero is a picture of the machine, not part of the page around it.
// Every token light changes is set back to its dark value inside it.
const screenRows = ["color-scheme: dark;", ...lightVars.map(([n, d]) => `--y-${n}: ${d};`)];
const css = `/* Generated by scripts/gen-tokens.mjs from yantrik-os ${themePath.split(/[\\/]/).slice(-4).join("/")},
   crates/yantrik-ui-kit/slint/app_color.slint (--y-app-*) and config/labwc/themerc + rc.xml (--y-labwc-*).
   Accent at the default teal preset. Do not edit: change the OS, then regenerate.
   :root is ThemeMode.dark; the two light blocks are ThemeMode.dark == false, where it differs.
   The same in both modes by the OS's own definition: ${sameInBoth.join(", ")}, and every --y-labwc-*. */
:root {
${block(darkRows)}
}
@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
${block(lightRows, "    ")}
  }
}
:root[data-theme="light"] {
${block(lightRows)}
}
.y-screen-dark {
${block(screenRows)}
}
`;
mkdirSync(dirname(out.pathname.replace(/^\/([A-Za-z]:)/, "$1")), { recursive: true });
writeFileSync(out, css);

const identity = new URL("../src/os/app-identity.ts", import.meta.url);
writeFileSync(
  identity,
  `// Generated by scripts/gen-tokens.mjs from yantrik-os crates/yantrik-ui-kit/slint/app_color.slint.\n` +
    `// Do not edit: change the OS, then regenerate.\n\n` +
    `/** \`AppColor.hue-for-app(id)\`: which of the palette's hues an app wears. Unknown ids wear none. */\n` +
    `export const APP_HUES: Readonly<Record<string, string>> = {\n` +
    Object.entries(hues).map(([id, h]) => `  ${JSON.stringify(id)}: ${JSON.stringify(h)},`).join("\n") +
    `\n};\n\n` +
    `/** \`AppColor.on-tile(hue)\`: the light hues carry the dark ink glyph; the rest a white one. */\n` +
    `export const INK_HUES: ReadonlySet<string> = new Set(${JSON.stringify(inkHues)});\n`,
);
console.log(`tokens: ${vars.length} written (${lightVars.length} with a light value of their own, ${sameInBoth.length} colours the same in both modes), ${Object.keys(hues).length} app hues${unresolved.length ? `, ${unresolved.length} not resolvable (computed in Slint): ${unresolved.slice(0, 8).join(", ")}${unresolved.length > 8 ? ", …" : ""}` : ""}`);
