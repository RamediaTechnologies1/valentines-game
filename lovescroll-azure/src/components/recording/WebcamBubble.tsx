"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useDragControls } from "framer-motion";

interface WebcamBubbleProps {
  stream: MediaStream | null;
  isRecording: boolean;
  duration: number;
}

export default function WebcamBubble({
  stream,
  isRecording,
  duration,
}: WebcamBubbleProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [minimized, setMinimized] = useState(false);
  const dragControls = useDragControls();

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!stream) return null;

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0.1}
      className="fixed z-50 cursor-grab active:cursor-grabbing"
      style={{ top: 80, right: 16 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div
        className={`relative transition-all duration-300 ${
          minimized ? "w-12 h-12" : "w-28 h-36"
        }`}
      >
        {/* Video */}
        <div
          className={`rounded-2xl overflow-hidden border-2 transition-all duration-300 shadow-lg shadow-black/40 ${
            isRecording
              ? "border-rose-500"
              : "border-white/20"
          } ${minimized ? "w-12 h-12 rounded-full" : "w-full h-full"}`}
          onClick={() => setMinimized((prev) => !prev)}
        >
          <video
            ref={videoRef}
            muted
            playsInline
            autoPlay
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }} // Mirror
          />

          {/* Recording dot */}
          {isRecording && !minimized && (
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white text-[10px] font-mono bg-black/50 px-1 rounded">
                {formatTime(duration)}
              </span>
            </div>
          )}

          {/* Minimized recording indicator */}
          {isRecording && minimized && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            </div>
          )}
        </div>

        {/* Tap hint */}
        {!minimized && (
          <p className="text-white/20 text-[9px] text-center mt-1">
            tap to minimize • drag to move
          </p>
        )}
      </div>
    </motion.div>
  );
}
