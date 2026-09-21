"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useState } from "react";

const numbers = [
  {
    value: "9,555",
    unit: "tokens",
    label: "Screenshots and clicks",
    body: "Seven screenshots of a 1280×800 desktop, one after every action, at 1,365 tokens each. It needs a vision model, and it cannot tell a harmless click from one that deletes something.",
    tone: "text-amber-400",
  },
  {
    value: "2,326",
    unit: "tokens",
    label: "Yantrik OS",
    body: "Seven calls in the filmed take, including opening the app and checking its own work. Plain text, so any model can read it — including a 27B one on your own GPU. With the app already open it is three calls and 1,210 tokens.",
    tone: "text-teal-300",
  },
];

export default function VideoDemo() {
  const [playing, setPlaying] = useState(false);

  return (
    <section id="film" className="relative py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Why an{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              OS
            </span>{" "}
            for this?
          </h2>
          <p className="mt-4 text-lg text-zinc-400 max-w-3xl mx-auto">
            An AI can already use a computer — by taking a picture of the screen, guessing where to
            click, and taking another. On Yantrik OS every app tells the mind what it is, what it can
            do, and which of those things cannot be undone. The same task, both ways, on the same
            machine, in ninety seconds. Sound on.
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
              className="relative aspect-video bg-black cursor-pointer group"
              onClick={() => setPlaying(true)}
            >
              <img
                src="/videos/tour-poster.jpg"
                alt="Token comparison from the film: 9,555 tokens of screenshots against 2,326 tokens of text for the same calendar task"
                className="w-full h-full object-contain opacity-80 group-hover:opacity-60 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-indigo-600/90 flex items-center justify-center group-hover:bg-indigo-500 group-hover:scale-110 transition-all shadow-[0_0_40px_rgba(99,102,241,0.4)]">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-black">
              <video
                src="/videos/tour.mp4"
                poster="/videos/tour-poster.jpg"
                autoPlay
                playsInline
                controls
                className="w-full h-full"
                onEnded={() => setPlaying(false)}
              />
            </div>
          )}
        </motion.div>

        <div className="mt-10 grid sm:grid-cols-2 gap-6">
          {numbers.map((n) => (
            <motion.div
              key={n.label}
              className="glass rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-sm uppercase tracking-widest text-zinc-500">{n.label}</div>
              <div className={`mt-2 text-4xl font-bold ${n.tone}`}>
                {n.value} <span className="text-lg font-medium text-zinc-500">{n.unit}</span>
              </div>
              <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{n.body}</p>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-sm text-zinc-500 leading-relaxed max-w-4xl">
          How this was measured. The task was “Put lunch with Sam on my calendar, Friday at 1pm, and
          show me that day”, on one VM. The screenshot run was driven for real by a vision model
          taking a screenshot after each action; the film replays its seven steps, without the
          model’s thinking time. The Yantrik run is one unedited take by Hermes Agent on
          deepseek-v4.1-flash, shown at the speeds marked on screen, and every call and count in
          the panel beside it is what the mind actually sent and received. Only what each approach
          spends <em>looking at the computer</em> is counted — not reasoning, not system prompts.
          Text is counted with the o200k tokenizer; a screenshot as width × height ÷ 750. The
          approval, the prep note, the mode menu and the calendar reminder later in the film are
          real takes on the same machine. The music was synthesised for the film.{" "}
          <a href="/measure/calendar-task.json" className="text-zinc-300 underline underline-offset-4 hover:text-white">
            The raw calls and replies
          </a>
          .
        </p>
      </div>
    </section>
  );
}
