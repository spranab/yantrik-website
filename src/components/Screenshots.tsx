"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const screenshots = [
  {
    src: "/screenshots/desktop.png",
    title: "Desktop",
    description: "The ask bar, your workspace, and the mind that is attached — Hermes Agent here — within reach",
  },
  {
    src: "/screenshots/lens.png",
    title: "The Lens",
    description: "Ctrl K from the desktop, Super K from anywhere: open an app, ask the mind, or search the machine's memory in one field",
  },
  {
    src: "/screenshots/launcher.png",
    title: "Launcher",
    description: "Every app and system panel in one searchable grid, by category",
  },
  {
    src: "/screenshots/notes.png",
    title: "Notes",
    description: "Markdown notes stored as files on the device — and the app the film's checklist was written into, through its control surface",
  },
  {
    src: "/screenshots/email.png",
    title: "Email",
    description: "IMAP and SMTP with any provider, threads, attachments, and a Summarize that hands the thread to the attached mind (sample mailbox)",
  },
  {
    src: "/screenshots/calendar.png",
    title: "Calendar",
    description: "Month, week and day. One calendar on the machine: the app and the mind read and write the same events",
  },
  {
    src: "/screenshots/files.png",
    title: "Files",
    description: "Places, breadcrumbs, preview and a trash you can undo — every action also available to the mind, graded by risk",
  },
  {
    src: "/screenshots/terminal.png",
    title: "Terminal",
    description: "Tabs and a real shell. The mind can run a command here only as far as the machine's permission ceiling allows",
  },
  {
    src: "/screenshots/editor.png",
    title: "Editor",
    description: "Tabs, find and replace, draft recovery after a crash",
  },
  {
    src: "/screenshots/sysmonitor.png",
    title: "System Monitor",
    description: "CPU, memory, disk and network from the monitor service — and it says so when it is reading the machine directly instead",
  },
  {
    src: "/screenshots/network.png",
    title: "Network",
    description: "What the machine actually has: this one has Ethernet, no Wi-Fi adapter and no firewall tool, and says exactly that",
  },
  {
    src: "/screenshots/settings.png",
    title: "Settings",
    description: "Appearance, AI and harnesses, privacy, accounts — preferences save as you change them",
  },
];

export default function Screenshots() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + screenshots.length) % screenshots.length);
  const next = () => setCurrent((c) => (c + 1) % screenshots.length);

  return (
    <section className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Built-in{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              everything
            </span>
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            A full desktop environment with 14 native apps. No Electron. Rust + Slint on Debian trixie.
          </p>
        </motion.div>

        {/* Screenshot carousel */}
        <div className="relative">
          <div className="glass rounded-2xl overflow-hidden">
            {/* Screenshot display */}
            <div className="relative aspect-[16/10] bg-black">
              <AnimatePresence mode="wait">
                <motion.img
                  key={current}
                  src={screenshots[current].src}
                  alt={screenshots[current].title}
                  className="w-full h-full object-contain"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
            </div>

            {/* Caption */}
            <div className="p-6 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {screenshots[current].title}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    {screenshots[current].description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={prev}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-zinc-400" />
                  </button>
                  <span className="text-sm text-zinc-500 font-mono min-w-[4ch] text-center">
                    {current + 1}/{screenshots.length}
                  </span>
                  <button
                    onClick={next}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-zinc-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Thumbnail strip */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {screenshots.map((ss, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`shrink-0 w-24 h-[3.75rem] rounded-lg overflow-hidden border-2 transition-all ${
                  i === current
                    ? "border-indigo-500 opacity-100"
                    : "border-transparent opacity-50 hover:opacity-75"
                }`}
              >
                <img
                  src={ss.src}
                  alt={ss.title}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
