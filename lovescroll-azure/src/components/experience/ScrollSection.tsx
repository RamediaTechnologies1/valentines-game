"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { INTERACTION_TYPES, type InteractionType } from "@/lib/constants";

interface ScrollSectionProps {
  index: number;
  total: number;
  interactionType: InteractionType;
  isCompleted: boolean;
  onReveal: () => void;
}

export default function ScrollSection({
  index,
  total,
  interactionType,
  isCompleted,
  onReveal,
}: ScrollSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: "-20%", once: false });
  const [tapped, setTapped] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);

  const handleTap = () => {
    if (isCompleted) return;

    if (interactionType === "scratch-card") {
      // Scratch needs multiple taps
      const next = scratchProgress + 35;
      setScratchProgress(next);
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(30);
      if (next >= 100) {
        setTapped(true);
        setTimeout(onReveal, 300);
      }
      return;
    }

    setTapped(true);
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(50);
    setTimeout(onReveal, 400);
  };

  const getInteractionContent = () => {
    switch (interactionType) {
      case "gift-box":
        return (
          <GiftBox
            tapped={tapped}
            isCompleted={isCompleted}
            onTap={handleTap}
            index={index}
          />
        );
      case "scratch-card":
        return (
          <ScratchCard
            progress={scratchProgress}
            isCompleted={isCompleted}
            onTap={handleTap}
            index={index}
          />
        );
      case "heart-burst":
        return (
          <HeartBurst
            tapped={tapped}
            isCompleted={isCompleted}
            onTap={handleTap}
            index={index}
          />
        );
      case "polaroid-drop":
        return (
          <PolaroidDrop
            tapped={tapped}
            isCompleted={isCompleted}
            onTap={handleTap}
            index={index}
            isInView={isInView}
          />
        );
      case "envelope":
        return (
          <Envelope
            tapped={tapped}
            isCompleted={isCompleted}
            onTap={handleTap}
            index={index}
          />
        );
      default:
        return (
          <GiftBox
            tapped={tapped}
            isCompleted={isCompleted}
            onTap={handleTap}
            index={index}
          />
        );
    }
  };

  return (
    <motion.section
      ref={ref}
      className="min-h-[80vh] flex items-center justify-center px-6 py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: isInView ? 1 : 0.3 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-sm w-full">
        {/* Memory label */}
        <motion.p
          className="text-center text-rose-400/30 text-xs tracking-[0.2em] uppercase mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          Memory {index + 1} of {total}
        </motion.p>

        {/* Interaction area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {getInteractionContent()}
        </motion.div>

        {/* Hint text */}
        {!isCompleted && !tapped && (
          <motion.p
            className="text-center text-white/20 text-xs mt-4"
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {interactionType === "scratch-card"
              ? "Tap to scratch"
              : "Tap to reveal"}
          </motion.p>
        )}

        {isCompleted && (
          <motion.p
            className="text-center text-rose-400/30 text-xs mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            ✓ Memory unlocked
          </motion.p>
        )}
      </div>
    </motion.section>
  );
}

// ─── INTERACTION COMPONENTS ──────────────────────

