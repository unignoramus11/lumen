"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BanterLoader from "../components/BanterLoader";
import NewspaperDatePicker from "../components/NewspaperDatePicker";
import PhotoContent from "../components/PhotoContent";
import SideContent from "../components/SideContent";
import Facts from "../components/Facts";
import Todo from "../components/Todo";
import Comic from "../components/Comic";
import { fetchDailyData } from "../lib/api";
import type { DailyData } from "../types";

function HomePage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [dailyData, setDailyData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
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
    if (isClient && !isMobile) {
      // Convert selected date to IST and format as YYYY-MM-DD
      const dateString = selectedDate.toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });
      setLoading(true);
      fetchDailyData(dateString)
        .then(setDailyData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedDate, isClient, isMobile]);

  // Show loading overlay while data is loading (only for desktop)
  const isLoading = !isMobile && loading;

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

  return (
    <div className="relative min-h-screen bg-white text-black font-newsreader">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-95 z-50 flex items-center justify-center">
          <BanterLoader />
        </div>
      )}
      {/* Newspaper Header */}
      <header className="py-8 select-none">
        <div className="max-w-6xl mx-auto px-8">
          {/* Newspaper Masthead */}
          <div className="text-center">
            <div className="border-t-2 border-b-2 border-black py-2 mb-4">
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

            {/* Main Title */}
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

            {/* Subtitle/Tagline */}
            <div className="border-t-2 border-b-2 border-black py-2">
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

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-8">
        {!loading && dailyData === null ? (
          <div className="text-center py-20">
            <h1 className="text-6xl font-bold font-newsreader">i forgor</h1>
          </div>
        ) : (
          <>
            {/* Main Headline */}
            <h1 className="text-5xl font-bold mb-8 leading-tight font-newsreader">
              {dailyData?.headline ||
                "Breaking: Revolutionary Photo-Journaling Platform Launches"}
            </h1>

            <div className="flex">
              {/* Photo Content - 70% */}
              <div className="flex-[7] pr-8">
                <PhotoContent photo={dailyData?.photo} loading={loading} />
              </div>

              {/* Vertical separator line */}
              <div className="border-l border-black"></div>

              {/* Side Content - 30% */}
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

      {/* Only show these sections if we have data or are loading */}
      {(loading || dailyData !== null) && (
        <>
          {/* Comic Strip Section */}
          <Comic comic={dailyData?.comic} loading={loading} />

          {/* Facts Component */}
          <Facts
            catFact={dailyData?.catFact}
            dogFact={dailyData?.dogFact}
            triviaFact={dailyData?.triviaFact}
            loading={loading}
          />

          {/* Todo Section */}
          <Todo activity={dailyData?.activity} loading={loading} />
        </>
      )}
    </div>
  );
}

export default function Home() {
  return <HomePage />;
}
