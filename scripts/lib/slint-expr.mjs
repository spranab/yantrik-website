// A Slint theme, read and evaluated: enough of Slint's expression language for the OS's globals
// (theme.slint, app_color.slint), so the site can take every value the OS defines rather than
// pattern-match the first one it sees.
//
// Understood: literals (#hex, 12px, 200ms, 8%, true, "text"), property references (`root.x`,
// `Theme.x`, a bare `x` in the same global), `== != && || !`, parentheses, the conditional
// `c ? a : b`, and a colour's `.darker(f)` / `.brighter(f)`. Anything else throws, and the caller
// reports the token as not resolvable rather than guessing.

/** Every `[in-]out property <type> name: expr;` in each `export global` block, by global name. */
export function globals(text) {
  const found = {};
  const re = /export\s+global\s+(\w+)\s*\{/g;
  let m;
  while ((m = re.exec(text))) {
    let depth = 0, i = re.lastIndex - 1;
    const start = i;
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

/** Slint source without its line comments. */
export const stripComments = (text) => text.replace(/\/\/[^\n]*/g, "");

const TOKEN = /\s*(#[0-9a-fA-F]{3,8}|-?\d+(?:\.\d+)?(?:px|ms|pt|%)?|"[^"]*"|==|!=|&&|\|\||[?:()!,]|[A-Za-z_][\w-]*(?:\.[A-Za-z_][\w-]*)*)/y;

function tokenize(expr) {
  const toks = [];
  TOKEN.lastIndex = 0;
  while (TOKEN.lastIndex < expr.length) {
    const at = TOKEN.lastIndex;
    const m = TOKEN.exec(expr);
    if (!m) {
      if (/^\s*$/.test(expr.slice(at))) break;
      throw new Error(`cannot read "${expr.slice(at)}"`);
    }
    toks.push(m[1]);
  }
  return toks;
}

function rgba(c) {
  let h = c.slice(1);
  if (h.length <= 4) h = [...h].map((x) => x + x).join("");
  if (h.length === 6) h += "ff";
  return [0, 2, 4, 6].map((i) => parseInt(h.slice(i, i + 2), 16));
}

/**
 * i-slint-core graphics/color.rs: `darker(f)` divides the HSV value by (1 + f), `brighter(f)`
 * multiplies it by (1 + f), clamped; each channel is then quantized as round(x · 255). Scaling V
 * with H and S held is scaling R, G and B by the same factor.
 */
function scaleValue(c, k) {
  const [r, g, b, a] = rgba(c).map((x) => x / 255);
  const v = Math.max(r, g, b);
  const f = v === 0 ? 0 : Math.min(v * k, 1) / v;
  const out = [r * f, g * f, b * f, a].map((x) => Math.round(x * 255));
  return "#" + out.slice(0, out[3] === 255 ? 3 : 4).map((x) => x.toString(16).padStart(2, "0")).join("");
}

/**
 * Evaluates `expr` as written in global `scope`, with `env.dark` standing in for ThemeMode.dark.
 * Returns `{ value, usesMode }`: `usesMode` says whether ThemeMode was read on the way, in either
 * arm of any conditional, so a token that never asks is known to be the same in both modes.
 */
export function evaluate(all, expr, scope, env, seen = new Set()) {
  const toks = tokenize(expr);
  let i = 0;
  let usesMode = false;
  const peek = () => toks[i];
  const take = (t) => {
    if (i >= toks.length) throw new Error(`"${expr}" ends early`);
    if (t && toks[i] !== t) throw new Error(`expected ${t} in "${expr}"`);
    return toks[i++];
  };
  const lookup = (name) => {
    if (name === "ThemeMode.dark") {
      usesMode = true;
      return env.dark;
    }
    const dot = name.indexOf(".");
    let g = scope, prop = name;
    if (dot > 0) {
      const head = name.slice(0, dot);
      if (head === "root") prop = name.slice(dot + 1);
      else if (all[head]) [g, prop] = [head, name.slice(dot + 1)];
    }
    const target = all[g]?.[prop];
    if (!target) throw new Error(`unknown ${name}`);
    const key = `${g}.${prop}`;
    if (seen.has(key)) throw new Error(`cycle at ${key}`);
    const r = evaluate(all, target.expr, g, env, new Set([...seen, key]));
    if (r.usesMode) usesMode = true;
    return r.value;
  };
  const num = (x) => (typeof x === "string" && /^-?\d/.test(x) ? parseFloat(x) : x);

  function primary() {
    const t = take();
    if (t === "(") {
      const v = ternary();
      take(")");
      return v;
    }
    if (t === "!") return !primary();
    if (t[0] === "#" || /^-?\d/.test(t)) return t;
    if (t[0] === '"') return t.slice(1, -1);
    if (t === "true" || t === "false") return t === "true";
    const method = t.match(/^(.*)\.(darker|brighter)$/);
    if (method && peek() === "(") {
      take("(");
      const arg = take();
      take(")");
      const f = arg.endsWith("%") ? parseFloat(arg) / 100 : parseFloat(arg);
      const base = lookup(method[1]);
      if (typeof base !== "string" || base[0] !== "#") throw new Error(`${method[2]} of a non-colour`);
      return scaleValue(base, method[2] === "darker" ? 1 / (1 + f) : 1 + f);
    }
    return lookup(t);
  }
  function equality() {
    const a = primary();
    if (peek() !== "==" && peek() !== "!=") return a;
    const op = take();
    const b = primary();
    return op === "==" ? num(a) === num(b) : num(a) !== num(b);
  }
  function and() {
    let a = equality();
    while (peek() === "&&") {
      take();
      const b = equality();
      a = a && b;
    }
    return a;
  }
  function or() {
    let a = and();
    while (peek() === "||") {
      take();
      const b = and();
      a = a || b;
    }
    return a;
  }
  // Both arms are evaluated, so a ThemeMode read in the arm not taken still counts.
  function ternary() {
    const c = or();
    if (peek() !== "?") return c;
    take("?");
    const a = ternary();
    take(":");
    const b = ternary();
    return c ? a : b;
  }

  const value = ternary();
  if (i !== toks.length) throw new Error(`unread "${toks.slice(i).join(" ")}" in "${expr}"`);
  return { value, usesMode };
}