function GiftBox({
  tapped,
  isCompleted,
  onTap,
  index,
}: {
  tapped: boolean;
  isCompleted: boolean;
  onTap: () => void;
  index: number;
}) {
  const ribbonColors = [
    "from-rose-400 to-pink-500",
    "from-pink-400 to-fuchsia-500",
    "from-red-400 to-rose-500",
    "from-amber-400 to-orange-500",
    "from-violet-400 to-purple-500",
  ];
  const color = ribbonColors[index % ribbonColors.length];

  return (
    <motion.button
      onClick={onTap}
      disabled={isCompleted}
      className="relative w-full aspect-square max-w-[240px] mx-auto block"
      whileTap={!isCompleted ? { scale: 0.95 } : {}}
      animate={tapped ? { scale: [1, 1.1, 0.8], opacity: [1, 1, 0] } : {}}
      transition={tapped ? { duration: 0.4 } : {}}
    >
      {/* Box */}
      <div className="absolute inset-4 rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
        {/* Shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        />

        {/* Ribbon vertical */}
        <div
          className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-6 bg-gradient-to-b ${color} opacity-30`}
        />
        {/* Ribbon horizontal */}
        <div
          className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-6 bg-gradient-to-r ${color} opacity-30`}
        />

        {/* Bow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl">
          🎁
        </div>
      </div>
    </motion.button>
  );
}

function ScratchCard({
  progress,
  isCompleted,
  onTap,
  index,
}: {
  progress: number;
  isCompleted: boolean;
  onTap: () => void;
  index: number;
}) {
  return (
    <motion.button
      onClick={onTap}
      disabled={isCompleted}
      className="relative w-full aspect-[4/3] max-w-[280px] mx-auto block rounded-2xl overflow-hidden"
      whileTap={!isCompleted ? { scale: 0.98 } : {}}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-900/20 to-pink-900/20 border border-white/10 rounded-2xl" />

      {/* Scratch overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-2xl flex items-center justify-center"
        style={{ opacity: 1 - progress / 100 }}
      >
        <div className="text-center">
          <div className="text-3xl mb-2">✨</div>
          <p className="text-white/40 text-sm">Scratch me</p>
        </div>

        {/* Scratch marks */}
        {progress > 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: Math.floor(progress / 25) }, (_, i) => (
              <motion.div
                key={i}
                className="absolute w-16 h-2 bg-transparent rounded-full"
                style={{
                  transform: `rotate(${i * 45 + 20}deg)`,
                  boxShadow: "0 0 20px 10px rgba(0,0,0,0.5)",
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
        <motion.div
          className="h-full bg-rose-500"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.button>
  );
}

function HeartBurst({
  tapped,
  isCompleted,
  onTap,
  index,
}: {
  tapped: boolean;
  isCompleted: boolean;
  onTap: () => void;
  index: number;
}) {
  return (
    <motion.button
      onClick={onTap}
      disabled={isCompleted}
      className="relative w-full aspect-square max-w-[200px] mx-auto block flex items-center justify-center"
      whileTap={!isCompleted ? { scale: 0.9 } : {}}
    >
      <motion.div
        className="text-7xl"
        animate={
          tapped
            ? { scale: [1, 2, 0], rotate: [0, 0, 180] }
            : { scale: [1, 1.1, 1] }
        }
        transition={
          tapped
            ? { duration: 0.5 }
            : { duration: 2, repeat: Infinity }
        }
      >
        ♥
      </motion.div>

      {/* Burst particles on tap */}
      {tapped && (
        <>
          {Array.from({ length: 8 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute text-rose-400 text-lg"
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos((i * Math.PI) / 4) * 100,
                y: Math.sin((i * Math.PI) / 4) * 100,
                opacity: 0,
                scale: 0,
              }}
              transition={{ duration: 0.6 }}
            >
              ♥
            </motion.div>
          ))}
        </>
      )}

      {/* Ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-rose-500/10"
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.button>
  );
}

function PolaroidDrop({
  tapped,
  isCompleted,
  onTap,
  index,
  isInView,
}: {
  tapped: boolean;
  isCompleted: boolean;
  onTap: () => void;
  index: number;
  isInView: boolean;
}) {
  return (
    <motion.button
      onClick={onTap}
      disabled={isCompleted}
      className="relative w-full max-w-[220px] mx-auto block"
      whileTap={!isCompleted ? { scale: 0.97 } : {}}
    >
      <motion.div
        className="bg-white/[0.05] border border-white/10 rounded-lg p-3 pb-10"
        initial={{ y: -60, rotate: -5, opacity: 0 }}
        animate={
          isInView
            ? { y: 0, rotate: [5, -3, 1, 0], opacity: 1 }
            : { y: -60, opacity: 0 }
        }
        transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.3 }}
      >
        {/* Photo placeholder */}
        <div className="aspect-square bg-white/[0.03] rounded flex items-center justify-center">
          <motion.span
            className="text-4xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            📷
          </motion.span>
        </div>

        {/* Tape */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-amber-200/10 rounded-sm rotate-[-2deg]" />
      </motion.div>
    </motion.button>
  );
}

function Envelope({
  tapped,
  isCompleted,
  onTap,
  index,
}: {
  tapped: boolean;
  isCompleted: boolean;
  onTap: () => void;
  index: number;
}) {
  return (
    <motion.button
      onClick={onTap}
      disabled={isCompleted}
      className="relative w-full max-w-[260px] mx-auto block"
      whileTap={!isCompleted ? { scale: 0.97 } : {}}
    >
      {/* Envelope body */}
      <div className="relative aspect-[3/2] bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden">
        {/* Flap */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-1/2 origin-top"
          style={{
            background:
              "linear-gradient(180deg, rgba(244,63,94,0.08), rgba(255,255,255,0.02))",
            clipPath: "polygon(0 0, 50% 100%, 100% 0)",
          }}
          animate={
            tapped
              ? { rotateX: 180, opacity: 0 }
              : {}
          }
          transition={{ duration: 0.4 }}
        />

        {/* Seal */}
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center"
            animate={
              tapped
                ? { scale: [1, 1.5, 0] }
                : { scale: [1, 1.05, 1] }
            }
            transition={
              tapped
                ? { duration: 0.3 }
                : { duration: 2, repeat: Infinity }
            }
          >
            <span className="text-rose-400 text-sm">💌</span>
          </motion.div>
        </div>

        {/* "Open me" text */}
        <div className="absolute bottom-3 left-0 right-0 text-center">
          <span className="text-white/20 text-xs italic">
            tap to open
          </span>
        </div>
      </div>
    </motion.button>
  );
}
