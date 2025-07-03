/**
 * @file This file defines the API route for fetching a random dog fact from the Dog API.
 * It exposes a GET endpoint that, when called, retrieves a dog fact
 * and returns it in a structured JSON format.
 */

import { NextResponse } from "next/server";

/**
 * Handles GET requests to the dog fact API route.
 * Fetches a random dog fact from the Dog API and returns it as a JSON response.
 * If the API call fails, it returns a default dog fact.
 * @returns {Promise<NextResponse>} A JSON response containing the dog fact or an error message.
 */
export async function GET() {
  try {
    const response = await fetch("https://dogapi.dog/api/v2/facts?limit=1");

    if (!response.ok) {
      // If the response is not OK (e.g., 404, 500), throw an error
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Return the dog fact from the first item in the data array
    return NextResponse.json({
      fact: data.data[0].attributes.body,
    });
  } catch (error) {
    console.error("Error fetching dog fact:", error);
    // Return a default dog fact and a 500 status code on error
    return NextResponse.json(
      {
        fact: "Dogs have about 300 million olfactory receptors in their noses, compared to about 6 million in humans.",
      },
      { status: 500 }
    );
  }
}
