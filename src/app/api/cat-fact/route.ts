/**
 * @file This file defines the API route for fetching a random cat fact from the Cat Fact API.
 * It exposes a GET endpoint that, when called, retrieves a cat fact
 * and returns it in a structured JSON format.
 */

import { NextResponse } from "next/server";

/**
 * Handles GET requests to the cat fact API route.
 * Fetches a random cat fact from the Cat Fact API and returns it as a JSON response.
 * If the API call fails, it returns a default cat fact.
 * @returns {Promise<NextResponse>} A JSON response containing the cat fact or an error message.
 */
export async function GET() {
  try {
    const response = await fetch("https://catfact.ninja/fact");

    if (!response.ok) {
      // If the response is not OK (e.g., 404, 500), throw an error
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Return the cat fact
    return NextResponse.json({
      fact: data.fact,
    });
  } catch (error) {
    console.error("Error fetching cat fact:", error);
    // Return a default cat fact and a 500 status code on error
    return NextResponse.json(
      {
        fact: "Cats sleep for 70% of their lives, which is 13-16 hours a day.",
      },
      { status: 500 }
    );
  }
}
