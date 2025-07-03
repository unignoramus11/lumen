"use client";

/**
 * @file This file defines the CalendarPage component, which displays a calendar view
 * of published daily content, allowing users to navigate and view past editions.
 * It integrates date selection, image loading, and hover card previews for each day's content.
 */

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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/utils";
import { getCurrentISTDate } from "@/lib/ist-utils";

/**
 * Interface representing the data for a single day in the calendar.
 * @property {string} [headline] - The headline for the content published on this day (optional).
 * @property {string | null} imageUrl - The URL of the image published on this day, or null if none.
 * @property {string} label - The label or caption for the image.
 */
interface CalendarDay {
  headline?: string;
  imageUrl: string | null;
  label: string;
}

/**
 * Interface representing the structure of the calendar data fetched from the API.
 * @property {number} year - The year for which the calendar data is provided.
 * @property {number} month - The month for which the calendar data is provided (1-indexed).
 * @property {Record<string, CalendarDay>} data - An object where keys are date strings (YYYY-MM-DD)
 * and values are `CalendarDay` objects, containing content for that specific day.
 */
interface CalendarData {
  year: number;
  month: number;
  data: Record<string, CalendarDay>;
}

/**
 * Array of month names for display and selection purposes.
 */
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

/**
 * Custom SelectItem component for the Shadcn UI Select component.
 * This component is a wrapper around `SelectPrimitive.Item` and is used to customize
 * the appearance of individual items within the dropdown, specifically removing the default checkmark.
 * @param {React.ComponentProps<typeof SelectPrimitive.Item>} props - Props for the SelectPrimitive.Item component.
 * @param {string} [props.className] - Additional CSS classes to apply to the item.
 * @param {React.ReactNode} props.children - The content to be rendered inside the item.
 * @returns {JSX.Element} A customized Select item.
 */
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

/**
 * CalendarPage component displays a calendar view of daily content.
 * It allows users to select a month and year to view past editions and navigate to them.
 * Includes mobile responsiveness and a hidden tap gesture for navigation to the publish page.
 * @returns {JSX.Element} The CalendarPage UI.
 */
