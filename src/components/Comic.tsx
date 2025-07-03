"use client";

import Image from "next/image";
import type { ComicPanel } from "../types";

interface ComicProps {
  comic?: ComicPanel;
  loading?: boolean;
}

export default function Comic({ comic, loading = false }: ComicProps) {
  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <div className="border-t-2 border-b-2 border-[#262424] py-8 text-center">
        <h2 className="text-2xl font-bold mb-6">Liminal Panels</h2>

        {loading ? (
          <div className="bg-[#eee5da] h-60 flex items-center justify-center text-[#262424]">
            <p>Loading comic...</p>
          </div>
        ) : comic?.imageUrl ? (
          <div className="space-y-4">
            <div className="relative mx-auto max-w-full">
              <Image
                src={comic.imageUrl}
                alt={comic.altText || "Comic panel"}
                width={800}
                height={400}
                className="mx-auto rounded-lg object-contain w-4/5 h-auto mix-blend-multiply"
                unoptimized={true}
              />
            </div>
          </div>
        ) : (
          <div className="bg-[#eee5da] h-60 flex items-center justify-center text-[#262424]">
            <p>Unable to load comic</p>
          </div>
        )}
      </div>
    </div>
  );
}
