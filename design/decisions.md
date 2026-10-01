# Decisions for the redesign (1 Oct 2026)

Taken so the build is not held up; each can be revisited.

- **/live** moves into this repo as a framework-free page (`public/live/`), with its strict CSP unchanged and hls.js self-hosted. nginx keeps its `location ^~ /live/` alias. (plan §4.1, option A)
- **Claude Code and Codex** are shown as accounts in the Minds panel, never as minds that attach. Only five minds attach today. (claim C-07)
- **Analytics**: the Umami tag moves off `u.warpmode.io` to a yantrikos.com name before the analytics branch merges.
- **Counts** (apps, surfaces, actions) are generated from each release build. No number on the site is typed by hand.
- **Recording**: the hero's session is recorded on the live VM 561, which holds no personal data, never on 520. Pranab allowed the Allow branch's approval to be pressed by Claude with a pointer click, this one time only (1 Oct 2026).
- **Preview** goes to yantrikos.com/preview/ with `noindex`, before anything replaces the live site.
