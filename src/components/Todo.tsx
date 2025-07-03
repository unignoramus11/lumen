/**
 * @file This file defines the Todo component, which displays a suggested activity.
 * It fetches activity data and presents it as a command from an "oracle", with a loading state and fallback.
 */

"use client";

import type { Activity } from "../types";

/**
 * Props for the Todo component.
 * @property {Activity} [activity] - The activity data to be displayed.
 * @property {boolean} [loading=false] - Indicates if the activity data is currently being loaded.
 */
interface TodoProps {
  activity?: Activity;
  loading?: boolean;
}

/**
 * Todo component displays a single suggested activity.
 * It shows a loading indicator while fetching data and a fallback message if the activity cannot be loaded.
 * The activity is presented as a command from an "oracle".
 * @param {TodoProps} { activity, loading } - The props for the component.
 * @returns {JSX.Element} The JSX for the Todo component.
 */
export default function Todo({ activity, loading = false }: TodoProps) {
  return (
    <div className="max-w-6xl mx-auto px-8 py-8 text-center">
      <div className="border-t-2 border-b-2 border-[#262424] py-6">
        <p className="text-sm mb-2 font-newsreader">
          The oracle commands you to...
        </p>
        <p className="text-2xl font-bold font-newsreader leading-relaxed">
          {loading
            ? "Consulting the oracle..."
            : activity?.activity || "Take a moment to breathe and relax"}
        </p>
      </div>
    </div>
  );
}
