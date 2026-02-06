"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import IntakeForm from "@/components/create/IntakeForm";
import type { TierName } from "@/lib/tiers";

interface TokenData {
  valid: boolean;
  tier: TierName;
  email: string;
  expressDelivery: boolean;
  token: string;
}

export default function CreateClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<TokenData | null>(null);
  const [alreadyUsedSlug, setAlreadyUsedSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("No creation token found. Please purchase first at ramedia.com.");
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/verify-token?token=${token}`);
        const data = await res.json();

        if (res.status === 409 && data.alreadyUsed) {
          setAlreadyUsedSlug(data.slug);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          setError(data.error || "Invalid token");
          setLoading(false);
          return;
        }

        setSession(data);
      } catch {
        setError("Failed to verify your purchase. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div
            className="text-4xl mb-4"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✨
          </motion.div>
          <p className="text-white/30 text-sm">Verifying your purchase...</p>
        </motion.div>
      </main>
    );
  }

  if (alreadyUsedSlug) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-6">
        <motion.div className="text-center max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-4xl mb-4">💕</div>
          <h1 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Already created!
          </h1>
          <p className="text-white/40 text-sm mb-6">
            Your experience has already been created. Here&apos;s your link:
          </p>
          <a
            href={`${appUrl}/v/${alreadyUsedSlug}`}
            className="inline-block px-6 py-3 rounded-full text-sm font-semibold text-white mb-4"
            style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}
          >
            View Experience 💕
          </a>
        </motion.div>
      </main>
    );
  }

  if (error || !session) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-6">
        <motion.div className="text-center max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-4xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>
            {error || "Something went wrong"}
          </h1>
          <a
            href={process.env.NEXT_PUBLIC_WP_URL || "https://ramedia.com"}
            className="inline-block px-6 py-3 rounded-full text-sm font-semibold text-white mt-4"
            style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}
          >
            Go to Store →
          </a>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-12">
      <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-3xl">✦</span>
        <h1 className="text-2xl font-bold text-white mt-3" style={{ fontFamily: "var(--font-display)" }}>
          Create your experience
        </h1>
        <p className="text-white/30 text-sm mt-2">
          This takes about 5 minutes. Make it count.
        </p>
      </motion.div>

      <IntakeForm
        token={session.token}
        tier={session.tier}
        email={session.email}
        expressDelivery={session.expressDelivery}
      />
    </main>
  );
}
