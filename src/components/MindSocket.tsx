"use client";

import { motion } from "framer-motion";
import { Cable, KeyRound, Users, ToggleRight } from "lucide-react";

const rows = [
  {
    icon: Cable,
    title: "Six methods, one socket",
    description:
      "attach, poll, chunk, complete, fail, detach. A harness dials in, takes turns at the desk, and hangs up. There is nothing else to implement.",
  },
  {
    icon: KeyRound,
    title: "The OS holds nothing",
    description:
      "No model, no endpoint, no API key on this side of the socket. The mind brings its own, local or remote, and the OS never learns what it is.",
  },
  {
    icon: Users,
    title: "Two minds today",
    description:
      "Yantrik Mind ships with the OS. Hermes Agent attaches through a plugin. Both drive the same apps through the same graded control surface.",
  },
  {
    icon: ToggleRight,
    title: "Switching is a setting",
    description:
      "Hand the desk to a different mind without reinstalling anything. They share one local memory server, so the machine keeps what it knows.",
  },
];

export default function MindSocket() {
  return (
    <section id="minds" className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            The OS holds the desk.{" "}
            <span className="bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              You bring the mind.
            </span>
          </h2>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
            No mind is welded in. A harness dials in over a socket and starts
            taking turns. The OS owns which mind you are talking to — and nothing
            else about it.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rows.map((row, i) => (
            <motion.div
              key={row.title}
              className="feature-card glass rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-fuchsia-500 to-indigo-500 flex items-center justify-center">
                  <row.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {row.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {row.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
