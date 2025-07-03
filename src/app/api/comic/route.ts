/**
 * @file This file defines the API route for fetching a daily comic strip.
 * It scrapes comic image URLs and alt text from various GoComics sources
 * using `cheerio` and returns the data in a structured JSON format.
 * It attempts to fetch today's comic, falling back to yesterday's if today's is not available.
 */

import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

/**
 * Handles GET requests to the comic API route.
 * Randomly selects a comic source from a predefined list.
 * Fetches the HTML content of the selected comic page, parses it using `cheerio`,
 * extracts the comic image URL and alt text from JSON-LD data within the HTML.
 * Prioritizes today's comic; falls back to yesterday's if today's is not found.
 * @returns {Promise<NextResponse>} A JSON response containing the comic image URL, alt text, and source,
 * or an error message if the comic cannot be fetched or parsed.
 */
export async function GET() {
  try {
    // Predefined list of GoComics sources to randomly choose from.
    const comicSources = [
      "https://www.gocomics.com/garfield",
      "https://www.gocomics.com/calvinandhobbes",
      "https://www.gocomics.com/peanuts",
      "https://www.gocomics.com/bc",
    ];

    // Randomly select one comic source URL.
    const randomSource =
      comicSources[Math.floor(Math.random() * comicSources.length)];

    // Fetch the HTML content of the selected comic page.
    const response = await fetch(randomSource, {
      headers: {
        // Use a common User-Agent to mimic a browser and avoid being blocked.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    // Check if the HTTP response was successful.
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    // Load the HTML content into cheerio for parsing.
    const $ = cheerio.load(html);

    // Search for the specific nested structure containing JSON-LD data.
    // This structure typically holds metadata about the comic image.
    const specificStructure = $(
      'div > div > script[type="application/ld+json"]'
    );

    let comicImageUrl: string | null = null;
    let comicAltText: string | null = null;

    // Iterate through found script tags to extract comic data.
    specificStructure.each((i, el) => {
      try {
        const jsonContent = $(el).html();
        if (!jsonContent) return;

        const data = JSON.parse(jsonContent);

        // Get current date in the format "Month Day, Year" (e.g., "July 2, 2025").
        const currentDate = new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        // Get yesterday's date in the same format.
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDate = yesterday.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        // Look for ImageObject type with comic data and today's date.
        if (
          data["@type"] === "ImageObject" &&
          data.contentUrl &&
          data.datePublished === currentDate
        ) {
          comicImageUrl = data.contentUrl;
          comicAltText = data.name || data.description || "";
        }
        // If today's comic is not found, try to get yesterday's comic.
        else if (
          !comicImageUrl &&
          data["@type"] === "ImageObject" &&
          data.contentUrl &&
          data.datePublished === yesterdayDate
        ) {
          comicImageUrl = data.contentUrl;
          comicAltText = data.name || data.description || "";
          console.log(
            `Today's comic not available, using yesterday's comic (${yesterdayDate})`
          );
        }
      } catch (parseError) {
        // Silently ignore parsing errors, as multiple script tags might exist.
        console.debug("Error parsing JSON-LD:", parseError);
      }
    });

    // If a comic image URL was successfully extracted, return it.
    if (comicImageUrl) {
      return NextResponse.json({
        imageUrl: comicImageUrl,
        altText: comicAltText,
        source: randomSource,
      });
    } else {
      // If no comic image is found after trying today and yesterday's dates, throw an error.
      console.error(
        "Comic image not found for today or yesterday in JSON-LD data"
      );
      throw new Error("Comic image not found in JSON-LD data");
    }
  } catch (error) {
    console.error("Error fetching comic:", error);
    // Return a default error response if any part of the fetching or parsing fails.
    return NextResponse.json(
      {
        imageUrl: null,
        altText: "Unable to load comic",
        source: null,
        error: "Comic unavailable",
      },
      { status: 500 }
    );
  }
}
