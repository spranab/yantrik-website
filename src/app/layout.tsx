import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const description =
  "A Rust desktop built for a mind to use. 14 apps, each publishing a graded control surface and an accessibility tree. Any mind attaches over a socket — the OS never holds its model or its keys.";

const title = "Yantrik OS — The AI-Native Desktop";

export const metadata: Metadata = {
  // Without this, every relative URL Next resolves for og:image and twitter:image is left
  // relative — and a relative og:image is no og:image at all: Slack, Discord, X and
  // LinkedIn all drop it. This is why the site has been unfurling as a grey box.
  metadataBase: new URL("https://www.yantrikos.com"),
  title,
  description,
  keywords: [
    "AI desktop",
    "AI companion",
    "smart desktop",
    "AI operating system",
    "agent operating system",
    "Yantrik",
  ],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
