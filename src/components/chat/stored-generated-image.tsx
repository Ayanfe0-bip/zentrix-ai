"use client";

import { useEffect, useState } from "react";
import GeneratedImage from "@/components/chat/generated-image";
import { getGeneratedImage } from "@/lib/image-storage";

interface StoredGeneratedImageProps {
  imageId: string;
  prompt: string;
  mediaType?: string;
  onEdit?: (prompt: string) => void;
  onRegenerate?: () => void;
}

export default function StoredGeneratedImage({
  imageId,
  prompt,
  mediaType = "image/png",
  onEdit,
  onRegenerate,
}: StoredGeneratedImageProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl = "";

    async function loadImage() {
      try {
        setLoading(true);
        setError(false);

        const blob = await getGeneratedImage(imageId);

        if (!blob) {
          setError(true);
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      } catch (err) {
        console.error("Unable to load generated image:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadImage();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imageId]);

  if (loading) {
    return (
      <div className="my-5 flex min-h-48 w-full max-w-xl items-center justify-center rounded-2xl border border-violet-400/20 bg-[#111426]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400/20 border-t-violet-400" />
          <p className="text-xs text-slate-400">
            Loading your generated image...
          </p>
        </div>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className="my-5 max-w-xl rounded-2xl border border-red-400/20 bg-red-500/5 p-4 text-sm text-red-300">
        This generated image is no longer available in this browser.
      </div>
    );
  }

  return (
    <GeneratedImage
      image={imageUrl}
      prompt={prompt}
      mediaType={mediaType}
      onEdit={onEdit}
      onRegenerate={onRegenerate}
    />
  );
}
