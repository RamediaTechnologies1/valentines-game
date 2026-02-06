"use client";

import { motion } from "framer-motion";

interface OpeningSceneProps {
  fromName: string;
  toName: string;
  onStart: () => void;
}

export default function OpeningScene({
  fromName,
  toName,
  onStart,
}: OpeningSceneProps) {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative">
      {/* Soft radial glow */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-15"
        style={{
          background:
            "radial-gradient(circle, #f43f5e 0%, #db2777 50%, transparent 70%)",
        }}
      />

      <motion.div className="relative z-10">
        {/* Small sparkle */}
        <motion.div
          className="text-rose-400/60 text-2xl mb-6"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          ✦
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="text-rose-300/40 text-xs tracking-[0.25em] uppercase mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          A journey made for you
        </motion.p>

        {/* Names */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-3 leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          {fromName}
          <span className="text-rose-400/60 mx-3">&</span>
          {toName}
        </motion.h1>

        {/* Decorative line */}
        <motion.div
          className="w-16 h-[1px] mx-auto my-8"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(244,63,94,0.4), transparent)",
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        />

        {/* Scroll prompt */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
        >
          <button
            onClick={onStart}
            className="group flex flex-col items-center gap-3 mx-auto"
          >
            <span className="text-white/30 text-sm tracking-wide group-hover:text-white/50 transition-colors">
              Scroll to begin
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <svg
                className="w-5 h-5 text-rose-400/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </motion.div>
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
