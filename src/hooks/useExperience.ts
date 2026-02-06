"use client";

import { useEffect, useState } from "react";

export interface ExperiencePhoto {
  url: string;
  caption: string;
  order: number;
}

export interface ExperienceData {
  id: string;
  slug: string;
  tier: string;
  from_name: string;
  to_name: string;
  final_letter: string;
  photos: ExperiencePhoto[];
  features: {
    tier: string;
    maxPhotos: number;
    reactionRecording: boolean;
    hostingDays: number;
  };
  expires_at: string;
  created_at: string;
}

export function useExperience(slug: string) {
  const [data, setData] = useState<ExperienceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError("No experience found");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(`/api/experience/${slug}`);
        const json = await res.json();

        if (res.status === 410) {
          setError("This experience has expired");
          return;
        }

        if (!res.ok) {
          setError(json.error || "Experience not found");
          return;
        }

        const photos = (json.photos || []).sort(
          (a: ExperiencePhoto, b: ExperiencePhoto) => a.order - b.order
        );

        setData({ ...json, photos });
      } catch {
        setError("Failed to load experience");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  return { data, loading, error };
}
