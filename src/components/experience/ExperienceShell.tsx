"use client";

import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import type { ExperienceData } from "@/hooks/useExperience";
import { INTERACTION_TYPES } from "@/lib/constants";
import ParticleBackground from "./ParticleBackground";
import OpeningScene from "./OpeningScene";
import ScrollSection from "./ScrollSection";
import PhotoReveal from "./PhotoReveal";
import ProgressBar from "./ProgressBar";
import HeartCatchGame from "./HeartCatchGame";
import FinalScene from "./FinalScene";
import ReactionRecorder from "../recording/ReactionRecorder";

interface ExperienceShellProps {
  experience: ExperienceData;
}

export default function ExperienceShell({ experience }: ExperienceShellProps) {
  const { from_name, to_name, photos, final_letter, features } = experience;

  const [started, setStarted] = useState(false);
  const [completedSections, setCompletedSections] = useState<Set<number>>(
    new Set()
  );
  const [activeReveal, setActiveReveal] = useState<number | null>(null);
  const [gamePhase, setGamePhase] = useState<"memories" | "game" | "finale">("memories");

  const totalSections = photos.length;
  const allMemoriesCompleted = completedSections.size >= totalSections;

  // Assign interaction types to sections (cycling through available types)
  const getInteractionType = (index: number) => {
    const types = INTERACTION_TYPES;
    return types[index % types.length];
  };

  const handleStart = () => {
    setStarted(true);
    setTimeout(() => {
      const el = document.getElementById("section-0");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleReveal = useCallback((index: number) => {
    setActiveReveal(index);
    setCompletedSections((prev) => new Set(prev).add(index));
  }, []);

  const handleCloseReveal = useCallback(() => {
    const currentIndex = activeReveal;
    setActiveReveal(null);

    if (currentIndex !== null) {
      setTimeout(() => {
        // If this was the last memory, scroll to game section
        const isLastMemory = currentIndex === totalSections - 1;
        if (isLastMemory) {
          // Small delay to let state update, then scroll to game
          setTimeout(() => {
            const gameEl = document.getElementById("game-section");
            if (gameEl) gameEl.scrollIntoView({ behavior: "smooth" });
          }, 200);
        } else {
          const nextEl = document.getElementById(`section-${currentIndex + 1}`);
          if (nextEl) nextEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
    }
  }, [activeReveal, totalSections]);

  const handleGameComplete = () => {
    setGamePhase("finale");
    setTimeout(() => {
      const finalEl = document.getElementById("final-scene");
      if (finalEl) finalEl.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleReplay = () => {
    setStarted(false);
    setCompletedSections(new Set());
    setActiveReveal(null);
    setGamePhase("memories");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div id="experience-container" className="relative min-h-screen no-select">
      <ParticleBackground />

      {/* Reaction recorder — only for tiers with recording */}
      <ReactionRecorder
        experienceContainerId="experience-container"
        fromName={from_name}
        toName={to_name}
        enabled={started && features.reactionRecording}
        autoStopOnFinale={gamePhase === "finale"}
      />

      {/* Opening */}
      <OpeningScene
        fromName={from_name}
        toName={to_name}
        onStart={handleStart}
      />

      {/* Memory sections */}
      {started && (
        <>
          {photos.map((photo, i) => (
            <div key={i} id={`section-${i}`}>
              <ScrollSection
                index={i}
                total={totalSections}
                interactionType={getInteractionType(i)}
                isCompleted={completedSections.has(i)}
                onReveal={() => handleReveal(i)}
              />
            </div>
          ))}

          {/* Heart Catch Game — appears after all memories are completed */}
          <div id="game-section">
            {allMemoriesCompleted && gamePhase === "memories" && (
              <HeartCatchGame
                fromName={from_name}
                toName={to_name}
                onComplete={handleGameComplete}
              />
            )}
            {gamePhase === "game" && (
              <HeartCatchGame
                fromName={from_name}
                toName={to_name}
                onComplete={handleGameComplete}
              />
            )}
          </div>

          {/* Final scene — unlocked after game is won */}
          <div id="final-scene">
            <FinalScene
              fromName={from_name}
              toName={to_name}
              letter={final_letter}
              isUnlocked={gamePhase === "finale"}
              onReplay={handleReplay}
            />
          </div>

          {/* Progress bar — hide during game and finale */}
          {gamePhase === "memories" && !allMemoriesCompleted && (
            <ProgressBar
              total={totalSections}
              completed={completedSections.size}
            />
          )}
        </>
      )}

      {/* Photo reveal modal */}
      <PhotoReveal
        photo={activeReveal !== null ? photos[activeReveal] : null}
        isOpen={activeReveal !== null}
        onClose={handleCloseReveal}
        index={activeReveal || 0}
        total={totalSections}
      />
    </div>
  );
}
