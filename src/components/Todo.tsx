"use client";

import { useState, useEffect } from "react";

export default function Todo() {
  const [activity, setActivity] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch("/api/activity");
        const data = await response.json();
        setActivity(data.activity);
      } catch (error) {
        console.error("Error fetching activity:", error);
        setActivity("take a moment to breathe and relax");
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-8 py-8 text-center">
      <div className="border-t-2 border-b-2 border-black py-6">
        <p className="text-sm mb-2 font-newsreader">
          The oracle commands you to...
        </p>
        <p className="text-2xl font-bold font-newsreader leading-relaxed">
          {loading ? "Consulting the oracle..." : activity}
        </p>
      </div>
    </div>
  );
}
