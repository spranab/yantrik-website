"use client";

import { motion } from "framer-motion";
import {
  Brain,
  MessageSquareHeart,
  Zap,
  Shield,
  Globe,
  Terminal,
  Mail,
  Calendar,
  Eye,
  Puzzle,
  HeartHandshake,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Remembers Everything",
    description:
      "Semantic memory powered by vector embeddings. Tell it once, it knows forever. Recalls context across days, weeks, months.",
    color: "from-indigo-500 to-violet-500",
  },
  {
    icon: HeartHandshake,
    title: "Bond System",
    description:
      "Your relationship evolves from Stranger to Partner-in-Crime. Personality, humor, and proactivity adapt as trust grows.",
    color: "from-rose-500 to-pink-500",
  },
  {
    icon: Sparkles,
    title: "62 Instincts",
    description:
      "Morning briefs, evening reflections, humor callbacks, deal alerts, news watch, weather warnings — proactive intelligence that feels alive.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Zap,
    title: "215+ Tools",
    description:
      "File management, browser automation, terminal, email, calendar, Git, Docker, system monitoring, home automation — all voice or text.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Eye,
    title: "Vision & Browser",
    description:
      "Headless Chromium with CDP. Takes screenshots, reads pages, clicks elements by coordinates. The AI can literally see your screen.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: Terminal,
    title: "Recipe Engine",
    description:
      "Multi-step automations with conditional logic, cron triggers, and zero LLM cost for tool-only steps. Your personal workflow engine.",
    color: "from-purple-500 to-fuchsia-500",
  },
  {
    icon: MessageSquareHeart,
    title: "Natural Communication",
    description:
      "Anti-repetition filters, synthesis gates, narrative braiding, strategic silence. It talks like a person, not a chatbot.",
    color: "from-sky-500 to-indigo-500",
  },
  {
    icon: Globe,
    title: "Context Cortex",
    description:
      "Entity graph, pulse ingestion, baseline learning, pattern mining, and periodic deep reflection. It understands your world.",
    color: "from-teal-500 to-emerald-500",
  },
  {
    icon: Mail,
    title: "Email & Calendar",
    description:
      "IMAP/SMTP built-in. Gmail, Outlook, Yahoo. AI summarizes emails, triages by importance, drafts replies. Calendar with smart scheduling.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description:
      "Task queue, persistent recipes, cron jobs. 'Remind me to check stocks every morning' becomes a real automation, not a TODO.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Puzzle,
    title: "Skill Store",
    description:
      "50 skills you can toggle on/off. Humor, News Watch, Deal Finder, Health Pulse, Philosophy Companion — like an app store for AI behaviors.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Shield,
    title: "Privacy-First",
    description:
      "Everything runs locally on your machine. SQLite database, local embeddings, optional local LLM. Your data never leaves your device.",
    color: "from-green-500 to-emerald-500",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Features() {
  return (
    <section id="features" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Not an assistant.{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              A companion.
            </span>
          </h2>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
            Every feature is designed to make the AI feel less like software and more
            like someone who genuinely knows you.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="feature-card glass rounded-2xl p-6 group"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
