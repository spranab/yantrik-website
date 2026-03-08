import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yantrik OS — The AI-Native Desktop",
  description:
    "Your desktop, reimagined. An AI companion that remembers everything, anticipates your needs, and evolves with you. Not an assistant — a partner.",
  keywords: [
    "AI desktop",
    "AI companion",
    "smart desktop",
    "AI operating system",
    "personal AI",
    "Yantrik",
  ],
  openGraph: {
    title: "Yantrik OS — The AI-Native Desktop",
    description:
      "Your desktop, reimagined. An AI companion that remembers, anticipates, and evolves with you.",
    type: "website",
    url: "https://yantrik.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yantrik OS — The AI-Native Desktop",
    description:
      "Your desktop, reimagined. An AI companion that remembers, anticipates, and evolves with you.",
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
