import imageCompression from "browser-image-compression";

const compressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: "image/webp" as const,
};

export async function compressImage(file: File): Promise<File> {
  try {
    const compressed = await imageCompression(file, compressionOptions);
    return compressed;
  } catch (error) {
    console.warn("Image compression failed, using original:", error);
    return file;
  }
}
