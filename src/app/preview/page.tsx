import type { Metadata } from "next";
import Hero from "@/components/hero/Hero";

export const metadata: Metadata = {
  title: "Hero replay preview",
  description: "Review page for the homepage hero's replay of a recorded session. Not indexed.",
  robots: { index: false, follow: false },
};

export default function Preview() {
  return (
    <main id="main" style={{ maxWidth: 1328, margin: "0 auto", padding: "32px 16px 64px" }}>
      <Hero />
    </main>
  );
}
