"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useState } from "react";

export default function VideoDemo() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="relative py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Watch the{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              tour
            </span>
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            35 seconds through 10 screens. Desktop, apps, settings, skill store, memory browser.
          </p>
        </motion.div>

        <motion.div
          className="glass rounded-2xl overflow-hidden relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {!playing ? (
            <div
              className="relative aspect-[16/10] bg-black cursor-pointer group"
              onClick={() => setPlaying(true)}
            >
              <img
                src="/screenshots/app_launcher.png"
                alt="Yantrik OS Tour"
                className="w-full h-full object-contain opacity-70 group-hover:opacity-50 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-indigo-600/90 flex items-center justify-center group-hover:bg-indigo-500 group-hover:scale-110 transition-all shadow-[0_0_40px_rgba(99,102,241,0.4)]">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-[16/10] bg-black">
              <video
                src="/videos/tour.mp4"
                autoPlay
                controls
                className="w-full h-full"
                onEnded={() => setPlaying(false)}
              />
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
