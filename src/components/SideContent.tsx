"use client";

import type { Poem, Joke } from "../types";

interface SideContentProps {
  poem?: Poem;
  joke?: Joke;
  loading?: boolean;
}

export default function SideContent({ poem, joke, loading = false }: SideContentProps) {


  {
    /* get it? Light – Lumen haha I am a friggin genius */
  }

  return (
    <div className="h-full">
      <h3 className="text-2xl font-bold mb-4">Sidebar</h3>
      <div className="space-y-4">
        {/* Poem of the Day */}
        <div className="pb-4">
          <h4 className="font-semibold mb-2">Light Verse</h4>
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

        {/* Joke of the Day */}
        <div>
          <h4 className="font-semibold mb-2">Light Damage</h4>
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
