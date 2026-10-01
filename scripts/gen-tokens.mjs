// The site's design tokens, generated from the OS's own theme, so the website cannot drift from the
// desktop it shows. Reads yantrik-os/crates/yantrik-design-tokens/slint/theme.slint, resolves every
// `out property` of the Theme and AccentPreset globals to its DARK value (the accent at the default
// teal preset), and writes src/os/tokens.css as `--y-<name>` custom properties.
//
// Fails (non-zero) if a token the site uses has gone from the OS: REQUIRED below.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const osRepo = resolve(process.env.YANTRIK_OS ?? "../yantrik-os");
const themePath = resolve(osRepo, "crates/yantrik-design-tokens/slint/theme.slint");
const out = new URL("../src/os/tokens.css", import.meta.url);
const src = readFileSync(themePath, "utf8").replace(/\/\/[^\n]*/g, "");

// Every `out property <type> name: expr;` in a global block, by global name.
function globals(text) {
  const found = {};
  const re = /export\s+global\s+(\w+)\s*\{/g;
  let m;
  while ((m = re.exec(text))) {
    let depth = 0, i = re.lastIndex - 1, start = i;
    for (; i < text.length; i++) {
      if (text[i] === "{") depth++;
      else if (text[i] === "}" && --depth === 0) break;
    }
    const body = text.slice(start + 1, i);
    const props = {};
    const pre = /(?:in-)?out\s+property\s*<\s*(\w+)\s*>\s+([\w-]+)\s*:\s*([^;]+);/g;
    let p;
    while ((p = pre.exec(body))) props[p[2]] = { type: p[1], expr: p[3].replace(/\s+/g, " ").trim() };
    found[m[1]] = props;
  }
  return found;
}

const all = globals(src);
const theme = all.Theme ?? {};
const accent = all.AccentPreset ?? {};

function darkOf(expr, scope, seen = new Set()) {
  // A conditional on dark mode: the first branch is the dark value.
  const dark = expr.match(/ThemeMode\.dark\s*\?\s*(#[0-9a-fA-F]{3,8}|[\d.]+(?:px|ms)?)/);
  if (dark) return dark[1];
  // Accent presets: index 0 (teal), dark.
  const preset = expr.match(/index\s*==\s*0\s*\?\s*\(\s*ThemeMode\.dark\s*\?\s*(#[0-9a-fA-F]{3,8})/);
  if (preset) return preset[1];
  const ref = expr.match(/^(?:root|Theme|AccentPreset)\.([\w-]+)$/);
  if (ref) {
    const name = ref[1];
    if (seen.has(name)) return null;
    seen.add(name);
    const target = expr.startsWith("AccentPreset") ? accent[name] : scope[name] ?? accent[name];
    return target ? darkOf(target.expr, scope, seen) : null;
  }
  const plain = expr.match(/^(#[0-9a-fA-F]{3,8}|-?[\d.]+(?:px|ms|%)?|true|false)$/);
  return plain ? plain[1] : null;
}

const vars = [];
const unresolved = [];
for (const [name, { type, expr }] of Object.entries({ ...accent, ...theme })) {
  if (!["color", "length", "duration", "int", "float"].includes(type)) continue;
  const v = darkOf(expr, theme);
  if (v == null) unresolved.push(name);
  else vars.push([name, type === "int" || type === "float" ? v.replace(/px$/, "") : v]);
}

// ── Every app its own colour: crates/yantrik-ui-kit/slint/app_color.slint ──
//
// The AppColor global's glyph tones (dark) and solid tile fills, as `--y-app-<name>`, and its
// `hue-for-app` table as src/os/app-identity.ts, so a tile in the replica wears exactly the colour
// the launcher and the taskbar give that app.
const appColorPath = resolve(osRepo, "crates/yantrik-ui-kit/slint/app_color.slint");
const appColorSrc = readFileSync(appColorPath, "utf8");
const appColor = globals(appColorSrc.replace(/\/\/[^\n]*/g, "")).AppColor ?? {};
for (const [name, { type, expr }] of Object.entries(appColor)) {
  if (type !== "color") continue;
  const v = darkOf(expr, appColor);
  if (v == null) unresolved.push(`app-${name}`);
  else vars.push([`app-${name}`, v]);
}
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

const css =
  `/* Generated by scripts/gen-tokens.mjs from yantrik-os ${themePath.split(/[\\/]/).slice(-4).join("/")},\n` +
  `   crates/yantrik-ui-kit/slint/app_color.slint (--y-app-*) and config/labwc/themerc + rc.xml (--y-labwc-*).\n` +
  `   Dark values; accent at the default teal preset. Do not edit: change the OS, then regenerate. */\n` +
  `:root {\n` +
  vars.map(([n, v]) => `  --y-${n}: ${v};`).join("\n") +
  `\n}\n`;
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
console.log(`tokens: ${vars.length} written, ${Object.keys(hues).length} app hues${unresolved.length ? `, ${unresolved.length} not resolvable (computed in Slint): ${unresolved.slice(0, 8).join(", ")}${unresolved.length > 8 ? ", …" : ""}` : ""}`);
