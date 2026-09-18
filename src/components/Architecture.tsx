"use client";

import { motion } from "framer-motion";

const layers = [
  {
    name: "Desktop Shell",
    desc: "labwc on Wayland, Slint in Rust",
    color: "border-zinc-700",
    items: ["16 native apps", "Debian trixie", "No Electron", "Window management"],
  },
  {
    name: "Control Surface",
    desc: "What a mind may do, and how far",
    color: "border-indigo-500/50",
    items: [
      "57 actions",
      "10 surfaces",
      "safe / standard / sensitive / dangerous",
      "Checked against the caller's ceiling",
    ],
  },
  {
    name: "Accessibility Trees",
    desc: "Every app, readable as structure",
    color: "border-violet-500/50",
    items: [
      "Published per app",
      "Structure, not pixels",
      "Read before acting",
      "Same tree for every mind",
    ],
  },
  {
    name: "Mind Socket",
    desc: "Bring your own mind, and its model",
    color: "border-emerald-500/50",
    items: [
      "attach / detach",
      "poll / chunk",
      "complete / fail",
      "One local memory server",
    ],
  },
];

export default function Architecture() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Built{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              differently
            </span>
          </h2>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
            Not a chatbot bolted onto a desktop. The shell <em>is</em> the
            desktop, and every layer under it is something a mind can call.
          </p>
        </motion.div>

        {/* Stack diagram */}
        <div className="space-y-4">
          {layers.map((layer, i) => (
            <motion.div
              key={layer.name}
              className={`glass rounded-2xl p-6 border-l-4 ${layer.color}`}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {layer.name}
                  </h3>
                  <p className="text-sm text-zinc-500">{layer.desc}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {layer.items.map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1 rounded-full text-xs bg-white/5 text-zinc-400 border border-white/5"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tech stack badges */}
        <motion.div
          className="mt-16 flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          {[
            "Rust",
            "Slint",
            "Wayland",
            "labwc",
            "Debian trixie",
            "Socket protocol",
            "ISO install",
            "yantrik-update",
          ].map((tech) => (
            <span
              key={tech}
              className="px-4 py-2 rounded-lg text-sm font-mono text-zinc-500 bg-white/[0.03] border border-white/5"
            >
              {tech}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
