"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useReactionRecorder } from "@/hooks/useReactionRecorder";
import RecordingPermissions from "./RecordingPermissions";
import WebcamBubble from "./WebcamBubble";
import RecordingControls from "./RecordingControls";

interface ReactionRecorderProps {
  experienceContainerId: string;
  fromName: string;
  toName: string;
  enabled: boolean;
  autoStopOnFinale?: boolean;
}

export default function ReactionRecorder({
  experienceContainerId,
  fromName,
  toName,
  enabled,
  autoStopOnFinale,
}: ReactionRecorderProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [skipped, setSkipped] = useState(false);

  const {
    state,
    error,
    downloadUrl,
    duration,
    requestPermission,
    startRecording,
    stopRecording,
    getWebcamStream,
  } = useReactionRecorder({
    experienceContainerId,
    fromName,
    toName,
  });

  // Show permission prompt after a short delay
  useEffect(() => {
    if (!enabled || skipped || state !== "idle") return;

    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [enabled, skipped, state]);

  // Auto-start recording when ready
  useEffect(() => {
    if (state === "ready") {
      // Small delay then start
      const timer = setTimeout(startRecording, 500);
      return () => clearTimeout(timer);
    }
  }, [state, startRecording]);

  // Auto-stop on finale if requested
  useEffect(() => {
    if (autoStopOnFinale && state === "recording") {
      stopRecording();
    }
  }, [autoStopOnFinale, state, stopRecording]);

  const handleAllow = async () => {
    setShowPrompt(false);
    await requestPermission();
  };

  const handleSkip = () => {
    setShowPrompt(false);
    setSkipped(true);
  };

  // Don't render anything if not enabled or skipped
  if (!enabled || skipped || state === "unsupported") {
    return null;
  }

  const webcamStream = getWebcamStream();

  return (
    <>
      {/* Permission prompt */}
      <AnimatePresence>
        {showPrompt && (
          <RecordingPermissions
            state={state}
            error={error}
            onAllow={handleAllow}
            onSkip={handleSkip}
          />
        )}
      </AnimatePresence>

      {/* Webcam preview bubble */}
      {(state === "ready" || state === "recording") && (
        <WebcamBubble
          stream={webcamStream}
          isRecording={state === "recording"}
          duration={duration}
        />
      )}

      {/* Recording controls */}
      <RecordingControls
        state={state}
        duration={duration}
        downloadUrl={downloadUrl}
        onStart={startRecording}
        onStop={stopRecording}
      />
    </>
  );
}
