"use client";

import type { CatFact, DogFact, TriviaFact } from "../types";

interface FactsProps {
  catFact?: CatFact;
  dogFact?: DogFact;
  triviaFact?: TriviaFact;
  loading?: boolean;
}

export default function Facts({
  catFact,
  dogFact,
  triviaFact,
  loading = false,
}: FactsProps) {
  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <div className="flex items-stretch h-auto">
        {/* Cat Fact */}
        <div className="flex-1 text-center px-4 flex flex-col min-h-full">
          <h3 className="text-xl font-bold mb-4">Meow Mix</h3>
          <div className="flex-1 flex items-center">
            <p className="text-sm leading-relaxed w-full">
              {loading
                ? "Loading cat wisdom..."
                : catFact?.fact || "No cat fact available"}
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className="w-px bg-[#262424] mx-4 self-stretch"></div>

        {/* Random Fact */}
        <div className="flex-1 text-center px-4 flex flex-col min-h-full">
          <h3 className="text-xl font-bold mb-4">Trivia Dump</h3>
          <div className="flex-1 flex items-center">
            <p className="text-sm leading-relaxed w-full">
              {loading
                ? "Gathering trivia..."
                : triviaFact?.fact || "No trivia available"}
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className="w-px bg-[#262424] mx-4 self-stretch"></div>

        {/* Dog Fact */}
        <div className="flex-1 text-center px-4 flex flex-col min-h-full">
          <h3 className="text-xl font-bold mb-4">Pup Culture</h3>
          <div className="flex-1 flex items-center">
            <p className="text-sm leading-relaxed w-full">
              {loading
                ? "Fetching dog facts..."
                : dogFact?.fact || "No dog fact available"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
