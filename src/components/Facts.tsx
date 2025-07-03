"use client";

/**
 * @file This file defines the Facts component, which displays various random facts.
 * It includes sections for cat facts, dog facts, and general trivia facts, with loading states.
 */

import type { CatFact, DogFact, TriviaFact } from "../types";

/**
 * Props for the Facts component.
 * @property {CatFact} [catFact] - The cat fact data to display.
 * @property {DogFact} [dogFact] - The dog fact data to display.
 * @property {TriviaFact} [triviaFact] - The trivia fact data to display.
 * @property {boolean} [loading=false] - Indicates if the facts are currently being loaded.
 */
interface FactsProps {
  catFact?: CatFact;
  dogFact?: DogFact;
  triviaFact?: TriviaFact;
  loading?: boolean;
}

/**
 * Facts component displays a collection of random facts.
 * It presents a cat fact, a general trivia fact, and a dog fact in a three-column layout.
 * Each section shows a loading message while data is being fetched and a fallback message if no fact is available.
 * @param {FactsProps} { catFact, dogFact, triviaFact, loading } - The props for the component.
 * @returns {JSX.Element} The JSX for the Facts component.
 */
export default function Facts({
  catFact,
  dogFact,
  triviaFact,
  loading = false,
}: FactsProps) {
  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <div className="flex items-stretch h-auto">
        {/* Cat Fact Section */}
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

        {/* Separator between fact sections */}
        <div className="w-px bg-[#262424] mx-4 self-stretch"></div>

        {/* Random Fact Section (Trivia) */}
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

        {/* Separator between fact sections */}
        <div className="w-px bg-[#262424] mx-4 self-stretch"></div>

        {/* Dog Fact Section */}
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
