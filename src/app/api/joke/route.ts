/**
 * @file This file defines the API route for fetching a random joke from JokeAPI.
 * It handles GET requests and returns a joke, which can be either a single-part
 * joke or a two-part joke (setup and delivery).
 */

import { NextResponse } from "next/server";

/**
 * Interface for a single-part joke.
 * @property {"single"} type - Indicates the joke is a single part.
 * @property {string} joke - The joke text.
 */
interface JokeSingle {
  type: "single";
  joke: string;
}

/**
 * Interface for a two-part joke.
 * @property {"twopart"} type - Indicates the joke has two parts.
 * @property {string} setup - The setup part of the joke.
 * @property {string} delivery - The punchline or delivery part of the joke.
 */
interface JokeTwoPart {
  type: "twopart";
  setup: string;
  delivery: string;
}

/**
 * Type alias for a Joke, which can be either a single-part or a two-part joke.
 */
type Joke = JokeSingle | JokeTwoPart;

/**
 * Handles GET requests to the joke API route.
 * Fetches a random joke from JokeAPI, excluding blacklisted categories.
 * Returns the joke in a structured JSON format.
 * If the API call fails, it returns a default joke.
 * @returns {Promise<NextResponse>} A JSON response containing the joke or an error message.
 */
export async function GET() {
  try {
    // Fetch a random joke from JokeAPI, blacklisting inappropriate categories.
    const response = await fetch(
      "https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit"
    );

    if (!response.ok) {
      // If the response is not OK (e.g., 404, 500), throw an error.
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jokeData: Joke = await response.json();

    // Return the fetched joke data.
    return NextResponse.json(jokeData);
  } catch (error) {
    console.error("Error fetching joke:", error);
    // Return a default joke and a 500 status code on error.
    return NextResponse.json(
      {
        type: "single",
        joke: "Why don't scientists trust atoms? Because they make up everything!",
      },
      { status: 500 }
    );
  }
}
