"use client";

import { useState, useEffect } from "react";
import { useLoading } from "../contexts/LoadingContext";

interface Poem {
  title: string;
  author: string;
  lines: string[];
  linecount: string;
}

interface JokeSingle {
  type: "single";
  joke: string;
}

interface JokeTwoPart {
  type: "twopart";
  setup: string;
  delivery: string;
}

type Joke = JokeSingle | JokeTwoPart;

export default function SideContent() {
  const [poem, setPoem] = useState<Poem | null>(null);
  const [joke, setJoke] = useState<Joke | null>(null);
  const [loading, setLoading] = useState(true);
  const { setComponentLoading } = useLoading();

  useEffect(() => {
    setComponentLoading("sideContent", true);

    const fetchContent = async () => {
      try {
        // Fetch poem from our API route
        const poemResponse = await fetch("/api/poem");
        const poemData = await poemResponse.json();
        setPoem(poemData);

        // Fetch joke from our API route
        const jokeResponse = await fetch("/api/joke");
        const jokeData = await jokeResponse.json();
        setJoke(jokeData);
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
        setComponentLoading("sideContent", false);
      }
    };

    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // setComponentLoading is stable with useCallback

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
