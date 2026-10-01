// Development only: the live stream for the local preview.
//
// On yantrikos.com the browser reads /live/hls/ from the same origin and nginx passes it to the
// relay. The relay answers a first request with a redirect to a cookie check on its own host, and
// the cookie is Secure, so a browser on http://localhost can never complete it: every live pill in
// the local preview read "offline" with the stream plainly up. This holds the relay's cookies on
// the server side, follows that redirect itself, and hands the browser the playlist and segments.
// next.config.ts points /live/hls/ here in development; the published site never uses it.
import http from "node:http";

const UPSTREAM = "https://yantrikos.com";
const PORT = Number(process.env.LIVE_PROXY_PORT || 3299);
const jar = new Map();

const cookieHeader = () => [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
function keep(res) {
  for (const line of res.headers.getSetCookie?.() ?? []) {
    const [pair] = line.split(";");
    const at = pair.indexOf("=");
    if (at > 0) jar.set(pair.slice(0, at).trim(), pair.slice(at + 1).trim());
  }
}

async function fetchFollowing(url) {
  for (let hop = 0; hop < 4; hop++) {
    const res = await fetch(url, { redirect: "manual", headers: { cookie: cookieHeader() } });
    keep(res);
    const to = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && to) {
      url = new URL(to, url).toString();
      continue;
    }
    return res;
  }
  throw new Error("too many redirects from the relay");
}

http
  .createServer(async (req, res) => {
    if (!req.url.startsWith("/live/hls/")) {
      res.writeHead(404).end();
      return;
    }
    try {
      const up = await fetchFollowing(UPSTREAM + req.url);
      const body = Buffer.from(await up.arrayBuffer());
      res.writeHead(up.status, {
        "content-type": up.headers.get("content-type") || "application/octet-stream",
        "cache-control": "no-store",
      });
      res.end(body);
    } catch (e) {
      res.writeHead(502, { "content-type": "text/plain" }).end(`relay unreachable: ${e.message}\n`);
    }
  })
  .listen(PORT, "127.0.0.1", () => console.log(`live proxy for the dev server on http://127.0.0.1:${PORT}`));
