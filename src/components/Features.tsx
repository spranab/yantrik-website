"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Monitor,
  Zap,
  Shield,
  Network,
  Terminal,
  Disc,
  KeyRound,
  Eye,
  Puzzle,
  LayoutGrid,
  Layers,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "One Local Memory",
    description:
      "Both minds that attach today talk to the same memory server on the machine. Change the mind and the desktop keeps what it knows.",
    color: "from-indigo-500 to-violet-500",
  },
  {
    icon: Monitor,
    title: "The Shell Is the Desktop",
    description:
      "Not a chat window floating over someone else's session. Rust and Slint on Debian trixie, labwc underneath, Wayland all the way down.",
    color: "from-rose-500 to-pink-500",
  },
  {
    icon: Shield,
    title: "Four Grades, Enforced",
    description:
      "Every action is safe, standard, sensitive, or dangerous. The OS checks the grade against the caller's ceiling before anything runs.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Zap,
    title: "57 Actions",
    description:
      "Across ten control surfaces. Every app publishes one, so a mind opens files and drives windows instead of narrating what you should click.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Eye,
    title: "Structure, Not Pixels",
    description:
      "Every app publishes an accessibility tree. A mind reads the interface the way the app understands it, rather than squinting at a screenshot.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: Network,
    title: "Six Methods, One Socket",
    description:
      "Attach, poll, chunk, complete, fail, detach. That is the whole contract a mind has to meet to take the desk.",
    color: "from-purple-500 to-fuchsia-500",
  },
  {
    icon: KeyRound,
    title: "No Keys Held Here",
    description:
      "The OS stores no model, no endpoint, no API key for a mind. The mind brings its own — and can take it away again.",
    color: "from-sky-500 to-indigo-500",
  },
  {
    icon: LayoutGrid,
    title: "16 Apps",
    description:
      "Files, terminal, editor, browser, memory, network, email, settings and the rest. First-party, and every one of them drivable.",
    color: "from-teal-500 to-emerald-500",
  },
  {
    icon: Layers,
    title: "Local-First, Not Local-Only",
    description:
      "The memory and the desktop run on your machine. The model can be local or remote — the OS never sits between you and its credentials.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: Terminal,
    title: "A Real Terminal",
    description:
      "Multi-tab, shell-integrated, and on the same footing as everything else: a surface a mind can call, with the dangerous work graded as such.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Puzzle,
    title: "50 Skills",
    description:
      "Shipped as files on the machine. Toggle them from the Skill Store, read them in the editor, write your own beside them.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Disc,
    title: "ISO In, Nightly After",
    description:
      "Write the image, boot it, and the desktop is there. Updates arrive on a nightly channel — yantrik-update apply and you are current.",
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
            The desktop is built to be used by something that is not a person — and
            to stay in charge of what that something is allowed to touch.
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
