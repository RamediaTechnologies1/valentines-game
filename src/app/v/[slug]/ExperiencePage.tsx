"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useExperience } from "@/hooks/useExperience";
import ExperienceShell from "@/components/experience/ExperienceShell";

export default function ExperiencePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data, loading, error } = useExperience(slug);

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="text-4xl mb-4"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            💕
          </motion.div>
          <p className="text-white/30 text-sm">Preparing something special...</p>
        </motion.div>
      </main>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-6">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-4xl mb-4">😔</div>
          <h1
            className="text-2xl font-bold text-white mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {error === "This experience has expired"
              ? "This experience has expired"
              : "Experience not found"}
          </h1>
          <p className="text-white/40 text-sm mb-6">
            {error === "This experience has expired"
              ? "This love story has reached its end date."
              : "This link may be invalid or no longer available."}
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 rounded-full text-sm font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, #f43f5e, #e11d48)",
            }}
          >
            Create Your Own 💕
          </a>
        </motion.div>
      </main>
    );
  }

  return <ExperienceShell experience={data} />;
}
