/**
 * @file This file defines the API route for finding the latest available date with content before today.
 * It uses MongoDB to efficiently query for the most recent date that has content.
 */

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DailyContent from "@/models/DailyContent";
import { getISTDateString } from "@/lib/ist-utils";

/**
 * Handles GET requests to find the latest available date with content before today.
 * Uses MongoDB's sort functionality to efficiently find the most recent date.
 * @returns {Promise<NextResponse>} A JSON response containing the latest available date or yesterday as fallback.
 */
export async function GET() {
  try {
    await dbConnect();

    // Get today's date in IST format
    const today = new Date();
    const todayIST = getISTDateString(today);

    // Query MongoDB for the latest date before today, sorted in descending order
    const latestContent = await DailyContent.findOne({
      date: { $lt: todayIST },
    }).sort({ date: -1 });

    if (latestContent) {
      return NextResponse.json({ date: latestContent.date });
    }

    // Fallback to yesterday if no content found
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayIST = getISTDateString(yesterday);

    return NextResponse.json({ date: yesterdayIST });
  } catch (error) {
    console.error("Error fetching latest date:", error);

    // Fallback to yesterday on error
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayIST = getISTDateString(yesterday);

    return NextResponse.json({ date: yesterdayIST });
  }
}
