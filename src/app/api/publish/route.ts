/**
 * @file This file defines the API route for publishing daily content to the Lumen Sigma application.
 * It handles POST requests, including administrator authentication, fetching data from various
 * external APIs, image compression using `sharp`, and saving/updating content in MongoDB.
 */

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import sharp from "sharp";
import dbConnect from "@/lib/mongodb";
import DailyContent from "@/models/DailyContent";
import { getISTDateString } from "@/lib/ist-utils";

/**
 * Verifies if the incoming request has valid administrator access.
 * It checks for a Bearer token in the Authorization header and validates it
 * using the `ADMIN_PASSWORD` environment variable as the JWT secret.
 * @param {NextRequest} request - The incoming Next.js request object.
 * @returns {Promise<boolean>} A boolean indicating whether the request is authenticated as an admin.
 */
async function verifyAdminAccess(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    // Check if Authorization header exists and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return false;
    }

    const token = authHeader.split(" ")[1]; // Extract the token part
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Ensure ADMIN_PASSWORD is set in environment variables
    if (!adminPassword) {
      return false;
    }

    // Verify the JWT token using the admin password as the secret
    const decoded = jwt.verify(token, adminPassword);
    // Check if the decoded token contains the 'admin' property
    return decoded && typeof decoded === "object" && "admin" in decoded;
  } catch (error) {
    console.error("Auth verification error:", error);
    return false; // Return false on any verification error
  }
}

/**
 * Fetches various types of content (poem, joke, activity, facts, comic) from their respective internal APIs.
 * Uses `Promise.allSettled` to ensure all fetches are attempted, even if some fail,
 * and provides default fallback values for each content type in case of failure.
 * @returns {Promise<object>} An object containing the fetched content, with fallbacks for failed requests.
 */
