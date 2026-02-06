"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { RecordingState } from "@/hooks/useReactionRecorder";

interface RecordingControlsProps {
  state: RecordingState;
  duration: number;
  downloadUrl: string | null;
  onStart: () => void;
  onStop: () => void;
}

export default function RecordingControls({
  state,
  duration,
  downloadUrl,
  onStart,
  onStop,
}: RecordingControlsProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Only show controls when relevant
  if (state !== "ready" && state !== "recording" && state !== "processing" && state !== "complete") {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
      >
        <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-black/70 backdrop-blur-md border border-white/10 shadow-lg">
          {/* Ready state — start button */}
          {state === "ready" && (
            <button
              onClick={onStart}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #f43f5e, #e11d48)",
              }}
            >
              <div className="w-3 h-3 rounded-full bg-white" />
              Start Recording
            </button>
          )}

          {/* Recording state — timer + stop */}
          {state === "recording" && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white/80 text-sm font-mono">
                  {formatTime(duration)}
                </span>
              </div>
              <button
                onClick={onStop}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-all"
              >
                <div className="w-3 h-3 rounded-sm bg-red-400" />
                Stop
              </button>
            </>
          )}

          {/* Processing state */}
          {state === "processing" && (
            <div className="flex items-center gap-2 px-3 py-1">
              <svg
                className="animate-spin w-4 h-4 text-rose-400"
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
              <span className="text-white/60 text-sm">Processing video...</span>
            </div>
          )}

          {/* Complete state — download */}
          {state === "complete" && downloadUrl && (
            <a
              href={downloadUrl}
              download={`lovescroll-reaction-${Date.now()}.webm`}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-white transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #f43f5e, #e11d48)",
              }}
            >
              💾 Save Reaction Video
            </a>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
