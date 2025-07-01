"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useLoading } from "../contexts/LoadingContext";

interface PhotoData {
  imageUrl: string;
  label: string;
}

export default function PhotoContent() {
  const [photo, setPhoto] = useState<PhotoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { setComponentLoading } = useLoading();

  useEffect(() => {
    setComponentLoading("photo", true);

    const fetchPhoto = async () => {
      try {
        const response = await fetch("/api/photo");
        const data = await response.json();
        setPhoto(data);
        // Reset image loaded state when new photo is fetched
        setImageLoaded(false);
      } catch (error) {
        console.error("Error fetching photo:", error);
        setPhoto({
          imageUrl: "https://picsum.photos/800/600?random=fallback",
          label:
            "A beautiful moment captured in time, showcasing the art of photography.",
        });
        setImageLoaded(false);
      } finally {
        setLoading(false);
        // Note: Don't set setComponentLoading(false) here - wait for image to load
      }
    };

    fetchPhoto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // setComponentLoading is stable with useCallback

  // Update global loading state when both API and image are loaded
  useEffect(() => {
    if (!loading && imageLoaded) {
      setComponentLoading("photo", false);
    }
  }, [loading, imageLoaded, setComponentLoading]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageLoaded(true); // Consider it "loaded" even on error to prevent infinite loading
  };

  return (
    <div className="h-full">
      <div className="space-y-6">
        {loading || !imageLoaded ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-lg">Loading featured photo...</p>
          </div>
        ) : null}

        {photo && (
          <div
            className={`space-y-4 ${loading || !imageLoaded ? "hidden" : ""}`}
          >
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src={photo.imageUrl}
                alt={photo.label}
                fill
                className="object-cover object-center"
                priority
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>
            <div className="space-y-2">
              <p className="text-lg leading-relaxed italic">{photo.label}</p>
            </div>
          </div>
        )}

        {!photo && !loading && (
          <div className="flex items-center justify-center h-96">
            <p className="text-lg text-gray-500">Failed to load photo</p>
          </div>
        )}
      </div>
    </div>
  );
}
