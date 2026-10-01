// The visitor's theme, set before the first paint. One file for the whole site: src/app/layout.tsx
// inlines it in <head>, and scripts/sync-live.mjs copies it to public/live/theme.js, which /live
// loads as a blocking script (its CSP allows no inline script).
//
// The choice is System, Light or Dark. System leaves <html> without `data-theme`, so tokens.css
// follows `prefers-color-scheme`; Light and Dark set `data-theme`. `data-theme-choice` always
// names the choice, for the toggle's label (src/theme/theme.css). Every [data-theme-toggle] on the
// page cycles System → Light → Dark. The choice is kept in localStorage when the browser allows it,
// and held for the page alone when it does not.
(function () {
  var KEY = "yantrik-theme";
  var ORDER = ["system", "light", "dark"];
  var root = document.documentElement;
  var choice = "system";
  var known = function (v) {
    return v === "light" || v === "dark" ? v : "system";
  };
  try {
    choice = known(window.localStorage.getItem(KEY));
  } catch {}

  function apply(c) {
    choice = c;
    if (c === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", c);
    root.setAttribute("data-theme-choice", c);
  }
  apply(choice);

  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target.closest("[data-theme-toggle]") : null;
    if (!t) return;
    var next = ORDER[(ORDER.indexOf(choice) + 1) % ORDER.length];
    apply(next);
    try {
      if (next === "system") window.localStorage.removeItem(KEY);
      else window.localStorage.setItem(KEY, next);
    } catch {}
  });
  // Another tab changed it.
  window.addEventListener("storage", function (e) {
    if (e.key === KEY) apply(known(e.newValue));
  });
})();
