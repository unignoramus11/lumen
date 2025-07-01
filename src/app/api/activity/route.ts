import { NextResponse } from "next/server";

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

export async function GET() {
  try {
    const response = await fetch("https://bored-api.appbrewery.com/random");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: BoredApiResponse = await response.json();

    return NextResponse.json({
      activity: data.activity.toLowerCase(),
    });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      {
        activity: "take a moment to breathe and relax",
      },
      { status: 500 }
    );
  }
}
