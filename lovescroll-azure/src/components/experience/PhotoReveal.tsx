"use client";

import { motion, AnimatePresence } from "framer-motion";

interface PhotoRevealProps {
  photo: { url: string; caption: string } | null;
  isOpen: boolean;
  onClose: () => void;
  index: number;
  total: number;
}

export default function PhotoReveal({
  photo,
  isOpen,
  onClose,
  index,
  total,
}: PhotoRevealProps) {
  if (!photo) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Content */}
          <motion.div
            className="relative z-10 max-w-md w-full"
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Photo container */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-rose-500/10">
              {/* Glow effect */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(244,63,94,0.3), transparent 70%)",
                }}
              />

              {/* Photo */}
              <div className="relative aspect-[4/5] bg-neutral-900">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover"
                  loading="eager"
                />

                {/* Gradient overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />

                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <motion.p
                    className="text-white text-lg leading-relaxed"
                    style={{ fontFamily: "var(--font-display)" }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    &ldquo;{photo.caption}&rdquo;
                  </motion.p>
                  <motion.p
                    className="text-white/30 text-xs mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Memory {index + 1} of {total}
                  </motion.p>
                </div>
              </div>
            </div>

            {/* Close / Continue button */}
            <motion.button
              onClick={onClose}
              className="w-full mt-4 py-3 rounded-full text-sm font-medium text-white/60 border border-white/10 hover:border-rose-500/30 hover:text-white transition-all"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Continue ↓
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
