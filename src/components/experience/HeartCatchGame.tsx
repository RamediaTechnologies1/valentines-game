"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FallingItem {
  id: string;
  x: number;
  y: number;
  speed: number;
  type: "heart" | "broken";
  size: number;
  emoji: string;
}

interface HeartCatchGameProps {
  fromName: string;
  toName: string;
  onComplete: () => void;
}

const WINNING_SCORE = 10;
const BROKEN_PENALTY = -2;
const HEART_EMOJIS = ["❤️", "💖", "💗", "💕", "🩷"];
const BROKEN_EMOJIS = ["💔", "🖤"];

export default function HeartCatchGame({
  fromName,
  toName,
  onComplete,
}: HeartCatchGameProps) {
  const [gameState, setGameState] = useState<"intro" | "playing" | "won">("intro");
  const [score, setScore] = useState(0);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [tappedIds, setTappedIds] = useState<Set<string>>(new Set());
  const [showFlash, setShowFlash] = useState<"good" | "bad" | null>(null);
  const [combo, setCombo] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const frameRef = useRef<number | null>(null);
  const itemsRef = useRef<FallingItem[]>([]);

  // Keep ref in sync
  itemsRef.current = items;

  const spawnItem = useCallback(() => {
    const isBroken = Math.random() < 0.25; // 25% chance of broken heart
    const newItem: FallingItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      x: 10 + Math.random() * 75, // percentage from left (10-85%)
      y: -8, // start above screen
      speed: 0.3 + Math.random() * 0.4, // varied speeds
      type: isBroken ? "broken" : "heart",
      size: isBroken ? 32 : 28 + Math.random() * 12,
      emoji: isBroken
        ? BROKEN_EMOJIS[Math.floor(Math.random() * BROKEN_EMOJIS.length)]
        : HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)],
    };
    setItems((prev) => [...prev, newItem]);
  }, []);

  // Game loop - move items down
  useEffect(() => {
    if (gameState !== "playing") return;

    const tick = () => {
      setItems((prev) => {
        const updated = prev
          .map((item) => ({ ...item, y: item.y + item.speed }))
          .filter((item) => item.y < 105); // remove items past bottom
        return updated;
      });
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [gameState]);

  // Spawn items periodically
  useEffect(() => {
    if (gameState !== "playing") return;

    // Initial burst
    setTimeout(() => spawnItem(), 300);
    setTimeout(() => spawnItem(), 700);

    spawnIntervalRef.current = setInterval(() => {
      spawnItem();
      // Sometimes spawn two at once for challenge
      if (Math.random() < 0.3) {
        setTimeout(spawnItem, 200);
      }
    }, 800);

    return () => {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    };
  }, [gameState, spawnItem]);

  // Check for win
  useEffect(() => {
    if (score >= WINNING_SCORE && gameState === "playing") {
      setGameState("won");
      // Clean up
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      // Haptic
      if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
    }
  }, [score, gameState]);

  const handleTap = (item: FallingItem) => {
    if (tappedIds.has(item.id)) return;

    setTappedIds((prev) => new Set(prev).add(item.id));

    // Remove the item
    setItems((prev) => prev.filter((i) => i.id !== item.id));

    if (item.type === "heart") {
      setScore((prev) => Math.min(prev + 1, WINNING_SCORE));
      setCombo((prev) => prev + 1);
      setShowFlash("good");
      if (navigator.vibrate) navigator.vibrate(30);
    } else {
      setScore((prev) => Math.max(prev + BROKEN_PENALTY, 0));
      setCombo(0);
      setShowFlash("bad");
      if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    }

    setTimeout(() => setShowFlash(null), 300);
  };

  const startGame = () => {
    setScore(0);
    setItems([]);
    setTappedIds(new Set());
    setCombo(0);
    setGameState("playing");
  };

  // ─── INTRO SCREEN ────────────────────
  if (gameState === "intro") {
    return (
      <section className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          className="text-center max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="text-6xl mb-6"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            💝
          </motion.div>

          <h2
            className="text-2xl sm:text-3xl font-bold text-white mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            One more thing...
          </h2>

          <p className="text-white/40 text-sm mb-2 leading-relaxed">
            Catch <span className="text-rose-400 font-semibold">10 hearts</span> to
            unlock {fromName}&apos;s final message.
          </p>
          <p className="text-white/25 text-xs mb-8">
            Watch out for 💔 — they cost you 2 points!
          </p>

          <button
            onClick={startGame}
            className="px-8 py-3.5 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(244,63,94,0.3)]"
            style={{
              background: "linear-gradient(135deg, #f43f5e, #e11d48)",
            }}
          >
            Let&apos;s Play! 💕
          </button>
        </motion.div>
      </section>
    );
  }

  // ─── WIN SCREEN ─────────────────────
  if (gameState === "won") {
    return (
      <section className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
        {/* Celebration particles */}
        {Array.from({ length: 15 }, (_, i) => (
          <motion.div
            key={`celebrate-${i}`}
            className="fixed text-2xl pointer-events-none"
            initial={{
              x: "50%",
              y: "50%",
              opacity: 1,
              scale: 0,
            }}
            animate={{
              x: `${15 + Math.random() * 70}vw`,
              y: `${10 + Math.random() * 80}vh`,
              opacity: [1, 1, 0],
              scale: [0, 1.2, 0.6],
            }}
            transition={{
              duration: 1.5 + Math.random(),
              delay: Math.random() * 0.5,
            }}
          >
            {["✨", "💕", "♥", "⭐", "🎉"][i % 5]}
          </motion.div>
        ))}

        <motion.div
          className="text-center max-w-sm relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-6xl mb-6"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 1 }}
          >
            🎉
          </motion.div>

          <h2
            className="text-2xl sm:text-3xl font-bold text-white mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            You caught them all!
          </h2>

          <p className="text-white/40 text-sm mb-8">
            {fromName} has a special message for you...
          </p>

          <motion.button
            onClick={onComplete}
            className="px-8 py-3.5 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #f43f5e, #e11d48)",
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Read the Letter 💌
          </motion.button>
        </motion.div>
      </section>
    );
  }

  // ─── GAME SCREEN ────────────────────
  return (
    <section className="min-h-screen relative overflow-hidden select-none">
      {/* Score flash overlay */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            className={`fixed inset-0 z-30 pointer-events-none ${
              showFlash === "good"
                ? "bg-rose-500/10"
                : "bg-red-900/15"
            }`}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Score bar */}
      <div className="fixed top-0 left-0 right-0 z-40 px-6 pt-4 pb-3 bg-gradient-to-b from-black/80 to-transparent">
        <div className="max-w-sm mx-auto">
          {/* Score number */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/40 text-xs tracking-wider uppercase">
              Hearts caught
            </span>
            <div className="flex items-center gap-1">
              <motion.span
                key={score}
                className="text-white font-bold text-lg"
                initial={{ scale: 1.5, color: "#f43f5e" }}
                animate={{ scale: 1, color: "#ffffff" }}
                transition={{ duration: 0.3 }}
              >
                {score}
              </motion.span>
              <span className="text-white/30 text-sm">/ {WINNING_SCORE}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #f43f5e, #ec4899, #f43f5e)",
                backgroundSize: "200% 100%",
              }}
              animate={{
                width: `${(score / WINNING_SCORE) * 100}%`,
                backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
              }}
              transition={{
                width: { type: "spring", stiffness: 300, damping: 30 },
                backgroundPosition: { duration: 3, repeat: Infinity },
              }}
            />
          </div>

          {/* Combo indicator */}
          <AnimatePresence>
            {combo >= 3 && (
              <motion.p
                className="text-rose-400 text-xs text-center mt-1 font-medium"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                🔥 {combo}x combo!
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Game area */}
      <div
        ref={gameAreaRef}
        className="fixed inset-0 z-20"
        style={{ touchAction: "none" }}
      >
        <AnimatePresence>
          {items.map((item) => (
            <motion.button
              key={item.id}
              className="absolute z-20 select-none active:scale-75 transition-transform"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                fontSize: `${item.size}px`,
                transform: "translate(-50%, -50%)",
                filter: item.type === "broken" ? "none" : "drop-shadow(0 0 8px rgba(244,63,94,0.3))",
              }}
              onClick={() => handleTap(item)}
              onTouchStart={(e) => {
                e.preventDefault();
                handleTap(item);
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: item.type === "broken" ? [0, -10, 10, -5, 0] : [0, 5, -5, 0],
              }}
              exit={{ opacity: 0, scale: 2 }}
              transition={{
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 },
                rotate: { duration: 3, repeat: Infinity },
              }}
            >
              {item.emoji}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Background hint */}
      <div className="fixed bottom-8 left-0 right-0 z-10 text-center">
        <p className="text-white/10 text-xs">
          Tap the hearts! Avoid the 💔
        </p>
      </div>
    </section>
  );
}
