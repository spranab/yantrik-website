"use client";

import { motion } from "framer-motion";
import {
  Laugh,
  Newspaper,
  TrendingUp,
  CloudSun,
  Heart,
  BookOpen,
  Lightbulb,
  ShieldCheck,
  Music,
  MapPin,
  Target,
  Flame,
} from "lucide-react";

const skills = [
  { icon: Laugh, name: "Humor", cat: "Social", enabled: true },
  { icon: Newspaper, name: "News Watch", cat: "Intelligence", enabled: true },
  { icon: TrendingUp, name: "Trend Watch", cat: "Intelligence", enabled: true },
  { icon: CloudSun, name: "Weather", cat: "Utility", enabled: true },
  { icon: Heart, name: "Health Pulse", cat: "Wellness", enabled: false },
  { icon: BookOpen, name: "Philosophy", cat: "Knowledge", enabled: false },
  { icon: Lightbulb, name: "Curiosity", cat: "Intelligence", enabled: true },
  { icon: ShieldCheck, name: "Devil's Advocate", cat: "Decision", enabled: false },
  { icon: Music, name: "Music Mind", cat: "Entertainment", enabled: false },
  { icon: MapPin, name: "Local Pulse", cat: "Intelligence", enabled: false },
  { icon: Target, name: "Goal Keeper", cat: "Productivity", enabled: true },
  { icon: Flame, name: "Skill Forge", cat: "Growth", enabled: false },
];

export default function SkillStore() {
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
            The{" "}
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Skill Store
            </span>
          </h2>
          <p className="mt-4 text-lg text-zinc-400 max-w-xl mx-auto">
            Toggle AI behaviors like apps. 50 skills across intelligence,
            wellness, productivity, and creativity.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {skills.map((skill, i) => (
            <motion.div
              key={skill.name}
              className={`glass rounded-xl p-4 text-center group cursor-default transition-all ${
                skill.enabled
                  ? "border-indigo-500/20 hover:border-indigo-500/40"
                  : "opacity-60 hover:opacity-80"
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <skill.icon
                className={`w-8 h-8 mx-auto mb-2 ${
                  skill.enabled ? "text-indigo-400" : "text-zinc-600"
                }`}
              />
              <h4 className="text-sm font-medium text-white">{skill.name}</h4>
              <span className="text-xs text-zinc-600">{skill.cat}</span>
              <div className="mt-2">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                    skill.enabled
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-white/5 text-zinc-600"
                  }`}
                >
                  {skill.enabled ? "ON" : "OFF"}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          className="text-center text-sm text-zinc-600 mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          + 38 more skills including DreamKeeper, MythBuster, ConnectionWeaver,
          EnergyMap, FutureSelf...
        </motion.p>
      </div>
    </section>
  );
}
