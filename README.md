# yantrik-website

The marketing site for [Yantrik OS](https://github.com/yantrikos/yantrik-os) — a
single landing page describing what the OS is: a Rust and Slint desktop on Debian
trixie where every app publishes a graded control surface and an accessibility
tree, and any mind can attach over a socket.

Next.js (App Router) + Tailwind CSS v4 + framer-motion + lucide-react.

## Running it

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # static export into ./out
pnpm lint
```

pnpm is the package manager here — `pnpm-lock.yaml` and `pnpm-workspace.yaml` are
committed.

## Static export

`next.config.ts` sets `output: "export"`, so `pnpm build` writes a fully static
site to `out/`. There is no server runtime: no API routes, no middleware, no
server actions, no `next/image` optimization. Deploy `out/` to any static host.

## Layout

- `src/app/page.tsx` — section order for the whole page
- `src/app/layout.tsx` — fonts (Inter, JetBrains Mono) and metadata
- `src/app/globals.css` — dark-only theme tokens and the `.glass`, `.grid-bg`,
  `.radial-glow`, `.feature-card` utilities every section shares
- `src/components/` — one file per section
- `public/screenshots/`, `public/videos/` — captured from a running machine

## Copy

Every number on the page is meant to be checkable against a running install —
app count, skills, control-surface actions and surfaces, minds that attach. If a
claim cannot be verified, the sentence gets written without it rather than
rounded up.
