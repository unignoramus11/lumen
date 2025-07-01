import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET() {
  try {
    // Randomly select one of the comic sources
    const comicSources = [
      "https://www.gocomics.com/garfield",
      "https://www.gocomics.com/calvinandhobbes",
      "https://www.gocomics.com/peanuts",
      "https://www.gocomics.com/bc",
    ];

    const randomSource =
      comicSources[Math.floor(Math.random() * comicSources.length)];

    const response = await fetch(randomSource, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Search for the specific nested structure: div > div > script[type="application/ld+json"]
    const specificStructure = $(
      'div > div > script[type="application/ld+json"]'
    );

    let comicImageUrl: string | null = null;
    let comicAltText: string | null = null;

    specificStructure.each((i, el) => {
      try {
        const jsonContent = $(el).html();
        if (!jsonContent) return;

        const data = JSON.parse(jsonContent);

        // Get current date in the format "July 2, 2025"
        const currentDate = new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        // Get yesterday's date in the same format
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDate = yesterday.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        // Look for ImageObject type with comic data AND current date
        if (
          data["@type"] === "ImageObject" &&
          data.contentUrl &&
          data.datePublished === currentDate
        ) {
          comicImageUrl = data.contentUrl;
          comicAltText = data.name || data.description || "";
        }
        // If today's comic not found, try yesterday's
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
      } catch {
        // Silently ignore parsing errors
      }
    });

    if (comicImageUrl) {
      return NextResponse.json({
        imageUrl: comicImageUrl,
        altText: comicAltText,
        source: randomSource,
      });
    } else {
      console.error(
        "Comic image not found for today or yesterday in JSON-LD data"
      );
      throw new Error("Comic image not found in JSON-LD data");
    }
  } catch (error) {
    console.error("Error fetching comic:", error);
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
