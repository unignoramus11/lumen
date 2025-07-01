import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import sharp from "sharp";
import dbConnect from "@/lib/mongodb";
import DailyContent from "@/models/DailyContent";
import { getISTDateString } from "@/lib/ist-utils";

async function verifyAdminAccess(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return false;
    }

    const token = authHeader.split(" ")[1];
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return false;
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, adminPassword);
    return decoded && typeof decoded === "object" && "admin" in decoded;
  } catch (error) {
    console.error("Auth verification error:", error);
    return false;
  }
}

async function fetchAllContent() {
  const [poem, joke, activity, catFact, dogFact, triviaFact, comic] =
    await Promise.allSettled([
      fetch(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/poem`
      ).then((res) => res.json()),
      fetch(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/joke`
      ).then((res) => res.json()),
      fetch(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/activity`
      ).then((res) => res.json()),
      fetch(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/cat-fact`
      ).then((res) => res.json()),
      fetch(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/dog-fact`
      ).then((res) => res.json()),
      fetch(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/trivia-fact`
      ).then((res) => res.json()),
      fetch(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/comic`
      ).then((res) => res.json()),
    ]);

  return {
    poem:
      poem.status === "fulfilled"
        ? poem.value
        : {
            title: "Silence",
            author: "Unknown",
            lines: ["In quiet moments", "We find peace", "Within ourselves"],
          },
    joke:
      joke.status === "fulfilled"
        ? joke.value
        : {
            type: "single",
            joke: "Why don't scientists trust atoms? Because they make up everything!",
          },
    activity:
      activity.status === "fulfilled"
        ? activity.value
        : {
            activity: "take a moment to breathe and relax",
          },
    catFact:
      catFact.status === "fulfilled"
        ? catFact.value
        : {
            fact: "Cats sleep for 70% of their lives, which is 13-16 hours a day.",
          },
    dogFact:
      dogFact.status === "fulfilled"
        ? dogFact.value
        : {
            fact: "Dogs have about 300 million olfactory receptors in their noses, compared to about 6 million in humans.",
          },
    triviaFact:
      triviaFact.status === "fulfilled"
        ? triviaFact.value
        : {
            fact: "Honey never spoils. Archaeologists have found edible honey in ancient Egyptian tombs.",
          },
    comic:
      comic.status === "fulfilled"
        ? comic.value
        : {
            imageUrl: null,
            altText: "Unable to load comic",
          },
  };
}

async function compressImage(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .jpeg({ quality: 80 })
      .resize(800, 600, { fit: "inside", withoutEnlargement: true })
      .toBuffer();
  } catch (error) {
    console.error("Error compressing image:", error);
    return buffer;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAdminAccess(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const formData = await request.formData();
    const dateParam = formData.get("date") as string;
    const headline = formData.get("headline") as string;
    const label = formData.get("label") as string;
    const photoFile = formData.get("photo") as File | null;

    // Normalize the date to IST
    const date = dateParam
      ? getISTDateString(new Date(dateParam))
      : getISTDateString();

    if (!headline || !label) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch all other content from APIs
    const apiContent = await fetchAllContent();

    // Process photo
    let photoBlob: Buffer;
    if (photoFile) {
      const arrayBuffer = await photoFile.arrayBuffer();
      photoBlob = await compressImage(Buffer.from(arrayBuffer));
    } else {
      // If no photo provided, check if we're updating existing content
      const existing = await DailyContent.findOne({ date });
      if (existing && existing.photo.imageBlob) {
        photoBlob = existing.photo.imageBlob;
      } else {
        return NextResponse.json(
          { error: "Photo is required for new content" },
          { status: 400 }
        );
      }
    }

    // Process comic - store URL and altText instead of blob
    const comicData = {
      imageUrl: apiContent.comic.imageUrl || "",
      altText: apiContent.comic.altText || "Unable to load comic",
    };

    // Create or update daily content
    const contentData = {
      date,
      headline,
      photo: {
        imageBlob: photoBlob,
        label,
      },
      poem: apiContent.poem,
      joke: apiContent.joke,
      activity: apiContent.activity,
      catFact: apiContent.catFact,
      dogFact: apiContent.dogFact,
      triviaFact: apiContent.triviaFact,
      comic: comicData,
    };

    const existingContent = await DailyContent.findOne({ date });

    if (existingContent) {
      // Update existing
      await DailyContent.findOneAndUpdate({ date }, contentData);
    } else {
      // Create new
      const newContent = new DailyContent(contentData);
      await newContent.save();
    }

    return NextResponse.json({
      success: true,
      message: existingContent ? "Content updated" : "Content published",
    });
  } catch (error) {
    console.error("Publish error:", error);
    return NextResponse.json(
      { error: "Failed to publish content" },
      { status: 500 }
    );
  }
}
