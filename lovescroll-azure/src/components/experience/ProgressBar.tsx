"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  total: number;
  completed: number;
}

export default function ProgressBar({ total, completed }: ProgressBarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/5">
      {Array.from({ length: total }, (_, i) => (
        <motion.div
          key={i}
          className={`rounded-full transition-all duration-500 ${
            i < completed
              ? "w-2 h-2 bg-rose-400"
              : i === completed
              ? "w-2.5 h-2.5 bg-rose-500/50 ring-2 ring-rose-500/20"
              : "w-2 h-2 bg-white/10"
          }`}
          animate={
            i === completed
              ? { scale: [1, 1.3, 1] }
              : {}
          }
          transition={{ duration: 2, repeat: i === completed ? Infinity : 0 }}
        />
      ))}
      {/* Final heart */}
      <motion.div
        className={`text-xs transition-all duration-500 ${
          completed >= total ? "text-rose-400" : "text-white/10"
        }`}
        animate={
          completed >= total
            ? { scale: [1, 1.3, 1] }
            : {}
        }
        transition={{ duration: 1, repeat: completed >= total ? Infinity : 0 }}
      >
        ♥
      </motion.div>
    </div>
  );
}
