import type { NextConfig } from "next";

const dev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // The published site is a static export; the dev server is not, so it can pass the live
  // stream through.
  ...(dev ? {} : { output: "export" as const }),
  // In development only: /live/hls/ is the relay's, proxied by nginx on yantrikos.com (see
  // design/redesign-plan-2026-10-01.md, /live). Without this the local preview has no stream and
  // every live pill reads offline. Production has no rewrites; nginx serves the same path.
  ...(dev
    ? {
        async rewrites() {
          // Through scripts/dev-live-proxy.mjs (`npm run dev` starts it), which completes the
          // relay's cookie check that a browser on http://localhost cannot.
          const port = process.env.LIVE_PROXY_PORT || "3299";
          return [
            { source: "/live/hls/:path*", destination: `http://127.0.0.1:${port}/live/hls/:path*` },
            // nginx serves public/live/index.html for /live/; the dev server serves files by name.
            { source: "/live", destination: "/live/index.html" },
          ];
        },
      }
    : {}),
};

export default nextConfig;
