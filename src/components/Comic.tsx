"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface ComicData {
  imageUrl: string | null;
  altText: string;
  source: string | null;
  error?: string;
}

export default function Comic() {
  const [comic, setComic] = useState<ComicData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComic = async () => {
      try {
        const response = await fetch("/api/comic");
        const data = await response.json();
        setComic(data);
      } catch (error) {
        console.error("Error fetching comic:", error);
        setComic({
          imageUrl: null,
          altText: "Failed to load comic",
          source: null,
          error: "Comic unavailable",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchComic();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <div className="border-t-2 border-b-2 border-black py-8 text-center">
        <h2 className="text-2xl font-bold mb-6">Liminal Panels</h2>

        {loading ? (
          <div className="bg-gray-100 h-60 flex items-center justify-center text-gray-600">
            <p>Loading comic...</p>
          </div>
        ) : comic?.imageUrl ? (
          <div className="space-y-4">
            <div className="relative mx-auto max-w-full">
              <Image
                src={comic.imageUrl}
                alt={comic.altText}
                width={800}
                height={400}
                className="mx-auto rounded-lg"
                style={{ objectFit: "contain" }}
                unoptimized={true}
              />
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 h-60 flex items-center justify-center text-gray-600">
            <p>{comic?.error || "Unable to load comic"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
