"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Message {
  role: "user" | "yantrik";
  text: string;
  tools?: string[];
  memories?: number;
}

const conversation: Message[] = [
  {
    role: "user",
    text: "Hey, remember that my birthday is June 15th and I have a dog named Max.",
  },
  {
    role: "yantrik",
    text: "Got it! I've saved both — your birthday on June 15th and Max. How's Max doing today?",
    tools: ["remember", "remember"],
    memories: 0,
  },
  {
    role: "user",
    text: "I have a big presentation at work next Monday. I'm nervous about the revenue numbers.",
  },
  {
    role: "yantrik",
    text: "Noted. What specifically worries you — are the numbers below expectations, or is it more about how to present them?",
    tools: ["remember"],
    memories: 3,
  },
  {
    role: "user",
    text: "What color gift wrap should someone get me?",
  },
  {
    role: "yantrik",
    text: "Based on what I know about you — blue would be perfect, it's your favorite color!",
    tools: [],
    memories: 8,
  },
  {
    role: "user",
    text: "Can you set up a daily reminder to walk Max at 6pm?",
  },
  {
    role: "yantrik",
    text: "Done! Your daily 6 PM reminder to walk Max is all set. You'll get a notification every evening.",
    tools: ["create_recipe", "remember"],
    memories: 10,
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
            A real conversation from our 5-user benchmark. 98.75% accuracy.
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
              yantrik ask --json
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
                        {(msg.tools?.length || msg.memories) ? (
                          <div className="flex items-center gap-3 mt-2">
                            {msg.tools && msg.tools.length > 0 && (
                              <span className="text-xs text-zinc-600 font-mono">
                                tools: [{msg.tools.join(", ")}]
                              </span>
                            )}
                            {msg.memories !== undefined && (
                              <span className="text-xs text-zinc-600 font-mono">
                                memories: {msg.memories}
                              </span>
                            )}
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

        {/* Benchmark results */}
        <motion.div
          className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          {[
            { label: "Accuracy", value: "98.75%", sub: "39.5/40 tests" },
            { label: "Users Tested", value: "5", sub: "isolated DBs" },
            { label: "Memory Recall", value: "100%", sub: "zero cross-leak" },
            { label: "Avg Response", value: "~18s", sub: "with tool calls" },
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
