"use client";

import type { Activity } from "../types";

interface TodoProps {
  activity?: Activity;
  loading?: boolean;
}

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
