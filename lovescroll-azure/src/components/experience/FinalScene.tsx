"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FinalSceneProps {
  fromName: string;
  toName: string;
  letter: string;
  isUnlocked: boolean;
  onReplay: () => void;
}

export default function FinalScene({
  fromName,
  toName,
  letter,
  isUnlocked,
  onReplay,
}: FinalSceneProps) {
  const [showLetter, setShowLetter] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [showFireworks, setShowFireworks] = useState(false);
  const [letterComplete, setLetterComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isUnlocked) return;

    // Start letter reveal after a short delay
    const timeout = setTimeout(() => setShowLetter(true), 800);
    return () => clearTimeout(timeout);
  }, [isUnlocked]);

  useEffect(() => {
    if (!showLetter) return;

    let i = 0;
    intervalRef.current = setInterval(() => {
      if (i < letter.length) {
        setDisplayedText(letter.slice(0, i + 1));
        i++;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setLetterComplete(true);
        setTimeout(() => setShowFireworks(true), 500);
      }
    }, 30); // speed of typewriter

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [showLetter, letter]);

  // Skip typewriter on tap
  const handleSkip = () => {
    if (letterComplete) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayedText(letter);
    setLetterComplete(true);
    setTimeout(() => setShowFireworks(true), 300);
  };

  if (!isUnlocked) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-4xl mb-4 opacity-20">🔒</div>
          <p className="text-white/20 text-sm">
            Unlock all memories to reveal the finale
          </p>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-16 relative">
      {/* Fireworks */}
      <AnimatePresence>
        {showFireworks && (
          <>
            {Array.from({ length: 20 }, (_, i) => (
              <motion.div
                key={`fw-${i}`}
                className="fixed text-xl pointer-events-none z-30"
                initial={{
                  x: "50vw",
                  y: "50vh",
                  opacity: 1,
                  scale: 0,
                }}
                animate={{
                  x: `${20 + Math.random() * 60}vw`,
                  y: `${10 + Math.random() * 60}vh`,
                  opacity: [1, 1, 0],
                  scale: [0, 1.5, 0.5],
                }}
                transition={{
                  duration: 1.5 + Math.random(),
                  delay: Math.random() * 0.8,
                  ease: "easeOut",
                }}
              >
                {["✦", "♥", "✨", "💕", "⭐"][i % 5]}
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      <motion.div
        className="max-w-md w-full relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="text-3xl mb-3"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            💌
          </motion.div>
          <p className="text-rose-300/40 text-xs tracking-[0.2em] uppercase">
            A letter from {fromName}
          </p>
        </motion.div>

        {/* Letter */}
        <AnimatePresence>
          {showLetter && (
            <motion.div
              className="relative p-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              onClick={handleSkip}
            >
              {/* Decorative corner */}
              <div className="absolute top-3 left-3 text-rose-500/10 text-lg">❝</div>
              <div className="absolute bottom-3 right-3 text-rose-500/10 text-lg">❞</div>

              {/* Letter text */}
              <div
                className="text-white/80 text-base leading-[1.8] whitespace-pre-wrap min-h-[120px]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {displayedText}
                {!letterComplete && (
                  <motion.span
                    className="inline-block w-[2px] h-5 bg-rose-400 ml-1 align-middle"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}
              </div>

              {/* Tap to skip hint */}
              {!letterComplete && (
                <p className="text-white/10 text-xs text-center mt-4">
                  tap to skip animation
                </p>
              )}

              {/* Signature */}
              {letterComplete && (
                <motion.div
                  className="mt-6 pt-4 border-t border-white/5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p
                    className="text-rose-400/60 text-sm italic"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    With all my love,
                    <br />
                    {fromName} ♥
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        {letterComplete && (
          <motion.div
            className="mt-8 space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={onReplay}
              className="w-full py-3 rounded-full text-sm font-medium text-white/50 border border-white/10 hover:border-white/20 transition-all"
            >
              Replay ↺
            </button>

            {/* Viral CTA */}
            <a
              href={process.env.NEXT_PUBLIC_WP_URL || "https://ramedia.com"}
              className="block w-full py-3.5 rounded-full text-sm font-semibold text-white text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(244,63,94,0.2)]"
              style={{
                background: "linear-gradient(135deg, #f43f5e, #e11d48)",
              }}
            >
              Create one for YOUR person 💕
            </a>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
