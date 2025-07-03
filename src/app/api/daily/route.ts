/**
 * @file This file defines the API route for fetching daily content.
 * It handles GET requests to retrieve a specific day's content (headline, photo, etc.)
 * from the MongoDB database. It uses IST date normalization and converts image blobs
 * to base64 URLs for frontend display.
 */

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DailyContent from "@/models/DailyContent";
import { getISTDateString } from "@/lib/ist-utils";

/**
 * Handles GET requests to the daily content API route.
 * Expects a 'date' query parameter in YYYY-MM-DD format.
 * Connects to the database and fetches the `DailyContent` document for the specified date.
 * If content is found, it converts the image blob to a base64 URL for direct use in the frontend.
 * @param {NextRequest} request - The incoming Next.js request object, containing search parameters.
 * @returns {Promise<NextResponse>} A JSON response containing the daily content or null if not found,
 * or an error message with an appropriate HTTP status code on failure.
 */
export async function GET(request: NextRequest) {
  try {
    // Establish connection to the MongoDB database
    await dbConnect();

    // Extract the 'date' parameter from the request's search parameters
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    // Validate presence of the date parameter
    if (!dateParam) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    // Normalize the provided date string to IST format for consistent database lookup
    const date = getISTDateString(new Date(dateParam));

    // Attempt to find existing daily content for this normalized date in the database
    const dailyContent = await DailyContent.findOne({ date });
    console.log("Fetched daily content:", dailyContent ? "Found" : "Not found");

    // If daily content is found, prepare the response data
    if (dailyContent) {
      // Convert the Mongoose document to a plain JavaScript object
      // and transform the imageBlob (Buffer) into a base64 data URL for the frontend.
      const responseData = {
        ...dailyContent.toObject(),
        photo: {
          ...dailyContent.photo,
          imageUrl: dailyContent.photo.imageBlob
            ? `data:image/jpeg;base64,${dailyContent.photo.imageBlob.toString(
                "base64"
              )}`
            : dailyContent.photo.imageUrl || "/photo.jpg", // Fallback to default image if no blob or URL
          label: dailyContent.photo.label || "",
        },
      };

      return NextResponse.json(responseData);
    }

    // If no daily content is found for the given date, return null
    return NextResponse.json(null);
  } catch (error) {
    console.error("Error fetching daily content:", error);
    // Return a generic error message on server-side issues
    return NextResponse.json(
      { error: "Failed to fetch daily content" },
      { status: 500 }
    );
  }
}
