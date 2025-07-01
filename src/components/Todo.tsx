export default function Todo() {
  const randomActivities = [
    "Take a walk in nature and observe the changing seasons",
    "Write a handwritten letter to someone you care about",
    "Learn three new words in a foreign language",
    "Create something with your hands - draw, craft, or cook",
    "Call an old friend you haven't spoken to in a while",
    "Read a chapter from a book you've been meaning to finish",
    "Practice gratitude by listing five things you're thankful for",
    "Organize one small area of your living space",
    "Try a new recipe using ingredients you already have",
    "Spend 10 minutes in complete silence and reflection",
  ];

  const randomActivity =
    randomActivities[Math.floor(Math.random() * randomActivities.length)];

  return (
    <div className="max-w-6xl mx-auto px-8 py-8 text-center">
      <div className="border-t-2 border-b-2 border-black py-6">
        <p className="text-sm mb-2 font-newsreader">
          The oracle commands you to...
        </p>
        <p className="text-2xl font-bold font-newsreader leading-relaxed">
          {randomActivity}
        </p>
      </div>
    </div>
  );
}
