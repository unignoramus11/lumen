import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fixed photo for now
    const photo = {
      imageUrl: "/photo.jpg",
      label:
        "angy has been really kind and helpful. floofy gets scary mad when I take breaks tho",
    };

    return NextResponse.json(photo);
  } catch (error) {
    console.error("Error fetching photo:", error);
    return NextResponse.json(
      {
        imageUrl: "/photo.jpg",
        label:
          "angy has been really kind and helpful. floofy gets scary mad when I take breaks tho",
      },
      { status: 500 }
    );
  }
}
