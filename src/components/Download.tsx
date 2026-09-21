"use client";

import { motion } from "framer-motion";
import { Download as DownloadIcon, ShieldCheck, FileCode2 } from "lucide-react";
import release from "@/data/release.json";

const ISO_BASE = "https://iso.yantrikos.com/nightly";

const facts = [
  {
    title: "A live image",
    body: "Boots to first-run setup from a USB stick or in a VM without touching your disk. A disk installer (yantrik-install) is included; on this build it has not been exercised yet, so try it on a machine you can afford to wipe.",
  },
  {
    title: "No model inside",
    body: "The image ships the desktop and its 14 apps, not a mind. Point it at a model you run, or a provider you choose, in the first-run setup.",
  },
  {
    title: "Nightly means nightly",
    body: "It has booted in a VM. It has not yet been booted on real hardware or through UEFI. The live user is yantrik / yantrik with passwordless sudo; SSH is off.",
  },
];

export default function Download() {
  const iso = `${ISO_BASE}/${release.file}`;
  return (
    <section id="download" className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            Download
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            One ISO, x86-64, built on Debian trixie.
          </p>
        </motion.div>

        <motion.div
          className="glass rounded-2xl p-8 sm:p-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="text-white font-semibold text-lg">
                Yantrik OS nightly
                <span className="text-zinc-500 font-normal ml-2">
                  {release.version}
                </span>
              </div>
              <div className="text-sm text-zinc-500 mt-1">
                {release.date} · {release.size} · amd64
              </div>
            </div>
            <a
              href={iso}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2"
            >
              <DownloadIcon className="w-5 h-5" />
              Download ISO
            </a>
          </div>

          <div className="mt-8 rounded-xl bg-black/40 border border-white/5 p-4">
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
              <ShieldCheck className="w-4 h-4" />
              SHA-256
            </div>
            <code className="font-mono text-xs sm:text-sm text-zinc-300 break-all">
              {release.sha256}
            </code>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-500">
            <a
              href={`${iso}.sha256`}
              className="hover:text-zinc-300 transition-colors"
            >
              Checksum file
            </a>
            <a
              href={`${ISO_BASE}/README.txt`}
              className="hover:text-zinc-300 transition-colors"
            >
              Release notes
            </a>
            <a
              href={`${ISO_BASE}/`}
              className="hover:text-zinc-300 transition-colors"
            >
              All nightly builds
            </a>
            <a
              href="https://github.com/yantrikos/yantrik-os"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition-colors flex items-center gap-1.5"
            >
              <FileCode2 className="w-4 h-4" />
              Source (GPL-3.0) · built from {release.commit}
            </a>
          </div>
        </motion.div>

        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          {facts.map((f) => (
            <div key={f.title} className="glass rounded-xl p-5">
              <div className="text-white font-medium mb-1.5">{f.title}</div>
              <p className="text-sm text-zinc-400 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
