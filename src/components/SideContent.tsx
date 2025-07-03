"use client";

/**
 * @file This file defines the SideContent component, which displays supplementary content
 * like a poem and a joke, typically in a sidebar or secondary content area.
 * It handles loading states and displays fallback messages if content is unavailable.
 */

import type { Poem, Joke } from "../types";

/**
 * Props for the SideContent component.
 * @property {Poem} [poem] - The poem data to be displayed, including title, author, and lines.
 * @property {Joke} [joke] - The joke data to be displayed, which can be single-part or two-part.
 * @property {boolean} [loading=false] - Indicates if the content is currently being loaded.
 */
interface SideContentProps {
  poem?: Poem;
  joke?: Joke;
  loading?: boolean;
}

/**
 * SideContent component displays a poem and a joke.
 * It shows loading indicators while data is being fetched and fallback messages if content is not available.
 * @param {SideContentProps} { poem, joke, loading } - The props for the component.
 * @returns {JSX.Element} The JSX for the SideContent component.
 */
export default function SideContent({
  poem,
  joke,
  loading = false,
}: SideContentProps) {
  return (
    <div className="h-full">
      <h3 className="text-2xl font-bold mb-4">Sidebar</h3>
      <div className="space-y-4">
        {/* Poem of the Day Section */}
        <div className="pb-4">
          <h4 className="font-semibold mb-2">Versetile</h4>
          {loading ? (
            <p>Loading...</p>
          ) : poem ? (
            <div>
              <h5 className="font-medium text-lg">{poem.title}</h5>
              <p className="text-sm mb-2">by {poem.author}</p>
              <div className="">
                {poem.lines.map((line, index) => (
                  <p key={index} className="text-sm italic">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm">Failed to load poem</p>
          )}
        </div>

        {/* Joke of the Day Section */}
        <div>
          <h4 className="font-semibold mb-2">Chuckular</h4>
          {loading ? (
            <p className="text-sm">Loading...</p>
          ) : joke ? (
            <div className="text-sm">
              {joke.type === "single" ? (
                <p>{joke.joke}</p>
              ) : (
                <p>
                  {joke.setup}
                  <br />
                  <span className="italic">{joke.delivery}</span>
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm">Failed to load joke</p>
          )}
        </div>
      </div>
    </div>
  );
}
