/**
 * @file This file defines the API route for fetching a random trivia fact from the UselessFacts API.
 * It exposes a GET endpoint that, when called, retrieves a trivia fact
 * and returns it in a structured JSON format.
 */

import { NextResponse } from "next/server";

/**
 * Handles GET requests to the trivia fact API route.
 * Fetches a random trivia fact from the UselessFacts API and returns it as a JSON response.
 * If the API call fails, it returns a default trivia fact.
 * @returns {Promise<NextResponse>} A JSON response containing the trivia fact or an error message.
 */
export async function GET() {
  try {
    const response = await fetch(
      "https://uselessfacts.jsph.pl/api/v2/facts/random"
    );

    if (!response.ok) {
      // If the response is not OK (e.g., 404, 500), throw an error
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Return the trivia fact
    return NextResponse.json({
      fact: data.text,
    });
  } catch (error) {
    console.error("Error fetching trivia fact:", error);
    // Return a default trivia fact and a 500 status code on error
    return NextResponse.json(
      {
        fact: "Honey never spoils. Archaeologists have found edible honey in ancient Egyptian tombs.",
      },
      { status: 500 }
    );
  }
}
