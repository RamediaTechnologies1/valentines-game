"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { APP_URL } from "@/lib/constants";

export default function ReadyPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const [copied, setCopied] = useState(false);
  const [experience, setExperience] = useState<{
    from_name: string;
    to_name: string;
    tier: string;
    delivery_time: string;
    express_delivery: boolean;
  } | null>(null);

  const linkUrl = `${APP_URL}/v/${slug}`;

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      try {
        const res = await fetch(`/api/experience/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setExperience(data);
        }
      } catch {
        // Silently fail — the page still works without the extra details
      }
    };

    load();
  }, [slug]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(linkUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = linkUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareWhatsApp = () => {
    const text = `I made something special for you 💕 Open this link: ${linkUrl}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const shareMessage = () => {
    const text = `I made something special for you 💕 ${linkUrl}`;
    window.open(`sms:?body=${encodeURIComponent(text)}`);
  };

  if (!slug) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <p className="text-white/40">No experience found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <motion.div
        className="max-w-md w-full text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Success animation */}
        <motion.div
          className="text-6xl mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        >
          💕
        </motion.div>

        <h1
          className="text-3xl font-bold text-white mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          It&apos;s ready!
        </h1>

        {experience && (
          <p className="text-white/40 mb-8">
            {experience.from_name}&apos;s gift for{" "}
            <span className="text-rose-400">{experience.to_name}</span> is
            live
          </p>
        )}

        {/* Link display */}
        <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] mb-6">
          <p className="text-white/30 text-xs mb-2">Their personalized link</p>
          <p className="text-white font-mono text-sm break-all mb-4">
            {linkUrl}
          </p>

          <button
            onClick={handleCopy}
            className="w-full py-3 rounded-full font-semibold text-white transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: copied
                ? "linear-gradient(135deg, #22c55e, #16a34a)"
                : "linear-gradient(135deg, #f43f5e, #e11d48)",
            }}
          >
            {copied ? "Copied! ✓" : "Copy Link"}
          </button>
        </div>

        {/* Share options */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            onClick={shareWhatsApp}
            className="py-3 rounded-xl border border-white/10 bg-white/[0.02] text-white/60 text-sm font-medium hover:border-green-500/30 hover:text-green-400 transition-all"
          >
            📱 WhatsApp
          </button>
          <button
            onClick={shareMessage}
            className="py-3 rounded-xl border border-white/10 bg-white/[0.02] text-white/60 text-sm font-medium hover:border-blue-500/30 hover:text-blue-400 transition-all"
          >
            💬 iMessage
          </button>
        </div>

        {/* Delivery info */}
        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-rose-400 text-sm">📧</span>
            <span className="text-white/50 text-sm font-medium">
              Email delivery
            </span>
          </div>
          <p className="text-white/30 text-xs">
            {experience?.express_delivery
              ? "An email with the link will be sent to you within minutes."
              : "An email with the link will be sent to you within 30 minutes."}
          </p>
          <p className="text-white/20 text-xs mt-1">
            You can also share the link above directly — it&apos;s already live!
          </p>
        </div>

        {/* Preview link */}
        <a
          href={`/v/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-rose-400/60 hover:text-rose-400 text-sm transition-colors"
        >
          Preview the experience →
        </a>
      </motion.div>
    </main>
  );
}
