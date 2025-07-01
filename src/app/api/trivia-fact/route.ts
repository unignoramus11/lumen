import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://uselessfacts.jsph.pl/api/v2/facts/random"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      fact: data.text,
    });
  } catch (error) {
    console.error("Error fetching trivia fact:", error);
    return NextResponse.json(
      {
        fact: "Honey never spoils. Archaeologists have found edible honey in ancient Egyptian tombs.",
      },
      { status: 500 }
    );
  }
}