async function fetchAllContent() {
  const [poem, joke, activity, catFact, dogFact, triviaFact, comic] =
    await Promise.allSettled([
      // Fetch poem data
      fetch(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/poem`
      ).then((res) => res.json()),
      // Fetch joke data
      fetch(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/joke`
      ).then((res) => res.json()),
      // Fetch activity data
      fetch(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/activity`
      ).then((res) => res.json()),
      // Fetch cat fact data
      fetch(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/cat-fact`
      ).then((res) => res.json()),
      // Fetch dog fact data
      fetch(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/dog-fact`
      ).then((res) => res.json()),
      // Fetch trivia fact data
      fetch(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/trivia-fact`
      ).then((res) => res.json()),
      // Fetch comic data
      fetch(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/comic`
      ).then((res) => res.json()),
    ]);

  return {
    // Return poem data or a default fallback if fetching failed
    poem:
      poem.status === "fulfilled"
        ? poem.value
        : {
            title: "Silence",
            author: "Unknown",
            lines: ["In quiet moments", "We find peace", "Within ourselves"],
          },
    // Return joke data or a default fallback
    joke:
      joke.status === "fulfilled"
        ? joke.value
        : {
            type: "single",
            joke: "Why don't scientists trust atoms? Because they make up everything!",
          },
    // Return activity data or a default fallback
    activity:
      activity.status === "fulfilled"
        ? activity.value
        : {
            activity: "take a moment to breathe and relax",
          },
    // Return cat fact data or a default fallback
    catFact:
      catFact.status === "fulfilled"
        ? catFact.value
        : {
            fact: "Cats sleep for 70% of their lives, which is 13-16 hours a day.",
          },
    // Return dog fact data or a default fallback
    dogFact:
      dogFact.status === "fulfilled"
        ? dogFact.value
        : {
            fact: "Dogs have about 300 million olfactory receptors in their noses, compared to about 6 million in humans.",
          },
    // Return trivia fact data or a default fallback
    triviaFact:
      triviaFact.status === "fulfilled"
        ? triviaFact.value
        : {
            fact: "Honey never spoils. Archaeologists have found edible honey in ancient Egyptian tombs.",
          },
    // Return comic data or a default fallback
    comic:
      comic.status === "fulfilled"
        ? comic.value
        : {
            imageUrl: null,
            altText: "Unable to load comic",
          },
  };
}

/**
 * Compresses an image buffer using the `sharp` library.
 * It converts the image to JPEG format with 80% quality and resizes it to fit within 800x600 pixels
 * while maintaining aspect ratio and without enlarging smaller images.
 * @param {Buffer} buffer - The input image buffer.
 * @returns {Promise<Buffer>} A promise that resolves with the compressed image buffer.
 * If compression fails, the original buffer is returned.
 */
async function compressImage(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
      .resize(800, 600, { fit: "inside", withoutEnlargement: true }) // Resize while maintaining aspect ratio
      .toBuffer(); // Output as a buffer
  } catch (error) {
    console.error("Error compressing image:", error);
    return buffer; // Return original buffer if compression fails
  }
}

/**
 * Handles POST requests to the publish API route.
 * This is the main endpoint for creating or updating daily content editions.
 * It performs the following steps:
 * 1. Authenticates the administrator using a JWT token.
 * 2. Connects to the MongoDB database.
 * 3. Parses form data including date, headline, label, and photo file.
 * 4. Normalizes the date to IST.
 * 5. Fetches additional content (poem, joke, facts, comic) from internal APIs.
 * 6. Compresses the uploaded photo (if any) or uses an existing one.
 * 7. Creates a new `DailyContent` document or updates an existing one in the database.
 * @param {NextRequest} request - The incoming Next.js request object, containing form data.
 * @returns {Promise<NextResponse>} A JSON response indicating success or failure of the publishing operation.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify administrator authentication
    const auth = await verifyAdminAccess(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to the MongoDB database
    await dbConnect();

    // Parse form data from the request
    const formData = await request.formData();
    const dateParam = formData.get("date") as string;
    const headline = formData.get("headline") as string;
    const label = formData.get("label") as string;
    const photoFile = formData.get("photo") as File | null;

    // Normalize the date to IST. If dateParam is not provided, use current IST date.
    const date = dateParam
      ? getISTDateString(new Date(dateParam))
      : getISTDateString();

    // Validate required fields
    if (!headline || !label) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch all other dynamic content from internal APIs concurrently
    const apiContent = await fetchAllContent();

    // Process the photo file
    let photoBlob: Buffer; // Declare photoBlob outside the if/else for broader scope
    if (photoFile) {
      const arrayBuffer = await photoFile.arrayBuffer();
      // Convert ArrayBuffer to Buffer and then compress the image
      photoBlob = await compressImage(Buffer.from(arrayBuffer));
    } else {
      // If no new photo is provided, check for an existing photo in the database
      const existing = await DailyContent.findOne({ date });
      if (existing && existing.photo.imageBlob) {
        photoBlob = existing.photo.imageBlob; // Use the existing image blob
      } else {
        // If no new photo and no existing photo, return an error for new content
        return NextResponse.json(
          { error: "Photo is required for new content" },
          { status: 400 }
        );
      }
    }

    // Prepare comic data, ensuring imageUrl and altText are strings
    const comicData = {
      imageUrl: apiContent.comic.imageUrl || "",
      altText: apiContent.comic.altText || "Unable to load comic",
    };

    // Construct the content data object for saving/updating
    const contentData = {
      date,
      headline,
      photo: {
        imageBlob: photoBlob,
        label,
      },
      poem: apiContent.poem,
      joke: apiContent.joke,
      activity: apiContent.activity,
      catFact: apiContent.catFact,
      dogFact: apiContent.dogFact,
      triviaFact: apiContent.triviaFact,
      comic: comicData,
    };

    // Check if content for this date already exists
    const existingContent = await DailyContent.findOne({ date });

    if (existingContent) {
      // If content exists, update it
      await DailyContent.findOneAndUpdate({ date }, contentData);
    } else {
      // If no content exists, create a new one
      const newContent = new DailyContent(contentData);
      await newContent.save();
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: existingContent ? "Content updated" : "Content published",
    });
  } catch (error) {
    console.error("Publish error:", error);
    // Return a generic error message on failure
    return NextResponse.json(
      { error: "Failed to publish content" },
      { status: 500 }
    );
  }
}
