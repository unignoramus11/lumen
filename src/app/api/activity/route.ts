/**
 * @file This file defines the API route for fetching a random activity from the Bored API.
 * It exposes a GET endpoint that, when called, retrieves a suggestion for an activity
 * and returns it in a structured JSON format.
 */

import { NextResponse } from "next/server";

/**
 * Interface representing the structure of the response from the Bored API.
 * @property {string} activity - The description of the activity.
 * @property {number} availability - A value from 0 to 1 indicating the accessibility.
 * @property {string} type - The type of activity (e.g., 'recreational', 'education').
 * @property {number} participants - The number of people that can do the activity.
 * @property {number} price - A value from 0 to 1 indicating the cost of the activity.
 * @property {string} accessibility - A more descriptive accessibility string.
 * @property {string} duration - The estimated duration of the activity.
 * @property {boolean} kidFriendly - Indicates if the activity is kid-friendly.
 * @property {string} link - A link to more information about the activity.
 * @property {string} key - A unique identifier for the activity.
 */
interface BoredApiResponse {
  activity: string;
  availability: number;
  type: string;
  participants: number;
  price: number;
  accessibility: string;
  duration: string;
  kidFriendly: boolean;
  link: string;
  key: string;
}

/**
 * Handles GET requests to the activity API route.
 * Fetches a random activity from the Bored API and returns it as a JSON response.
 * If the API call fails, it returns a default activity suggestion.
 * @returns {Promise<NextResponse>} A JSON response containing the activity or an error message.
 */
export async function GET() {
  try {
    const response = await fetch("https://bored-api.appbrewery.com/random");

    if (!response.ok) {
      // If the response is not OK (e.g., 404, 500), throw an error
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: BoredApiResponse = await response.json();

    // Return the activity in lowercase
    return NextResponse.json({
      activity: data.activity.toLowerCase(),
    });
  } catch (error) {
    console.error("Error fetching activity:", error);
    // Return a default activity and a 500 status code on error
    return NextResponse.json(
      {
        activity: "take a moment to breathe and relax",
      },
      { status: 500 }
    );
  }
}
