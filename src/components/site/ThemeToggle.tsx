/**
 * The theme toggle: System → Light → Dark. No state of its own: src/theme/theme-boot.js handles the
 * click (for every [data-theme-toggle] on the page) and sets `data-theme-choice` on <html>, and
 * src/theme/theme.css shows the label that matches it, so the label is right on the first paint
 * rather than after hydration. Its accessible name is "Theme: " and the current choice.
 * /live carries the same markup in public/live/index.html.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  return (
    <button type="button" className={`y-theme ${className}`.trim()} data-theme-toggle="">
      <span className="y-theme-mark" aria-hidden="true" />
      <span className="y-theme-k">Theme: </span>
      <span data-theme-label="system">System</span>
      <span data-theme-label="light">Light</span>
      <span data-theme-label="dark">Dark</span>
    </button>
  );
}
