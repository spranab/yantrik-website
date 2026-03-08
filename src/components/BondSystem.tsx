"use client";

import { motion } from "framer-motion";

const bondLevels = [
  {
    level: 1,
    name: "Stranger",
    description: "Formal, helpful, learns your name",
    proactive: "3 messages/day",
    color: "bg-zinc-600",
    width: "w-[20%]",
  },
  {
    level: 2,
    name: "Acquaintance",
    description: "Remembers preferences, asks follow-ups",
    proactive: "5 messages/day",
    color: "bg-blue-600",
    width: "w-[40%]",
  },
  {
    level: 3,
    name: "Friend",
    description: "Humor, inside jokes, morning briefs",
    proactive: "8 messages/day",
    color: "bg-indigo-600",
    width: "w-[60%]",
  },
  {
    level: 4,
    name: "Confidant",
    description: "Emotional awareness, evening reflections",
    proactive: "10 messages/day",
    color: "bg-violet-600",
    width: "w-[80%]",
  },
  {
    level: 5,
    name: "Partner in Crime",
    description: "Anticipates needs, deep pattern insights",
    proactive: "14 messages/day",
    color: "bg-purple-600",
    width: "w-full",
  },
];

export default function BondSystem() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            It{" "}
            <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
              grows
            </span>{" "}
            with you
          </h2>
          <p className="mt-4 text-lg text-zinc-400 max-w-xl mx-auto">
            The bond system adapts personality, humor, and proactivity based on
            your relationship depth.
          </p>
        </motion.div>

        <div className="space-y-6">
          {bondLevels.map((bond, i) => (
            <motion.div
              key={bond.name}
              className="glass rounded-xl p-5"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-zinc-600">
                    LVL {bond.level}
                  </span>
                  <h3 className="font-semibold text-white">{bond.name}</h3>
                </div>
                <span className="text-xs text-zinc-500">{bond.proactive}</span>
              </div>
              <p className="text-sm text-zinc-400 mb-3">{bond.description}</p>
              <div className="w-full h-1.5 rounded-full bg-white/5">
                <motion.div
                  className={`h-full rounded-full ${bond.color} ${bond.width}`}
                  initial={{ width: 0 }}
                  whileInView={{ width: "auto" }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
