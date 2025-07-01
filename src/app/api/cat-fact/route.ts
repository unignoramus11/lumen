import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://catfact.ninja/fact");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      fact: data.fact,
    });
  } catch (error) {
    console.error("Error fetching cat fact:", error);
    return NextResponse.json(
      {
        fact: "Cats sleep for 70% of their lives, which is 13-16 hours a day.",
      },
      { status: 500 }
    );
  }
}
