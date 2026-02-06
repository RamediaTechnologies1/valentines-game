"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { compressImage } from "@/lib/compress";

export interface PhotoItem {
  id: string;
  file: File;
  preview: string;
  caption: string;
  uploadedUrl: string | null;
  uploading: boolean;
  error: string | null;
}

interface PhotoUploaderProps {
  maxPhotos: number;
  photos: PhotoItem[];
  setPhotos: React.Dispatch<React.SetStateAction<PhotoItem[]>>;
}

export default function PhotoUploader({
  maxPhotos,
  photos,
  setPhotos,
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remaining = maxPhotos - photos.length;
    const toAdd = fileArray.slice(0, remaining);

    const newPhotos: PhotoItem[] = await Promise.all(
      toAdd.map(async (file) => {
        const compressed = await compressImage(file);
        return {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          file: compressed,
          preview: URL.createObjectURL(compressed),
          caption: "",
          uploadedUrl: null,
          uploading: false,
          error: null,
        };
      })
    );

    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  const updateCaption = (id: string, caption: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, caption } : p))
    );
  };

  const movePhoto = (id: string, direction: "up" | "down") => {
    setPhotos((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-white/60 text-sm font-medium">
          Photos ({photos.length}/{maxPhotos})
        </label>
        {photos.length > 0 && (
          <span className="text-white/30 text-xs">
            Drag to reorder • Tap to add caption
          </span>
        )}
      </div>

      {/* Upload area */}
      {photos.length < maxPhotos && (
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
            dragOver
              ? "border-rose-400 bg-rose-500/10"
              : "border-white/10 hover:border-white/20 bg-white/[0.02]"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="text-3xl mb-3">📸</div>
          <p className="text-white/50 text-sm">
            Tap to select photos or drag & drop
          </p>
          <p className="text-white/20 text-xs mt-1">
            JPG, PNG, WebP • Max 10MB each • {maxPhotos - photos.length} remaining
          </p>
        </div>
      )}

      {/* Photo grid */}
      <AnimatePresence mode="popLayout">
        {photos.map((photo, idx) => (
          <motion.div
            key={photo.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="relative flex gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]"
          >
            {/* Photo preview */}
            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white/5">
              <img
                src={photo.preview}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Order badge */}
              <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">{idx + 1}</span>
              </div>
            </div>

            {/* Caption + controls */}
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={photo.caption}
                onChange={(e) => updateCaption(photo.id, e.target.value)}
                placeholder={`Caption for memory ${idx + 1}...`}
                maxLength={120}
                className="w-full bg-transparent border-b border-white/10 pb-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-rose-500/40 transition-colors"
              />
              <div className="flex items-center gap-2 mt-2">
                {/* Reorder buttons */}
                <button
                  type="button"
                  onClick={() => movePhoto(photo.id, "up")}
                  disabled={idx === 0}
                  className="text-white/20 hover:text-white/50 disabled:opacity-20 text-xs transition-colors"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => movePhoto(photo.id, "down")}
                  disabled={idx === photos.length - 1}
                  className="text-white/20 hover:text-white/50 disabled:opacity-20 text-xs transition-colors"
                >
                  ↓
                </button>
                <span className="text-white/10 text-xs">|</span>
                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  className="text-white/20 hover:text-rose-400 text-xs transition-colors"
                >
                  Remove
                </button>
              </div>

              {/* Upload status */}
              {photo.uploading && (
                <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full animate-pulse w-2/3" />
                </div>
              )}
              {photo.error && (
                <p className="text-red-400 text-xs mt-1">{photo.error}</p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
