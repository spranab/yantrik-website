"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const screenshots = [
  {
    src: "/screenshots/desktop_greeting.png",
    title: "Desktop",
    description: "Aurora wallpaper, personalized greeting, floating AI orb, dock with 14 quick-access apps",
  },
  {
    src: "/screenshots/app_launcher.png",
    title: "App Launcher",
    description: "25 built-in apps with search — About, Bond, Email, Files, Memory, Notes, Network, and more",
  },
  {
    src: "/screenshots/files.png",
    title: "File Browser",
    description: "Places sidebar, icon-based file list with sizes and dates, navigate your entire filesystem",
  },
  {
    src: "/screenshots/terminal.png",
    title: "Terminal",
    description: "Multi-tab terminal emulator with shell integration — run any command right from the desktop",
  },
  {
    src: "/screenshots/memory_browser.png",
    title: "Memory Browser",
    description: "Search through 7,000+ semantic memories — everything the AI has ever learned about you",
  },
  {
    src: "/screenshots/settings_ai.png",
    title: "AI & Companion Settings",
    description: "Configure AI model, backend, context window, tool permissions, bond level, and personality",
  },
  {
    src: "/screenshots/skill_store.png",
    title: "Skill Store",
    description: "50 toggleable AI behaviors across Intelligence, Productivity, Entertainment, and more",
  },
  {
    src: "/screenshots/calendar.png",
    title: "Calendar",
    description: "Monthly view with event sidebar — integrated with AI for smart scheduling",
  },
  {
    src: "/screenshots/settings.png",
    title: "Display Settings",
    description: "Dark/Light theme, 5 wallpapers, accent color, resolution — customize your desktop",
  },
  {
    src: "/screenshots/text_editor.png",
    title: "Text Editor",
    description: "Built-in editor with Find, AI assistance button, and Save — edit files without leaving the desktop",
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
            A full desktop environment with 25 native apps. No Electron. Pure Rust + Slint.
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
                className={`shrink-0 w-24 h-15 rounded-lg overflow-hidden border-2 transition-all ${
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
