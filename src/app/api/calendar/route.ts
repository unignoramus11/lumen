/**
 * @file This file defines the API route for fetching calendar data.
 * It handles GET requests to retrieve daily content information for a specific month and year,
 * including headlines, image URLs, and labels. It interacts with the MongoDB database
 * to fetch stored content and handles date-related logic, including IST conversion.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentISTDate, getISTDateString } from "@/lib/ist-utils";
import dbConnect from "@/lib/mongodb";
import DailyContent from "@/models/DailyContent";

/**
 * Handles GET requests to the calendar API route.
 * Expects 'year' and 'month' as query parameters.
 * Connects to the database, fetches daily content for each day of the specified month,
 * and returns a structured JSON object containing the calendar data.
 * Days in the future or without content are marked as unavailable.
 * @param {NextRequest} request - The incoming Next.js request object, containing search parameters.
 * @returns {Promise<NextResponse>} A JSON response containing the calendar data or an error message.
 */
export async function GET(request: NextRequest) {
  try {
    // Establish connection to the MongoDB database
    await dbConnect();

    // Extract year and month from the request's search parameters
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    // Validate presence of year and month parameters
    if (!year || !month) {
      return NextResponse.json(
        { error: "Year and month parameters are required" },
        { status: 400 }
      );
    }

    // Parse year and month to numbers
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    // Validate parsed year and month values
    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return NextResponse.json(
        { error: "Invalid year or month" },
        { status: 400 }
      );
    }

    // Get the number of days in the specified month
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    // Initialize an object to store calendar data for each day
    const calendarData: Record<
      string,
      { headline?: string; imageUrl: string | null; label: string }
    > = {};

    // Get current date in IST using the utility function for comparison
    const istNow = getCurrentISTDate();
    const currentYear = istNow.getFullYear();
    const currentMonth = istNow.getMonth() + 1; // Month is 0-indexed
    const currentDay = istNow.getDate();

    // Iterate through each day of the month to fetch content
    for (let day = 1; day <= daysInMonth; day++) {
      // Format the date string for database query (YYYY-MM-DD)
      const dateString = `${yearNum}-${monthNum
        .toString()
        .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

      // Determine if the current date is in the future relative to IST now
      const isFuture =
        yearNum > currentYear ||
        (yearNum === currentYear && monthNum > currentMonth) ||
        (yearNum === currentYear &&
          monthNum === currentMonth &&
          day > currentDay);

      // If the date is in the future, mark it as unavailable and continue to next day
      if (isFuture) {
        calendarData[dateString] = {
          imageUrl: null,
          label: dateString,
        };
        continue;
      }

      try {
        // Normalize the date to IST string format for database query
        const normalizedDate = getISTDateString(new Date(dateString));
        // Find daily content for the normalized date
        const dailyContent = await DailyContent.findOne({
          date: normalizedDate,
        });

        // If content is found, populate calendarData with its details
        if (dailyContent) {
          calendarData[dateString] = {
            imageUrl: dailyContent.photo?.imageBlob
              ? `data:image/jpeg;base64,${dailyContent.photo.imageBlob.toString(
                  "base64"
                )}`
              : dailyContent.photo?.imageUrl || null, // Prioritize imageBlob if available, else use imageUrl
            label: dailyContent.photo?.label || dateString,
            headline: dailyContent.headline,
          };
        } else {
          // If no content is available for the date, mark it as such
          calendarData[dateString] = {
            imageUrl: null,
            label: dateString,
          };
        }
      } catch (error) {
        console.error(`Error fetching data for ${dateString}:`, error);
        // On error, mark the day as unavailable
        calendarData[dateString] = {
          imageUrl: null,
          label: dateString,
        };
      }
    }

    // Return the compiled calendar data
    return NextResponse.json({
      year: yearNum,
      month: monthNum,
      data: calendarData,
    });
  } catch (error) {
    console.error("Calendar API error:", error);
    // Return a generic internal server error on unexpected issues
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