export default function CalendarPage() {
  const router = useRouter();
  /**
   * State to track if the device is mobile (screen width less than 1024px).
   * @type {boolean}
   */
  const [isMobile, setIsMobile] = useState(false);
  /**
   * State to track if the component is running on the client-side.
   * Used to prevent hydration mismatches during server-side rendering.
   * @type {boolean}
   */
  const [isClient, setIsClient] = useState(false);
  /**
   * State to store the fetched calendar data for the selected month and year.
   * @type {CalendarData | null}
   */
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  /**
   * State to indicate if data is currently being loaded from the API.
   * @type {boolean}
   */
  const [loading, setLoading] = useState(true);
  /**
   * State to indicate if the initial loading phase is active.
   * Used to ensure a minimum loading time for a smoother user experience.
   * @type {boolean}
   */
  const [initialLoading, setInitialLoading] = useState(true);
  /**
   * State to track if all images within the calendar grid have finished loading.
   * @type {boolean}
   */
  const [imagesLoaded, setImagesLoaded] = useState(false);
  /**
   * State to keep track of URLs of images that have successfully loaded.
   * Used to determine when all images in the calendar grid are loaded.
   * @type {Set<string>}
   */
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  /**
   * State to count consecutive taps on the logo for a hidden navigation feature.
   * @type {number}
   */
  const [tapCount, setTapCount] = useState(0);
  /**
   * Timer for resetting the tap count if taps are not consecutive within a timeframe.
   * @type {NodeJS.Timeout | null}
   */
  const [tapTimer, setTapTimer] = useState<NodeJS.Timeout | null>(null);

  /**
   * Handles tap/click events on the logo for a hidden navigation feature to the publish page.
   * On mobile, three consecutive taps within 5 seconds will navigate to the /publish route.
   * @param {React.TouchEvent | React.MouseEvent} e - The event object.
   */
  const handleTap = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (isMobile) {
      const newTapCount = tapCount + 1;
      setTapCount(newTapCount);

      // Clear any existing timer to prevent multiple timers running
      if (tapTimer) {
        clearTimeout(tapTimer);
      }

      // If 3 taps are reached, navigate to the publish page
      if (newTapCount === 3) {
        router.push("/publish");
        setTapCount(0); // Reset tap count
        setTapTimer(null); // Clear timer
        return;
      }

      // Set a new timer to reset the tap count after 5 seconds if no more taps occur
      const timer = setTimeout(() => {
        setTapCount(0);
        setTapTimer(null);
      }, 5000);
      setTapTimer(timer);
    }
  };

  /**
   * Gets the current date in Indian Standard Time (IST) using a utility function.
   * @type {Date}
   */
  const istNow = getCurrentISTDate();

  /**
   * State for the currently selected year in the calendar dropdown.
   * Initializes to the current IST year.
   * @type {string}
   */
  const [selectedYear, setSelectedYear] = useState(
    istNow.getFullYear().toString()
  );
  /**
   * State for the currently selected month in the calendar dropdown.
   * Initializes to the current IST month (1-indexed).
   * @type {string}
   */
  const [selectedMonth, setSelectedMonth] = useState(
    (istNow.getMonth() + 1).toString()
  );

  /**
   * Generates an array of year options for the year selection dropdown.
   * Years range from 2025 up to the current IST year.
   * @type {{ value: string; label: string }[]}
   */
  const yearOptions = [];
  for (let year = 2025; year <= istNow.getFullYear(); year++) {
    yearOptions.push({ value: year.toString(), label: year.toString() });
  }

  /**
   * Generates an array of month options for the month selection dropdown.
   * Uses the predefined `MONTHS` array.
   * @type {{ value: string; label: string }[]}
   */
  const monthOptions = MONTHS.map((month, index) => ({
    value: (index + 1).toString(),
    label: month,
  }));

  /**
   * useEffect hook for initial client-side setup and mobile device detection.
   * - Sets `isClient` to true once the component mounts on the client.
   * - Detects if the device is mobile based on window width and updates `isMobile` state.
   * - Adds and removes a resize event listener for dynamic mobile detection.
   * - Sets a minimum loading time to prevent flashing content.
   */
  /**
   * useEffect hook for initial client-side setup and mobile device detection.
   * - Sets `isClient` to true once the component mounts on the client.
   * - Detects if the device is mobile based on window width and updates `isMobile` state.
   * - Adds and removes a resize event listener for dynamic mobile detection.
   * - Sets a minimum loading time to prevent flashing content.
   */
  useEffect(() => {
    setIsClient(true); // Indicate that the component has mounted on the client

    /**
     * Checks the current window width and updates the `isMobile` state accordingly.
     */
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkDevice(); // Initial check
    window.addEventListener("resize", checkDevice); // Add event listener for window resize

    // Set a minimum loading time (500ms) to prevent content from flashing
    const minimumLoadingTimer = setTimeout(() => {
      setInitialLoading(false);
    }, 500);

    /**
     * Cleanup function for the useEffect hook.
     * Removes the resize event listener and clears any active timers.
     */
    return () => {
      window.removeEventListener("resize", checkDevice);
      clearTimeout(minimumLoadingTimer);
      if (tapTimer) {
        clearTimeout(tapTimer);
      }
    };
  }, [tapTimer]); // Dependency: re-run if tapTimer changes

  /**
   * useEffect hook for fetching calendar data based on the selected year and month.
   * - Only runs on the client-side and if the device is not mobile.
   * - Sets loading states and resets image loaded tracking before fetching.
   * - Fetches data from the `/api/calendar` endpoint.
   * - Updates `calendarData` state and tracks image loading progress.
   */
  useEffect(() => {
    async function fetchCalendarData() {
      if (!isClient || isMobile) return; // Only fetch on client-side for non-mobile devices

      setLoading(true); // Set loading state to true
      setImagesLoaded(false); // Reset images loaded state
      setLoadedImages(new Set()); // Clear previously loaded images

      try {
        const response = await fetch(
          `/api/calendar?year=${selectedYear}&month=${selectedMonth}`
        );
        if (response.ok) {
          const data = await response.json();
          setCalendarData(data); // Update calendar data state

          // Determine if there are any images to load for the current month
          const imageUrls = Object.values(
            data.data as Record<string, CalendarDay>
          )
            .map((day) => day.imageUrl)
            .filter((url): url is string => Boolean(url));
          if (imageUrls.length === 0) {
            setImagesLoaded(true); // If no images, consider them all loaded
          }
        } else {
          console.error("Failed to fetch calendar data");
        }
      } catch (error) {
        console.error("Error fetching calendar data:", error);
      } finally {
        setLoading(false); // Set loading state to false after fetch completes
      }
    }

    fetchCalendarData(); // Call the async function
  }, [selectedYear, selectedMonth, isClient, isMobile]); // Dependencies: re-run if selectedYear, selectedMonth, isClient, or isMobile change

  /**
   * useEffect hook to check if all images in the calendar grid have been loaded.
   * - Updates `imagesLoaded` state once the count of `loadedImages` matches the total number of images.
   */
  useEffect(() => {
    if (!calendarData) return; // Do nothing if calendar data is not yet available

    const imageUrls = Object.values(calendarData.data)
      .map((day) => day.imageUrl)
      .filter((url): url is string => Boolean(url));

    if (imageUrls.length === 0) {
      setImagesLoaded(true); // If no images, consider them all loaded
    } else if (loadedImages.size === imageUrls.length) {
      setImagesLoaded(true); // All images have been loaded
    }
  }, [loadedImages, calendarData]); // Dependencies: re-run if loadedImages or calendarData change

  /**
   * Callback function triggered when an image in the calendar grid finishes loading.
   * Adds the URL of the loaded image to the `loadedImages` set.
   * @param {string} imageUrl - The URL of the image that has loaded.
   */
  const handleImageLoad = (imageUrl: string) => {
    setLoadedImages((prev) => new Set([...prev, imageUrl]));
  };

  /**
   * Handles the click event on a calendar day.
   * Navigates the user to the main page (`/`) with the selected date as a query parameter.
   * @param {string} dateString - The date string (YYYY-MM-DD) of the clicked day.
   */
  const handleDayClick = (dateString: string) => {
    router.push(`/?date=${encodeURIComponent(dateString)}`);
  };

  /**
   * Calculates the number of days in a given month and year.
   * @param {number} year - The year.
   * @param {number} month - The month (1-indexed).
   * @returns {number} The number of days in the specified month.
   */
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  /**
   * Calculates the day of the week for the first day of a given month and year.
   * @param {number} year - The year.
   * @param {number} month - The month (1-indexed).
   * @returns {number} The day of the week (0 for Sunday, 6 for Saturday).
   */
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  /**
   * Renders the grid of calendar days for the currently selected month and year.
   * Includes empty cells for days before the first day of the month, and dynamically
   * renders each day with its image (if available), date, and hover card for headlines.
   * Days in the future or without content are visually marked as unavailable.
   * @returns {JSX.Element[] | null} An array of JSX elements representing the calendar grid, or null if `calendarData` is not available.
   */
  const renderCalendarGrid = () => {
    if (!calendarData) return null; // Do not render if calendar data is not available

    const year = parseInt(selectedYear); // Convert selected year to number
    const month = parseInt(selectedMonth); // Convert selected month to number
    const daysInMonth = getDaysInMonth(year, month); // Get total days in the month
    const firstDay = getFirstDayOfMonth(year, month); // Get the day of the week for the first day

    const days = []; // Array to hold JSX elements for each day
    const today = new Date(); // Current date
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // Month is 0-indexed, so add 1
    const currentDay = today.getDate();

    // Add empty cells to align the first day of the month correctly in the grid
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }

    // Iterate through each day of the month to render its content
    for (let day = 1; day <= daysInMonth; day++) {
      // Format date string for data lookup (YYYY-MM-DD)
      const dateString = `${year}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`;
      const dayData = calendarData.data[dateString]; // Get data for the current day

      // Determine if the current date is in the future
      const isFuture =
        year > currentYear ||
        (year === currentYear && month > currentMonth) ||
        (year === currentYear && month === currentMonth && day > currentDay);

      const hasImage = dayData?.imageUrl; // Check if an image URL exists for the day
      const isUnavailable = isFuture || !hasImage; // Determine if the day is unavailable (future or no image)

      // JSX for a single calendar day cell
      const dayElement = (
        <div
          key={dateString}
          className={`aspect-square relative border border-[#262424] transition-all ${
            isUnavailable ? "cursor-not-allowed bg-[#eee5da]" : "cursor-pointer"
          }`}
          style={
            isUnavailable
              ? {
                  // Apply striped background for unavailable days
                  backgroundImage:
                    "repeating-linear-gradient(45deg, transparent, transparent 5px, #262424 5px, #262424 7px)",
                }
              : {} // No special style for available days
          }
          onClick={() => !isUnavailable && handleDayClick(dateString)} // Handle click only if available
        >
          {/* Render image if available and day is not unavailable */}
          {hasImage && !isUnavailable && dayData.imageUrl && (
            <Image
              src={dayData.imageUrl}
              alt={dayData.label}
              fill
              className="object-cover mix-blend-multiply no-highlight"
              onLoad={() => handleImageLoad(dayData.imageUrl!)} // Mark image as loaded on load
              onError={() => handleImageLoad(dayData.imageUrl!)} // Mark image as loaded even on error to prevent infinite loading
            />
          )}
          {/* Day number display */}
          <div className="absolute top-2 left-2 bg-[#eee5da] rounded-full w-8 h-8 flex items-center justify-center text-[#262424] font-bold text-sm border border-[#262424] font-newsreader">
            {day}
          </div>
        </div>
      );

      // Wrap the day element with a HoverCard if content (headline) is available and the day is not unavailable
      if (hasImage && !isUnavailable && dayData?.headline) {
        days.push(
          <HoverCard key={dateString}>
            <HoverCardTrigger asChild>{dayElement}</HoverCardTrigger>
            <HoverCardContent className="w-80 bg-[#eee5da] border-[#262424] text-[#262424]">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold font-newsreader">
                  {dayData.headline}
                </h4>
                <p className="text-sm text-[#262424] font-newsreader">
                  {dayData.label}
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        );
      } else {
        days.push(dayElement); // Add day element directly if no hover card is needed
      }
    }

    return days; // Return the array of rendered day elements
  };

  /**
   * Determines if a loading overlay should be shown.
   * True if `loading` (data fetching), `initialLoading` (minimum load time), or `imagesLoaded` (image loading progress) is active.
   * @type {boolean}
   */
  const isLoading = loading || initialLoading || !imagesLoaded;

  // Render nothing during server-side rendering or initial client render to prevent hydration mismatches.
  // This ensures the client-side rendering takes over smoothly.
  if (!isClient) {
    return null;
  }

  /**
   * Early return for mobile devices: displays a message indicating desktop-only access.
   * This prevents unnecessary rendering of complex components on unsupported devices.
   * @returns {JSX.Element}
   */
  if (isMobile && !initialLoading) {
    return (
      <div className="min-h-screen bg-[#eee5da] text-[#262424] flex items-center justify-center p-8">
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

  return (
    <div className="relative min-h-screen bg-[#eee5da] text-[#262424] font-newsreader">
      {/* Loading Overlay: Displays a loader while content is being fetched or images are loading. */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#eee5da] bg-opacity-95 z-50 flex items-center justify-center">
          <BanterLoader />
        </div>
      )}

      {/* Header Section: Contains navigation back to the newspaper and month/year selectors. */}
      <header className="select-none">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-3 items-center border-b-2 border-[#262424] py-8">
            <Link
              href="/"
              className="hover:bg-[#ffdbc7] px-4 py-2 transition-colors justify-self-start"
            >
              Back to Newspaper
            </Link>
            <h1 className="text-4xl font-bold tracking-wider font-unifraktur justify-self-center">
              Calendar
            </h1>
            <div className="flex gap-4 items-center justify-self-end">
              {/* Month Selection Dropdown */}
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-32 bg-[#eee5da] border-[#262424] shadow-none hover:bg-[#ffdbc7] font-newsreader">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent className="bg-[#eee5da] border-[#262424]">
                  {monthOptions.map((month) => (
                    <CustomSelectItem
                      key={month.value}
                      value={month.value}
                      className={`font-newsreader hover:bg-[#ffdbc7] hover:text-[#262424] cursor-pointer ${
                        month.value === selectedMonth
                          ? "bg-[#262424] text-[#eee5da]"
                          : ""
                      }`}
                    >
                      {month.label}
                    </CustomSelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Year Selection Dropdown */}
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-24 bg-[#eee5da] border-[#262424] shadow-none hover:bg-[#ffdbc7] font-newsreader">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="bg-[#eee5da] border-[#262424]">
                  {yearOptions.map((year) => (
                    <CustomSelectItem
                      key={year.value}
                      value={year.value}
                      className={`font-newsreader hover:bg-[#ffdbc7] hover:text-[#262424] cursor-pointer ${
                        year.value === selectedYear
                          ? "bg-[#262424] text-[#eee5da]"
                          : ""
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

      {/* Calendar Grid Section */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Calendar Grid Container */}
        <div className="bg-[#eee5da] border-2 border-[#262424]">
          {/* Day Headers (Sun, Mon, Tue, etc.) */}
          <div className="grid grid-cols-7 border-b-2 border-[#262424]">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-4 text-center font-bold border-r border-[#262424] last:border-r-0 font-newsreader"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 select-none">
            {renderCalendarGrid()}
          </div>
        </div>

        {/* Instructions for Calendar Usage */}
        <div className="mt-8 text-center text-sm text-[#262424] font-newsreader">
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
