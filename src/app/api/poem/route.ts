/**
 * @file This file defines the API route for fetching a random poem from the PoetryDB API.
 * It handles GET requests and returns a poem with a randomly determined line count,
 * including its title, author, and cleaned lines.
 */

import { NextResponse } from "next/server";

/**
 * Handles GET requests to the poem API route.
 * Fetches a random poem from PoetryDB with a line count between 3 and 13.
 * Cleans up the poem lines by removing underscores and replacing double hyphens with an en dash.
 * Returns the poem's title, author, and cleaned lines in a structured JSON format.
 * If the API call fails or no poems are found, it returns a default poem.
 * @returns {Promise<NextResponse>} A JSON response containing the poem data or an error message.
 */
export async function GET() {
  try {
    // Generate a random line count between 3 and 13 (inclusive).
    const lineCount = Math.floor(Math.random() * 11) + 3;
    // Fetch poems from PoetryDB based on the generated line count.
    const response = await fetch(`https://poetrydb.org/linecount/${lineCount}`);

    if (!response.ok) {
      // If the response is not OK (e.g., 404, 500), throw an error.
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const poemData = await response.json();

    // Check if the response contains an array of poems and if it's not empty.
    if (Array.isArray(poemData) && poemData.length > 0) {
      // Select a random poem from the fetched list.
      const randomPoem = poemData[Math.floor(Math.random() * poemData.length)];

      // Clean up the poem lines: remove underscores and replace "--" with "–" and filter out blank lines.
      const cleanedLines = randomPoem.lines
        .map((line: string) => line.replace(/_/g, "").replace(/--/g, "–"))
        .filter((line: string) => line.trim() !== "");

      // Return the cleaned poem data.
      return NextResponse.json({
        title: randomPoem.title,
        author: randomPoem.author,
        lines: cleanedLines,
      });
    } else {
      // If no poems are found for the given criteria, throw an error.
      throw new Error("No poems found");
    }
  } catch (error) {
    console.error("Error fetching poem:", error);
    // Return a default poem and a 500 status code on error.
    return NextResponse.json(
      {
        title: "Silence",
        author: "Unknown",
        lines: ["In quiet moments", "We find peace", "Within ourselves"],
      },
      { status: 500 }
    );
  }
}
