"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import PhotoUploader, { type PhotoItem } from "./PhotoUploader";
import { TIERS, type TierName } from "@/lib/tiers";

interface IntakeFormProps {
  token: string;
  tier: TierName;
  email: string;
  expressDelivery: boolean;
}

export default function IntakeForm({
  token,
  tier,
  email,
  expressDelivery,
}: IntakeFormProps) {
  const router = useRouter();
  const tierConfig = TIERS[tier];

  const [fromName, setFromName] = useState("");
  const [toName, setToName] = useState("");
  const [finalLetter, setFinalLetter] = useState("");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: names, 2: photos, 3: letter

  const canProceedStep1 = fromName.trim().length > 0 && toName.trim().length > 0;
  const canProceedStep2 = photos.length > 0 && photos.every((p) => p.caption.trim().length > 0);
  const canSubmit = canProceedStep1 && canProceedStep2 && finalLetter.trim().length > 0;

  const uploadPhotos = async (): Promise<
    Array<{ url: string; caption: string; order: number }>
  > => {
    const uploaded = [];

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];

      // Update status
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photo.id ? { ...p, uploading: true, error: null } : p
        )
      );

      const formData = new FormData();
      formData.append("file", photo.file);
      formData.append("token", token);
      formData.append("index", String(i));

      const res = await fetch("/api/upload-photo", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photo.id
              ? { ...p, uploading: false, error: "Upload failed" }
              : p
          )
        );
        throw new Error(`Failed to upload photo ${i + 1}`);
      }

      const data = await res.json();

      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photo.id
            ? { ...p, uploading: false, uploadedUrl: data.url }
            : p
        )
      );

      uploaded.push({
        url: data.url,
        caption: photo.caption,
        order: i,
      });
    }

    return uploaded;
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      // Step 1: Upload all photos
      const uploadedPhotos = await uploadPhotos();

      // Step 2: Create experience
      const res = await fetch("/api/create-experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          fromName: fromName.trim(),
          toName: toName.trim(),
          finalLetter: finalLetter.trim(),
          photos: uploadedPhotos,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create experience");
      }

      // Redirect to ready page
      router.push(`/ready?slug=${data.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress steps */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => {
                if (s < step) setStep(s);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s === step
                  ? "bg-rose-500 text-white"
                  : s < step
                  ? "bg-rose-500/20 text-rose-400 cursor-pointer"
                  : "bg-white/5 text-white/20"
              }`}
            >
              {s < step ? "✓" : s}
            </button>
            {s < 3 && (
              <div
                className={`w-12 h-0.5 ${
                  s < step ? "bg-rose-500/30" : "bg-white/5"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Tier badge */}
      <div className="text-center mb-8">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
          {tierConfig.label} Tier — {tierConfig.maxPhotos} photos
        </span>
      </div>

      {/* Step 1: Names */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <h2
              className="text-2xl font-bold text-white mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Who is this for?
            </h2>
            <p className="text-white/40 text-sm">
              These names will appear throughout the experience
            </p>
          </div>

          <div>
            <label className="text-white/60 text-sm font-medium block mb-2">
              Your name
            </label>
            <input
              type="text"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="e.g. Jake"
              maxLength={30}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-rose-500/40 transition-colors"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm font-medium block mb-2">
              Their name
            </label>
            <input
              type="text"
              value={toName}
              onChange={(e) => setToName(e.target.value)}
              placeholder="e.g. Emma"
              maxLength={30}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-rose-500/40 transition-colors"
            />
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!canProceedStep1}
            className="w-full py-3.5 rounded-full font-semibold text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02]"
            style={{
              background: canProceedStep1
                ? "linear-gradient(135deg, #f43f5e, #e11d48)"
                : undefined,
              backgroundColor: !canProceedStep1 ? "rgba(255,255,255,0.05)" : undefined,
            }}
          >
            Next — Add Photos →
          </button>
        </motion.div>
      )}

      {/* Step 2: Photos */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <h2
              className="text-2xl font-bold text-white mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Your favorite memories
            </h2>
            <p className="text-white/40 text-sm">
              Upload photos and add a caption to each one
            </p>
          </div>

          <PhotoUploader
            maxPhotos={tierConfig.maxPhotos}
            photos={photos}
            setPhotos={setPhotos}
          />

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3.5 rounded-full font-medium text-white/50 border border-white/10 hover:border-white/20 transition-all"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!canProceedStep2}
              className="flex-[2] py-3.5 rounded-full font-semibold text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02]"
              style={{
                background: canProceedStep2
                  ? "linear-gradient(135deg, #f43f5e, #e11d48)"
                  : undefined,
                backgroundColor: !canProceedStep2
                  ? "rgba(255,255,255,0.05)"
                  : undefined,
              }}
            >
              Next — Write Letter →
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Love letter */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <h2
              className="text-2xl font-bold text-white mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Your love letter
            </h2>
            <p className="text-white/40 text-sm">
              This will be the grand finale — revealed after all memories
            </p>
          </div>

          <div>
            <textarea
              value={finalLetter}
              onChange={(e) => setFinalLetter(e.target.value)}
              placeholder={`Dear ${toName || "them"},\n\nWrite something from the heart...`}
              maxLength={2000}
              rows={8}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-rose-500/40 transition-colors resize-none"
              style={{ fontFamily: "var(--font-display)" }}
            />
            <div className="text-right mt-1">
              <span className="text-white/20 text-xs">
                {finalLetter.length}/2000
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-2">
            <h4 className="text-white/60 text-sm font-medium">Summary</h4>
            <div className="text-white/30 text-sm space-y-1">
              <p>
                From <span className="text-white/60">{fromName}</span> to{" "}
                <span className="text-white/60">{toName}</span>
              </p>
              <p>
                <span className="text-white/60">{photos.length}</span> photo
                {photos.length !== 1 ? "s" : ""} with captions
              </p>
              <p>
                Delivery:{" "}
                <span className="text-white/60">
                  {expressDelivery
                    ? "Express (within minutes)"
                    : "Standard (~30 min)"}
                </span>
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              disabled={submitting}
              className="flex-1 py-3.5 rounded-full font-medium text-white/50 border border-white/10 hover:border-white/20 transition-all disabled:opacity-30"
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="flex-[2] py-3.5 rounded-full font-semibold text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02]"
              style={{
                background:
                  canSubmit && !submitting
                    ? "linear-gradient(135deg, #f43f5e, #e11d48)"
                    : undefined,
                backgroundColor:
                  !canSubmit || submitting
                    ? "rgba(255,255,255,0.05)"
                    : undefined,
              }}
            >
              {submitting ? (
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
                  Creating magic...
                </span>
              ) : (
                "Create Experience ✨"
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
