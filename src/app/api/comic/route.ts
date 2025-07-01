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

    // Find the comic image with the specific class
    const comicImage = $("img.Comic_comic__image__6e_Fw");

    if (comicImage.length > 0) {
      const imageUrl = comicImage.attr("src");
      const altText = comicImage.attr("alt") || "";

      return NextResponse.json({
        imageUrl: imageUrl,
        altText: altText,
        source: randomSource,
      });
    } else {
      throw new Error("Comic image not found");
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
