"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type RecordingState =
  | "idle"
  | "requesting"
  | "ready"
  | "recording"
  | "processing"
  | "complete"
  | "error"
  | "unsupported";

interface UseReactionRecorderOptions {
  experienceContainerId: string;
  fromName: string;
  toName: string;
}

export function useReactionRecorder({
  experienceContainerId,
  fromName,
  toName,
}: UseReactionRecorderOptions) {
  const [state, setState] = useState<RecordingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  const webcamStreamRef = useRef<MediaStream | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Canvas dimensions (portrait mobile)
  const CANVAS_W = 720;
  const CANVAS_H = 1280;
  const HALF_H = CANVAS_H / 2;

  // Check browser support
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setState("unsupported");
    }
  }, []);

  // Request camera permissions
  const requestPermission = useCallback(async () => {
    setState("requesting");
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: true,
      });

      webcamStreamRef.current = stream;

      // Create hidden video element for webcam
      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();
      webcamVideoRef.current = video;

      // Set up canvas
      const canvas = document.createElement("canvas");
      canvas.width = CANVAS_W;
      canvas.height = CANVAS_H;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      canvasRef.current = canvas;
      ctxRef.current = ctx;

      setState("ready");
    } catch (err) {
      console.error("Camera permission error:", err);
      setError(
        "Camera access denied. Please allow camera access to record your reaction."
      );
      setState("error");
    }
  }, []);

  // Compositing frame - draws experience + webcam side by side
  const drawFrame = useCallback(() => {
    const ctx = ctxRef.current;
    const webcamVideo = webcamVideoRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !webcamVideo || !canvas) return;

    // Clear
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // --- Top half: Screenshot of experience ---
    // We capture the experience via html2canvas-style approach
    // For performance, we capture the visible viewport
    const experienceEl = document.getElementById(experienceContainerId);
    if (experienceEl) {
      // Use a simpler approach: capture the viewport as-is
      // We draw a placeholder with text for now since real DOM capture
      // would need html2canvas which is heavy
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, CANVAS_W, HALF_H);

      // Draw text showing it's the experience view
      ctx.fillStyle = "rgba(244, 63, 94, 0.15)";
      ctx.fillRect(0, HALF_H - 40, CANVAS_W, 2);
    }

    // --- Bottom half: Webcam feed ---
    if (webcamVideo.readyState >= 2) {
      // Calculate aspect ratio crop for webcam
      const vw = webcamVideo.videoWidth;
      const vh = webcamVideo.videoHeight;
      const targetAspect = CANVAS_W / HALF_H;
      const videoAspect = vw / vh;

      let sx = 0,
        sy = 0,
        sw = vw,
        sh = vh;
      if (videoAspect > targetAspect) {
        sw = vh * targetAspect;
        sx = (vw - sw) / 2;
      } else {
        sh = vw / targetAspect;
        sy = (vh - sh) / 2;
      }

      // Mirror the webcam (selfie mode)
      ctx.save();
      ctx.translate(CANVAS_W, HALF_H);
      ctx.scale(-1, 1);
      ctx.drawImage(webcamVideo, sx, sy, sw, sh, 0, 0, CANVAS_W, HALF_H);
      ctx.restore();
    }

    // --- Overlay: Names + border ---
    // Top label
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, CANVAS_W, 36);
    ctx.fillStyle = "rgba(244, 63, 94, 0.8)";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `${fromName} & ${toName} — LoveScroll`,
      CANVAS_W / 2,
      24
    );

    // Divider line
    ctx.fillStyle = "rgba(244, 63, 94, 0.3)";
    ctx.fillRect(0, HALF_H - 1, CANVAS_W, 2);

    // Section labels
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Their Experience", 12, HALF_H - 8);
    ctx.fillText("Their Reaction", 12, HALF_H + 16);

    frameRef.current = requestAnimationFrame(drawFrame);
  }, [experienceContainerId, fromName, toName, CANVAS_W, CANVAS_H, HALF_H]);

  // Start recording
  const startRecording = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ctxRef.current) return;

    setState("recording");
    chunksRef.current = [];
    startTimeRef.current = Date.now();
    setDuration(0);

    // Start compositing loop
    frameRef.current = requestAnimationFrame(drawFrame);

    // Start MediaRecorder on canvas stream
    const canvasStream = canvas.captureStream(24); // 24fps

    // Add audio from webcam if available
    const webcamStream = webcamStreamRef.current;
    if (webcamStream) {
      const audioTracks = webcamStream.getAudioTracks();
      audioTracks.forEach((track) => canvasStream.addTrack(track));
    }

    // Determine best codec
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
      ? "video/webm;codecs=vp8,opus"
      : MediaRecorder.isTypeSupported("video/mp4")
      ? "video/mp4"
      : "video/webm";

    const recorder = new MediaRecorder(canvasStream, {
      mimeType,
      videoBitsPerSecond: 2500000, // 2.5 Mbps
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      setState("processing");

      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setState("complete");
    };

    recorder.start(1000); // collect data every second
    recorderRef.current = recorder;

    // Duration timer
    durationIntervalRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, [drawFrame]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    stopRecording();
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
  }, [stopRecording, downloadUrl]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Get webcam stream for preview bubble
  const getWebcamStream = useCallback(() => {
    return webcamStreamRef.current;
  }, []);

  return {
    state,
    error,
    downloadUrl,
    duration,
    requestPermission,
    startRecording,
    stopRecording,
    cleanup,
    getWebcamStream,
  };
}
