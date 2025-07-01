import { NextRequest, NextResponse } from "next/server";
import { getCurrentISTDate, getISTDateString } from "@/lib/ist-utils";
import dbConnect from "@/lib/mongodb";
import DailyContent from "@/models/DailyContent";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    if (!year || !month) {
      return NextResponse.json(
        { error: "Year and month parameters are required" },
        { status: 400 }
      );
    }

    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return NextResponse.json(
        { error: "Invalid year or month" },
        { status: 400 }
      );
    }

    // Get the number of days in the month
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    const calendarData: Record<
      string,
      { imageUrl: string | null; label: string }
    > = {};

    // Get current date in IST using the utility function
    const istNow = getCurrentISTDate();
    const currentYear = istNow.getFullYear();
    const currentMonth = istNow.getMonth() + 1;
    const currentDay = istNow.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${yearNum}-${monthNum
        .toString()
        .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

      // Check if this date is in the future
      const isFuture =
        yearNum > currentYear ||
        (yearNum === currentYear && monthNum > currentMonth) ||
        (yearNum === currentYear &&
          monthNum === currentMonth &&
          day > currentDay);

      if (isFuture) {
        calendarData[dateString] = {
          imageUrl: null,
          label: dateString,
        };
        continue;
      }

      try {
        // Normalize the date to IST and query the database directly
        const normalizedDate = getISTDateString(new Date(dateString));
        const dailyContent = await DailyContent.findOne({
          date: normalizedDate,
        });

        if (dailyContent) {
          calendarData[dateString] = {
            imageUrl: dailyContent.photo?.imageBlob
              ? `data:image/jpeg;base64,${dailyContent.photo.imageBlob.toString(
                  "base64"
                )}`
              : dailyContent.photo?.imageUrl || null,
            label: dailyContent.photo?.label || dateString,
          };
        } else {
          // No data available for this date
          calendarData[dateString] = {
            imageUrl: null,
            label: dateString,
          };
        }
      } catch (error) {
        console.error(`Error fetching data for ${dateString}:`, error);
        calendarData[dateString] = {
          imageUrl: null,
          label: dateString,
        };
      }
    }

    return NextResponse.json({
      year: yearNum,
      month: monthNum,
      data: calendarData,
    });
  } catch (error) {
    console.error("Calendar API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
