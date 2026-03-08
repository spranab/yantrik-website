import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import ConversationDemo from "@/components/ConversationDemo";
import Architecture from "@/components/Architecture";
import BondSystem from "@/components/BondSystem";
import SkillStore from "@/components/SkillStore";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Features />
      <div id="demo">
        <ConversationDemo />
      </div>
      <BondSystem />
      <SkillStore />
      <Architecture />
      <Footer />
    </main>
  );
}
