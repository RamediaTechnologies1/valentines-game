"use client";

import { motion } from "framer-motion";
import type { RecordingState } from "@/hooks/useReactionRecorder";

interface RecordingPermissionsProps {
  state: RecordingState;
  error: string | null;
  onAllow: () => void;
  onSkip: () => void;
}

export default function RecordingPermissions({
  state,
  error,
  onAllow,
  onSkip,
}: RecordingPermissionsProps) {
  if (state !== "idle" && state !== "requesting" && state !== "error") {
    return null;
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Sheet */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-4 mb-4 sm:mb-0 p-6 rounded-2xl border border-white/10 bg-[#111]"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Icon */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-500/10 mb-3">
            <span className="text-2xl">📹</span>
          </div>
          <h3
            className="text-xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Record your reaction?
          </h3>
        </div>

        {/* Description */}
        <p className="text-white/40 text-sm text-center leading-relaxed mb-2">
          We&apos;ll create a beautiful side-by-side video showing the experience
          alongside your live reaction.
        </p>
        <p className="text-white/25 text-xs text-center mb-6">
          Everything stays on your device — nothing is uploaded.
        </p>

        {/* Preview mockup */}
        <div className="flex gap-2 mb-6 max-w-[200px] mx-auto">
          <div className="flex-1 aspect-[9/16] rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <span className="text-xs text-white/20">Experience</span>
          </div>
          <div className="flex-1 aspect-[9/16] rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <span className="text-xs text-white/20">Your face</span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-xs text-center">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={onAllow}
            disabled={state === "requesting"}
            className="w-full py-3.5 rounded-full font-semibold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #f43f5e, #e11d48)",
            }}
          >
            {state === "requesting" ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Requesting access...
              </span>
            ) : (
              "Enable Camera & Record 🎬"
            )}
          </button>

          <button
            onClick={onSkip}
            disabled={state === "requesting"}
            className="w-full py-3 rounded-full text-sm font-medium text-white/40 hover:text-white/60 transition-colors"
          >
            Skip — just watch the experience
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
