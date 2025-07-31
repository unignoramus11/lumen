"use client";

/**
 * @file This file defines the main home page component for the Lumen Sigma application.
 * It orchestrates the fetching and display of daily content, including photos, poems, jokes,
 * facts, activities, and comics. It also handles responsive behavior for mobile devices
 * and provides a date picker for navigating daily entries.
 */

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import BanterLoader from "../components/BanterLoader";
import NewspaperDatePicker from "../components/NewspaperDatePicker";
import PhotoContent from "../components/PhotoContent";
import SideContent from "../components/SideContent";
import Facts from "../components/Facts";
import Todo from "../components/Todo";
import Comic from "../components/Comic";
import { fetchDailyData, fetchLatestAvailableDate } from "../lib/api";
import type { DailyData } from "../types";

/**
 * HomePage component responsible for rendering the main content of the Lumen Sigma application.
 * It manages state for daily data, loading indicators, mobile responsiveness, and date selection.
 * It also includes a hidden tap gesture for navigation to the publish page.
 * @returns {JSX.Element} The main home page UI.
 */
function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
   * State to store the fetched daily content data.
   * @type {DailyData | null}
   */
  const [dailyData, setDailyData] = useState<DailyData | null>(null);
  /**
   * State to indicate if data is currently being loaded.
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
   * State for the currently selected date for which to display content.
   * Initializes to yesterday's date.
   * @type {Date}
   */
  const [selectedDate, setSelectedDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  });
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
   * On mobile, three consecutive taps within 3 seconds will navigate to the /publish route.
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

      // Set a new timer to reset the tap count after 3 seconds if no more taps occur
      const timer = setTimeout(() => {
        setTapCount(0);
        setTapTimer(null);
      }, 3000);
      setTapTimer(timer);
    }
  };

  /**
   * useEffect hook for initial client-side setup and mobile device detection.
   * - Sets `isClient` to true once the component mounts on the client.
   * - Detects if the device is mobile based on window width and updates `isMobile` state.
   * - Adds and removes a resize event listener for dynamic mobile detection.
   * - Sets a minimum loading time to prevent flashing content.
   * - Parses a 'date' parameter from the URL query string to pre-select a date.
   * - Fetches the latest available date with content if no date parameter is provided.
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

    // Check for a 'date' parameter in the URL query string
    const dateParam = searchParams.get("date");
    if (dateParam) {
      try {
        const parsedDate = new Date(dateParam);
        // Validate if the parsed date is a valid date
        if (!isNaN(parsedDate.getTime())) {
          setSelectedDate(parsedDate);
        }
      } catch (error) {
        console.error("Invalid date parameter:", dateParam, error);
      }
    } else {
      // If no date parameter, fetch the latest available date with content
      fetchLatestAvailableDate()
        .then((dateString) => {
          setSelectedDate(new Date(dateString));
        })
        .catch((error) => {
          console.error("Failed to fetch latest available date:", error);
          // Keep the default yesterday date on error
        });
    }

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
  }, [tapTimer, searchParams]); // Dependencies: re-run if tapTimer or searchParams change

  /**
   * useEffect hook for fetching daily data based on the selected date.
   * - Only runs on the client-side and if the device is not mobile.
   * - Converts the `selectedDate` to a YYYY-MM-DD string in IST (Indian Standard Time).
   * - Calls `fetchDailyData` from the API utility to get content for the selected date.
   * - Updates `dailyData` state and manages `loading` state during the fetch operation.
   */
  useEffect(() => {
    if (isClient && !isMobile) {
      // Convert selected date to IST and format as YYYY-MM-DD for API consistency
      const dateString = selectedDate.toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });
      setLoading(true); // Set loading to true before fetching data
      fetchDailyData(dateString)
        .then(setDailyData) // Update dailyData state with fetched data
        .catch(console.error) // Log any errors during fetching
        .finally(() => setLoading(false)); // Set loading to false after fetch completes (success or error)
    }
  }, [selectedDate, isClient, isMobile]); // Dependencies: re-run if selectedDate, isClient, or isMobile change

  /**
   * Determines if a loading overlay should be shown.
   * True if `loading` (data fetching) or `initialLoading` (minimum load time) is active.
   * @type {boolean}
   */
  const isLoading = loading || initialLoading;

  // Render nothing during server-side rendering or initial client render to prevent hydration mismatches.
  // This ensures the client-side rendering takes over smoothly.
  if (!isClient) {
    return null;
  }

  // Early return for mobile devices: display a message indicating desktop-only access.
  // This prevents unnecessary rendering of complex components on unsupported devices.
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
      {/* Loading Overlay: Displays a loader while content is being fetched or during initial load. */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#eee5da] bg-opacity-95 z-50 flex items-center justify-center">
          <BanterLoader />
        </div>
      )}
      {/* Newspaper Header: Contains the masthead, title, and tagline. */}
      <header className="py-8 select-none">
        <div className="max-w-6xl mx-auto px-8">
          {/* Newspaper Masthead: Displays established date, daily status, and date picker. */}
          <div className="text-center">
            <div className="border-t-2 border-b-2 border-[#262424] py-2 mb-4">
              <div className="grid grid-cols-3 items-center text-sm">
                <span className="px-2 py-1 rounded justify-self-start">
                  ESTABLISHED 2025
                </span>
                <span className="px-2 py-1 rounded justify-self-center">
                  DAILY(?)
                </span>
                <div className="justify-self-end">
                  <NewspaperDatePicker
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                  />
                </div>
              </div>
            </div>

            {/* Main Title: The prominent "Lumen Sigma" title with logo. */}
            <h1 className="text-8xl font-bold tracking-wider mb-4 text-center font-unifraktur">
              Lumen
              <Image
                src="/logo.png"
                alt="Lumen Sigma Logo"
                className="inline-block mx-8"
                width={128}
                height={128}
                priority
              />
              Sigma
            </h1>

            {/* Subtitle/Tagline: Displays project attribution and a link to the GitHub repository. */}
            <div className="border-t-2 border-b-2 border-[#262424] py-2">
              A HOBBY PROJECT BY&nbsp;
              <Link
                href="https://github.com/unignoramus11/lumen"
                target="_blank"
                rel="noopener noreferrer"
              >
                UNIGNORAMUS
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area: Contains the photo content and side content (poem, joke). */}
      <main className="max-w-6xl mx-auto p-8">
        {/* Conditional rendering for when no daily data is found. */}
        {!loading && dailyData === null ? (
          <div className="text-center py-20">
            <h1 className="text-6xl font-bold font-newsreader">i forgor</h1>
          </div>
        ) : (
          <>
            {/* Main Headline: Displays the daily headline or a default one. */}
            <h1 className="text-5xl font-bold mb-8 leading-tight font-newsreader">
              {dailyData?.headline ||
                "Breaking: Revolutionary Photo-Journaling Platform Launches"}
            </h1>

            <div className="flex">
              {/* Photo Content Section: Displays the main photo for the day. */}
              <div className="flex-[7] pr-8">
                <PhotoContent photo={dailyData?.photo} loading={loading} />
              </div>

              {/* Vertical separator line for visual division. */}
              <div className="border-l border-[#262424]"></div>

              {/* Side Content Section: Displays the poem and joke for the day. */}
              <div className="flex-[3] pl-8">
                <SideContent
                  poem={dailyData?.poem}
                  joke={dailyData?.joke}
                  loading={loading}
                />
              </div>
            </div>
          </>
        )}
      </main>

      {/* Additional Sections: Comic Strip, Facts, and Todo, displayed only when data is available or loading. */}
      {(loading || dailyData !== null) && (
        <>
          {/* Comic Strip Section: Displays the daily comic. */}
          <Comic comic={dailyData?.comic} loading={loading} />

          {/* Facts Component: Displays cat fact, dog fact, and trivia fact. */}
          <Facts
            catFact={dailyData?.catFact}
            dogFact={dailyData?.dogFact}
            triviaFact={dailyData?.triviaFact}
            loading={loading}
          />

          {/* Todo Section: Displays the daily activity. */}
          <Todo activity={dailyData?.activity} loading={loading} />
        </>
      )}
    </div>
  );
}

/**
 * The main Home component that wraps HomePage with a Suspense boundary.
 * This is necessary for Next.js to handle client-side rendering and data fetching
 * gracefully, providing a fallback while the HomePage component is being prepared.
 * @returns {JSX.Element} The Home component with Suspense.
 */
export default function Home() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#eee5da] z-50" />}>
      <HomePage />
    </Suspense>
  );
}
