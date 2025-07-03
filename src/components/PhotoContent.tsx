"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { PhotoData } from "../types";

interface PhotoContentProps {
  photo?: PhotoData;
  loading?: boolean;
}

export default function PhotoContent({
  photo,
  loading: propLoading = false,
}: PhotoContentProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset image loaded state when photo changes
  useEffect(() => {
    setImageLoaded(false);
  }, [photo]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageLoaded(true); // Consider it "loaded" even on error to prevent infinite loading
  };

  console.log("PhotoContent rendered with photo:", photo);

  return (
    <div className="h-full">
      <div className="space-y-6">
        {propLoading || !imageLoaded ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-lg">Loading featured photo...</p>
          </div>
        ) : null}

        {photo && (
          <div
            className={`space-y-4 ${
              propLoading || !imageLoaded ? "hidden" : ""
            }`}
          >
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src={photo.imageUrl}
                alt={photo.label}
                fill
                className="object-cover object-center mix-blend-multiply"
                priority
                onLoad={handleImageLoad}
                onError={handleImageError}
                sizes="(max-width: 768px) 100vw, (min-width: 769px) 50vw"
              />
            </div>
            <div className="space-y-2">
              <p className="text-lg leading-relaxed italic">{photo.label}</p>
            </div>
          </div>
        )}

        {!photo && !propLoading && (
          <div className="flex items-center justify-center h-96">
            <p className="text-lg text-[#262424]">Failed to load photo</p>
          </div>
        )}
      </div>
    </div>
  );
}
