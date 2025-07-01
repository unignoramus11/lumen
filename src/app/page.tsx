"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import BanterLoader from "../components/BanterLoader";
import NewspaperDatePicker from "../components/NewspaperDatePicker";
import PhotoContent from "../components/PhotoContent";
import SideContent from "../components/SideContent";
import Facts from "../components/Facts";
import Todo from "../components/Todo";
import Comic from "../components/Comic";
import { LoadingProvider, useLoading } from "../contexts/LoadingContext";

function HomePage() {
  const [isMobile, setIsMobile] = useState(false);
  const { allLoaded } = useLoading();

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
    };
  }, []);

  // Show loading overlay while APIs are still loading
  const isLoading = !allLoaded;

  if (isMobile) {
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
                  <NewspaperDatePicker />
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
                href="https://github.com/unignoramus11"
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
        <div className="flex">
          {/* Photo Content - 70% */}
          <div className="flex-[7] pr-8">
            <PhotoContent />
          </div>

          {/* Vertical separator line */}
          <div className="border-l border-black"></div>

          {/* Side Content - 30% */}
          <div className="flex-[3] pl-8">
            <SideContent />
          </div>
        </div>
      </main>

      {/* Comic Strip Section */}
      <Comic />

      {/* Facts Component */}
      <Facts />

      {/* Todo Section */}
      <Todo />
    </div>
  );
}

export default function Home() {
  return (
    <LoadingProvider>
      <HomePage />
    </LoadingProvider>
  );
}
