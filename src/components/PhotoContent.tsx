"use client";

/**
 * @file This file defines the PhotoContent component, responsible for displaying the main featured photograph
 * and its caption for a daily edition in the Lumen Sigma application.
 * It handles image loading states and provides a fallback for when a photo cannot be loaded.
 */

import { useState, useEffect } from "react";
import Image from "next/image";
import type { PhotoData } from "../types";

/**
 * Props for the PhotoContent component.
 * @property {PhotoData} [photo] - The photo data to be displayed, including imageUrl and label.
 * @property {boolean} [loading=false] - Indicates if the photo data is currently being loaded from the parent component.
 */
interface PhotoContentProps {
  photo?: PhotoData;
  loading?: boolean;
}

/**
 * PhotoContent component displays a featured photograph and its associated caption.
 * It manages its own image loading state to prevent content from flashing and provides
 * visual feedback during loading or if the photo fails to load.
 * @param {PhotoContentProps} { photo, loading: propLoading } - The props for the component.
 * @returns {JSX.Element} The JSX for the PhotoContent component.
 */
export default function PhotoContent({
  photo,
  loading: propLoading = false,
}: PhotoContentProps) {
  /**
   * State to track if the image itself has finished loading.
   * This is separate from `propLoading` which indicates data fetching.
   * @type {boolean}
   */
  const [imageLoaded, setImageLoaded] = useState(false);

  /**
   * useEffect hook to reset the `imageLoaded` state whenever the `photo` prop changes.
   * This ensures that the loading indicator is shown correctly for new images.
   */
  useEffect(() => {
    setImageLoaded(false);
  }, [photo]);

  /**
   * Handles the `onLoad` event of the Image component.
   * Sets `imageLoaded` to true once the image has successfully loaded.
   */
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  /**
   * Handles the `onError` event of the Image component.
   * Sets `imageLoaded` to true even if there's an error, to prevent an infinite loading state.
   */
  const handleImageError = () => {
    setImageLoaded(true); // Consider it "loaded" even on error to prevent infinite loading
  };

  console.log("PhotoContent rendered with photo:", photo);

  return (
    <div className="h-full">
      <div className="space-y-6">
        {/* Display loading message if data is being fetched or image is not yet loaded. */}
        {propLoading || !imageLoaded ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-lg">Loading featured photo...</p>
          </div>
        ) : null}

        {/* Render the photo and label only if photo data exists and is not currently loading. */}
        {photo && (
          <div
            className={`space-y-4 ${
              propLoading || !imageLoaded ? "hidden" : "" // Hide content until both data and image are loaded
            }`}
          >
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src={photo.imageUrl} // Source URL of the image
                alt={photo.label} // Alt text for accessibility
                fill // Fill the parent container
                className="object-cover object-center mix-blend-multiply" // Styling for the image
                priority // Prioritize loading this image
                onLoad={handleImageLoad} // Callback when image loads successfully
                onError={handleImageError} // Callback when image fails to load
                sizes="(max-width: 768px) 100vw, (min-width: 769px) 50vw" // Image sizes for responsive loading
              />
            </div>
            <div className="space-y-2">
              <p className="text-lg leading-relaxed italic">{photo.label}</p>{" "}
              {/* Display the photo caption */}
            </div>
          </div>
        )}

        {/* Display error message if no photo data is available and not loading. */}
        {!photo && !propLoading && (
          <div className="flex items-center justify-center h-96">
            <p className="text-lg text-[#262424]">Failed to load photo</p>
          </div>
        )}
      </div>
    </div>
  );
}
