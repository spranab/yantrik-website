import type { Metadata } from "next";
import localFont from "next/font/local";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import "./globals.css";

// Sets the visitor's theme on <html> before the first paint (src/theme/theme-boot.js, the same file
// /live loads). Read at build: the site is a static export, so this is inlined into every page.
const themeBoot = readFileSync(join(process.cwd(), "src/theme/theme-boot.js"), "utf8");

// The OS's own typefaces, copied from yantrik-os at build (scripts/sync-os-assets.mjs): Barlow for
// everything a person reads, JetBrains Mono for everything a machine said.
const barlow = localFont({
  variable: "--font-barlow",
  display: "swap",
  src: [
    { path: "../fonts/Barlow-Regular.ttf", weight: "400" },
    { path: "../fonts/Barlow-Medium.ttf", weight: "500" },
    { path: "../fonts/Barlow-SemiBold.ttf", weight: "600" },
  ],
});

const mono = localFont({
  variable: "--font-jetbrains-mono",
  display: "block",
  src: [
    { path: "../fonts/JetBrainsMono-Regular.ttf", weight: "400" },
    { path: "../fonts/JetBrainsMono-Medium.ttf", weight: "500" },
  ],
});

const description =
  "A Linux desktop built so AI agents can work beside you, safely. Every app publishes what it holds and what it can be asked to do, and a permission gate decides what runs without asking.";

const title = "Yantrik OS: a desktop a mind can use";

export const metadata: Metadata = {
  // Without this, every relative URL Next resolves for og:image and twitter:image is left
  // relative — and a relative og:image is no og:image at all: Slack, Discord, X and
  // LinkedIn all drop it. This is why the site has been unfurling as a grey box.
  metadataBase: new URL("https://www.yantrikos.com"),
  title,
  description,
  keywords: ["Yantrik OS", "Linux desktop", "AI agents", "agent operating system", "Debian", "Wayland", "Rust", "Slint"],
  // There is deliberately no `icons` block and no `openGraph.images` / `twitter.images`
  // here. Next's app-router file conventions fill both in, from files that ARE the brand
  // rather than a second list of paths that can drift from it:
  //
  //   src/app/icon.svg             → <link rel="icon">        (brand/yantrik-mark.svg)
  //   src/app/favicon.ico          → <link rel="icon">        (brand/yantrik-mark.ico, 16/32/48)
  //   src/app/apple-icon.png       → <link rel="apple-touch-icon">
  //   src/app/opengraph-image.png  → og:image, 1200x630, absolute via metadataBase
  //   src/app/twitter-image.png    → twitter:image
  //
  // Metadata files outrank the metadata object in Next, so a hand-written `icons` block
  // here would either be ignored or duplicate every tag. Change the picture by replacing
  // the file, not by adding a field.
  openGraph: {
    title,
    description,
    type: "website",
    url: "https://www.yantrikos.com",
    siteName: "Yantrik OS",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // The boot script adds data-theme and data-theme-choice before React hydrates.
    <html lang="en" className={`${barlow.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to the content
        </a>
        {children}
      </body>
    </html>
  );
}
