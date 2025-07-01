import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DailyContent from "@/models/DailyContent";
import { getISTDateString } from "@/lib/ist-utils";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    // Normalize the date to IST
    const date = getISTDateString(new Date(dateParam));

    // Try to find existing data for this date
    const dailyContent = await DailyContent.findOne({ date });
    console.log("Fetched daily content:", dailyContent ? "Found" : "Not found");

    if (dailyContent) {
      // Convert image blobs to base64 URLs for frontend consumption
      const responseData = {
        ...dailyContent.toObject(),
        photo: {
          ...dailyContent.photo,
          imageUrl: dailyContent.photo.imageBlob
            ? `data:image/jpeg;base64,${dailyContent.photo.imageBlob.toString(
                "base64"
              )}`
            : dailyContent.photo.imageUrl || "/photo.jpg",
          label: dailyContent.photo.label || "",
        },
      };

      return NextResponse.json(responseData);
    }

    return NextResponse.json(null);
  } catch (error) {
    console.error("Error fetching daily content:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily content" },
      { status: 500 }
    );
  }
}
