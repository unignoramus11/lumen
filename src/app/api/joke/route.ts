import { NextResponse } from "next/server";

interface JokeSingle {
  type: "single";
  joke: string;
}

interface JokeTwoPart {
  type: "twopart";
  setup: string;
  delivery: string;
}

type Joke = JokeSingle | JokeTwoPart;

export async function GET() {
  try {
    const response = await fetch(
      "https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jokeData: Joke = await response.json();

    return NextResponse.json(jokeData);
  } catch (error) {
    console.error("Error fetching joke:", error);
    return NextResponse.json(
      {
        type: "single",
        joke: "Why don't scientists trust atoms? Because they make up everything!",
      },
      { status: 500 }
    );
  }
}
