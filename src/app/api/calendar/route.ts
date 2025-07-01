import { NextRequest, NextResponse } from "next/server";
import { getCurrentISTDate } from "@/lib/ist-utils";

export async function GET(request: NextRequest) {
  try {
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
        // Try to fetch the daily data for this date
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
          }/api/daily?date=${dateString}`,
          {
            headers: {
              "User-Agent": "Calendar-API/1.0",
            },
          }
        );

        if (response.ok) {
          const dailyData = await response.json();
          calendarData[dateString] = {
            imageUrl: dailyData.photo?.imageUrl || null,
            label: dailyData.photo?.label || dateString,
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
