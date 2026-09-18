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
  "A Rust desktop built for a mind to use. 16 apps, each publishing a graded control surface and an accessibility tree. Any mind attaches over a socket — the OS never holds its model or its keys.";

export const metadata: Metadata = {
  title: "Yantrik OS — The AI-Native Desktop",
  description,
  keywords: [
    "AI desktop",
    "AI companion",
    "smart desktop",
    "AI operating system",
    "agent operating system",
    "Yantrik",
  ],
  openGraph: {
    title: "Yantrik OS — The AI-Native Desktop",
    description,
    type: "website",
    url: "https://yantrik.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yantrik OS — The AI-Native Desktop",
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
