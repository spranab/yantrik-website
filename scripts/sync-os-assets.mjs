// Assets the site takes from the OS itself, copied at build so they are the same files the desktop
// ships: the fonts (Barlow, JetBrains Mono, OFL) and the mark. Nothing here is drawn or chosen by
// the site.

import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const os = resolve(process.env.YANTRIK_OS ?? "../yantrik-os");
const copies = [
  ["crates/yantrik-design-tokens/slint/fonts/Barlow-Regular.ttf", "src/fonts/Barlow-Regular.ttf"],
  ["crates/yantrik-design-tokens/slint/fonts/Barlow-Medium.ttf", "src/fonts/Barlow-Medium.ttf"],
  ["crates/yantrik-design-tokens/slint/fonts/Barlow-SemiBold.ttf", "src/fonts/Barlow-SemiBold.ttf"],
  ["crates/yantrik-design-tokens/slint/fonts/JetBrainsMono-Regular.ttf", "src/fonts/JetBrainsMono-Regular.ttf"],
  ["crates/yantrik-design-tokens/slint/fonts/JetBrainsMono-Medium.ttf", "src/fonts/JetBrainsMono-Medium.ttf"],
  ["brand/yantrik-mark.svg", "public/brand/yantrik-mark.svg"],
  // The desktop replica (src/os): the default wallpaper preset (app_context.rs sets "serenity"),
  // the titlebar buttons labwc draws from the theme directory (scripts/render-window-buttons.py,
  // installed by yantrik-session), and the picture Mind View shows while it is empty.
  ["crates/yantrik-ui-slint/ui/wallpapers/serenity.png", "public/os/wallpapers/serenity.png"],
  ["config/labwc-mind/empty.png", "public/os/labwc-mind/empty.png"],
  ...["iconify", "max", "max_toggled", "close"].flatMap((b) =>
    ["active", "inactive"].map((s) => [`config/labwc/${b}-${s}.png`, `public/os/labwc/${b}-${s}.png`]),
  ),
];

let missing = 0;
for (const [from, to] of copies) {
  const src = resolve(os, from);
  if (!existsSync(src)) {
    console.error(`os-assets: ${from} is not in the OS checkout at ${os}`);
    missing++;
    continue;
  }
  mkdirSync(resolve(to, ".."), { recursive: true });
  copyFileSync(src, resolve(to));
}
if (missing) process.exit(1);
console.log(`os-assets: ${copies.length} files from the OS`);
