"use client";

import { useState, useEffect } from "react";

export default function Facts() {
  const [catFact, setCatFact] = useState<string>("");
  const [triviaFact, setTriviaFact] = useState<string>("");
  const [dogFact, setDogFact] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacts = async () => {
      try {
        // Fetch all facts in parallel
        const [catResponse, triviaResponse, dogResponse] = await Promise.all([
          fetch("/api/cat-fact"),
          fetch("/api/trivia-fact"),
          fetch("/api/dog-fact"),
        ]);

        const [catData, triviaData, dogData] = await Promise.all([
          catResponse.json(),
          triviaResponse.json(),
          dogResponse.json(),
        ]);

        setCatFact(catData.fact);
        setTriviaFact(triviaData.fact);
        setDogFact(dogData.fact);
      } catch (error) {
        console.error("Error fetching facts:", error);
        // Set fallback facts
        setCatFact(
          "Cats have a third eyelid called a nictitating membrane that helps protect their eyes during hunting and play."
        );
        setTriviaFact(
          "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible."
        );
        setDogFact(
          "Dogs have around 300 million olfactory receptors in their noses, compared to humans who have about 6 million."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFacts();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <div className="flex items-stretch h-auto">
        {/* Cat Fact */}
        <div className="flex-1 text-center px-4 flex flex-col min-h-full">
          <h3 className="text-xl font-bold mb-4">Meow Mix</h3>
          <div className="flex-1 flex items-center">
            <p className="text-sm leading-relaxed w-full">
              {loading ? "Loading cat wisdom..." : catFact}
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className="w-px bg-black mx-4 self-stretch"></div>

        {/* Random Fact */}
        <div className="flex-1 text-center px-4 flex flex-col min-h-full">
          <h3 className="text-xl font-bold mb-4">Trivia Dump</h3>
          <div className="flex-1 flex items-center">
            <p className="text-sm leading-relaxed w-full">
              {loading ? "Gathering trivia..." : triviaFact}
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className="w-px bg-black mx-4 self-stretch"></div>

        {/* Dog Fact */}
        <div className="flex-1 text-center px-4 flex flex-col min-h-full">
          <h3 className="text-xl font-bold mb-4">Pup Culture</h3>
          <div className="flex-1 flex items-center">
            <p className="text-sm leading-relaxed w-full">
              {loading ? "Fetching dog facts..." : dogFact}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
