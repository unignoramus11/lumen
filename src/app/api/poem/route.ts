import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch poem with random line count between 3 and 13
    const lineCount = Math.floor(Math.random() * 11) + 3;
    const response = await fetch(`https://poetrydb.org/linecount/${lineCount}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const poemData = await response.json();

    if (Array.isArray(poemData) && poemData.length > 0) {
      const randomPoem = poemData[Math.floor(Math.random() * poemData.length)];

      // Clean up the poem lines by removing underscores and replacing -- with –
      const cleanedLines = randomPoem.lines.map((line: string) =>
        line.replace(/_/g, "").replace(/--/g, "–")
      );

      return NextResponse.json({
        title: randomPoem.title,
        author: randomPoem.author,
        lines: cleanedLines,
      });
    } else {
      throw new Error("No poems found");
    }
  } catch (error) {
    console.error("Error fetching poem:", error);
    return NextResponse.json(
      {
        title: "Silence",
        author: "Unknown",
        lines: ["In quiet moments", "We find peace", "Within ourselves"],
      },
      { status: 500 }
    );
  }
}
