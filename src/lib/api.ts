/**
 * @file This file contains utility functions for interacting with the application's internal APIs.
 * It centralizes data fetching logic, making it reusable and maintainable.
 */

import type { DailyData } from "@/types";

/**
 * Fetches daily content data for a specific date from the API.
 * This function is responsible for making the API call to retrieve all the content
 * (headline, photo, poem, joke, facts, comic, activity) for a given day.
 * @param {string} date - The date for which to fetch daily data, in YYYY-MM-DD format.
 * @returns {Promise<DailyData>} A promise that resolves with the `DailyData` object for the specified date.
 * @throws {Error} If the API request fails or returns a non-OK status.
 */
export async function fetchDailyData(date: string): Promise<DailyData> {
  // Construct the API endpoint URL with the encoded date parameter.
  const response = await fetch(`/api/daily?date=${encodeURIComponent(date)}`);

  // Check if the HTTP response was successful.
  if (!response.ok) {
    // If not successful, throw an error with the status.
    throw new Error(`Failed to fetch daily data: ${response.status}`);
  }

  // Parse the JSON response and return the data.
  return response.json();
}

/**
 * Fetches the latest available date with content before today.
 * Uses MongoDB query to efficiently find the most recent date with content.
 * @returns {Promise<string>} A promise that resolves with the latest available date in YYYY-MM-DD format.
 */
export async function fetchLatestAvailableDate(): Promise<string> {
  const response = await fetch('/api/latest-date');
  
  if (!response.ok) {
    throw new Error(`Failed to fetch latest date: ${response.status}`);
  }
  
  const { date } = await response.json();
  return date;
}
