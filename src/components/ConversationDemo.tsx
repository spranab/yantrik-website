"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Message {
  role: "user" | "yantrik";
  text: string;
  surface?: string;
  grade?: string;
  outcome?: string;
}

const conversation: Message[] = [
  {
    role: "user",
    text: "Open the notes file I was in last night.",
  },
  {
    role: "yantrik",
    text: "It's up in the editor. You left off partway through the third section.",
    surface: "files",
    grade: "standard",
    outcome: "allowed",
  },
  {
    role: "user",
    text: "What did we settle on for the compositor?",
  },
  {
    role: "yantrik",
    text: "Two weeks ago you decided labwc stays, and nothing gets swapped before the ISO is cut.",
    surface: "memory",
    grade: "safe",
    outcome: "allowed",
  },
  {
    role: "user",
    text: "Wipe the build directory and start clean.",
  },
  {
    role: "yantrik",
    text: "That one is graded dangerous, and my ceiling stops short of it. Raise the ceiling and I'll run it.",
    surface: "files",
    grade: "dangerous",
    outcome: "refused at the ceiling",
  },
  {
    role: "user",
    text: "Raised. Go ahead.",
  },
  {
    role: "yantrik",
    text: "Cleared. The build directory is empty and the terminal is waiting on the next run.",
    surface: "terminal",
    grade: "dangerous",
    outcome: "allowed",
  },
];

export default function ConversationDemo() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount < conversation.length) {
      const timeout = setTimeout(
        () => setVisibleCount((c) => c + 1),
        visibleCount === 0 ? 500 : 1200
      );
      return () => clearTimeout(timeout);
    }
  }, [visibleCount]);

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
            See it{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              in action
            </span>
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            A mind at the desk, calling real apps — and running into the ceiling
            when it reaches for something dangerous.
          </p>
        </motion.div>

        {/* Terminal-style conversation */}
        <motion.div
          className="glass rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-3 text-xs text-zinc-500 font-mono">
              mind attached — control surface
            </span>
          </div>

          {/* Messages */}
          <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
            {conversation.slice(0, visibleCount).map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                {msg.role === "user" ? (
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-emerald-500 font-mono mt-1 shrink-0">
                      you &gt;
                    </span>
                    <p className="text-zinc-300 text-sm">{msg.text}</p>
                  </div>
                ) : (
                  <div className="ml-0 mt-1">
                    <div className="flex items-start gap-3">
                      <span className="text-xs text-indigo-400 font-mono mt-1 shrink-0">
                        ai &nbsp;&gt;
                      </span>
                      <div>
                        <p className="text-zinc-200 text-sm">{msg.text}</p>
                        {msg.surface ? (
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            <span className="text-xs text-zinc-600 font-mono">
                              surface: {msg.surface}
                            </span>
                            <span className="text-xs text-zinc-600 font-mono">
                              grade: {msg.grade}
                            </span>
                            <span
                              className={`text-xs font-mono ${
                                msg.outcome === "allowed"
                                  ? "text-emerald-600"
                                  : "text-amber-600"
                              }`}
                            >
                              {msg.outcome}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {visibleCount < conversation.length && (
              <div className="flex items-center gap-2 text-zinc-600">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* What the control surface actually is */}
        <motion.div
          className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          {[
            { label: "Actions", value: "57", sub: "callable by a mind" },
            { label: "Surfaces", value: "10", sub: "apps and services" },
            { label: "Grades", value: "4", sub: "safe → dangerous" },
            { label: "Minds", value: "2", sub: "attach today" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-xl p-4 text-center"
            >
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-zinc-500 mt-1">{stat.label}</div>
              <div className="text-xs text-zinc-600">{stat.sub}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
