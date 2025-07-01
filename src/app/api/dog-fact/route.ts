import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://dogapi.dog/api/v2/facts?limit=1");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      fact: data.data[0].attributes.body,
    });
  } catch (error) {
    console.error("Error fetching dog fact:", error);
    return NextResponse.json(
      {
        fact: "Dogs have about 300 million olfactory receptors in their noses, compared to about 6 million in humans.",
      },
      { status: 500 }
    );
  }
}
