"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BanterLoader from "../../components/BanterLoader";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/utils";

interface CalendarDay {
  imageUrl: string | null;
  label: string;
}

interface CalendarData {
  year: number;
  month: number;
  data: Record<string, CalendarDay>;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Custom SelectItem without check mark
function CustomSelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex w-full cursor-default items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export default function CalendarPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [tapCount, setTapCount] = useState(0);
  const [tapTimer, setTapTimer] = useState<NodeJS.Timeout | null>(null);

  const handleTap = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (isMobile) {
      const newTapCount = tapCount + 1;
      setTapCount(newTapCount);

      // Clear existing timer
      if (tapTimer) {
        clearTimeout(tapTimer);
      }

      // Check if we've reached 3 taps
      if (newTapCount === 3) {
        router.push("/publish");
        setTapCount(0);
        setTapTimer(null);
        return;
      }

      // Set timer to reset tap count after 5 seconds
      const timer = setTimeout(() => {
        setTapCount(0);
        setTapTimer(null);
      }, 5000);
      setTapTimer(timer);
    }
  };

  // Get current date in IST
  const now = new Date();
  const istNow = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  const [selectedYear, setSelectedYear] = useState(
    istNow.getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState(
    (istNow.getMonth() + 1).toString()
  );

  // Generate year options (2025 to current year)
  const yearOptions = [];
  for (let year = 2025; year <= istNow.getFullYear(); year++) {
    yearOptions.push({ value: year.toString(), label: year.toString() });
  }

  // Generate month options
  const monthOptions = MONTHS.map((month, index) => ({
    value: (index + 1).toString(),
    label: month,
  }));

  useEffect(() => {
    setIsClient(true);
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
      if (tapTimer) {
        clearTimeout(tapTimer);
      }
    };
  }, [tapTimer]);

  useEffect(() => {
    async function fetchCalendarData() {
      if (!isClient || isMobile) return;

      setLoading(true);
      setImagesLoaded(false);
      setLoadedImages(new Set());

      try {
        const response = await fetch(
          `/api/calendar?year=${selectedYear}&month=${selectedMonth}`
        );
        if (response.ok) {
          const data = await response.json();
          setCalendarData(data);

          // Check if there are any images to load
          const imageUrls = Object.values(
            data.data as Record<string, CalendarDay>
          )
            .map((day) => day.imageUrl)
            .filter((url): url is string => Boolean(url));
          if (imageUrls.length === 0) {
            setImagesLoaded(true);
          }
        } else {
          console.error("Failed to fetch calendar data");
        }
      } catch (error) {
        console.error("Error fetching calendar data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCalendarData();
  }, [selectedYear, selectedMonth, isClient, isMobile]);

  // Check if all images are loaded
  useEffect(() => {
    if (!calendarData) return;

    const imageUrls = Object.values(calendarData.data)
      .map((day) => day.imageUrl)
      .filter((url): url is string => Boolean(url));

    if (imageUrls.length === 0) {
      setImagesLoaded(true);
    } else if (loadedImages.size === imageUrls.length) {
      setImagesLoaded(true);
    }
  }, [loadedImages, calendarData]);

  const handleImageLoad = (imageUrl: string) => {
    setLoadedImages((prev) => new Set([...prev, imageUrl]));
  };

  const handleDayClick = (dateString: string) => {
    router.push(`/?date=${encodeURIComponent(dateString)}`);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const renderCalendarGrid = () => {
    if (!calendarData) return null;

    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }

    // Add calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`;
      const dayData = calendarData.data[dateString];

      // Check if this date is in the future
      const isFuture =
        year > currentYear ||
        (year === currentYear && month > currentMonth) ||
        (year === currentYear && month === currentMonth && day > currentDay);

      const hasImage = dayData?.imageUrl;
      const isUnavailable = isFuture || !hasImage;

      days.push(
        <div
          key={dateString}
          className={`aspect-square relative border border-black transition-all ${
            isUnavailable
              ? "cursor-not-allowed bg-white"
              : "cursor-pointer hover:bg-yellow-200"
          }`}
          style={
            isUnavailable
              ? {
                  backgroundImage:
                    "repeating-linear-gradient(45deg, transparent, transparent 5px, black 5px, black 7px)",
                }
              : {}
          }
          onClick={() => !isUnavailable && handleDayClick(dateString)}
        >
          {hasImage && !isUnavailable && dayData.imageUrl && (
            <Image
              src={dayData.imageUrl}
              alt={dayData.label}
              fill
              className="object-cover"
              onLoad={() => handleImageLoad(dayData.imageUrl!)}
              onError={() => handleImageLoad(dayData.imageUrl!)}
            />
          )}
          <div className="absolute top-2 left-2 bg-white rounded-full w-8 h-8 flex items-center justify-center text-black font-bold text-sm border border-black font-newsreader">
            {day}
          </div>
        </div>
      );
    }

    return days;
  };

  // Early return for mobile devices to prevent loading any content components
  if (isClient && isMobile) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <Image
            src="/logo.png"
            alt="Lumen Sigma Logo"
            className="w-32 h-32 mx-auto mb-4"
            width={128}
            height={128}
            priority
            onTouchEnd={handleTap}
            onClick={handleTap}
          />
          <h1 className="text-3xl font-bold mb-4 font-unifraktur">
            Lumen Sigma
          </h1>
          <p className="text-lg leading-relaxed font-newsreader">
            This is a desktop-only website
            <br />
            Mostly because I am lazy :P
          </p>
        </div>
      </div>
    );
  }

  // Show nothing during SSR or initial client render to prevent hydration mismatch
  if (!isClient) {
    return null;
  }

  const isLoadingComplete = !loading && imagesLoaded;

  // Show loading overlay while data is loading (only for desktop)
  const isLoading = !isMobile && loading;

  return (
    <div className="relative min-h-screen bg-white text-black font-newsreader">
      {/* Loading Overlay */}
      {isLoading && !isLoadingComplete && (
        <div className="fixed inset-0 bg-white bg-opacity-95 z-50 flex items-center justify-center">
          <BanterLoader />
        </div>
      )}

      {/* Header */}
      <header className="select-none">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-3 items-center border-b-2 border-black py-8">
            <Link
              href="/"
              className="hover:bg-yellow-200 px-4 py-2 transition-colors justify-self-start"
            >
              Back to Newspaper
            </Link>
            <h1 className="text-4xl font-bold tracking-wider font-unifraktur justify-self-center">
              Calendar
            </h1>
            <div className="flex gap-4 items-center justify-self-end">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-32 bg-white border-black shadow-none hover:bg-yellow-200 font-newsreader">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent className="bg-white border-black">
                  {monthOptions.map((month) => (
                    <CustomSelectItem
                      key={month.value}
                      value={month.value}
                      className={`font-newsreader hover:bg-yellow-200 hover:text-black cursor-pointer ${
                        month.value === selectedMonth
                          ? "bg-black text-white"
                          : ""
                      }`}
                    >
                      {month.label}
                    </CustomSelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-24 bg-white border-black shadow-none hover:bg-yellow-200 font-newsreader">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="bg-white border-black">
                  {yearOptions.map((year) => (
                    <CustomSelectItem
                      key={year.value}
                      value={year.value}
                      className={`font-newsreader hover:bg-yellow-200 hover:text-black cursor-pointer ${
                        year.value === selectedYear ? "bg-black text-white" : ""
                      }`}
                    >
                      {year.label}
                    </CustomSelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Calendar */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Calendar Grid */}
        <div className="bg-white border-2 border-black">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b-2 border-black">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-4 text-center font-bold border-r border-black last:border-r-0 font-newsreader"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 select-none">
            {renderCalendarGrid()}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center text-sm text-black font-newsreader">
          <p>
            Click on any day with a photo to view that date&apos;s newspaper
          </p>
          <p>
            Striped days are either in the future or have no content available
          </p>
        </div>
      </div>
    </div>
  );
}
