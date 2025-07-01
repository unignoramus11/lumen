export default function Facts() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <div className="grid grid-cols-3 gap-8">
        {/* Cat Fact */}
        <div className="text-center">
          <h3 className="text-xl font-bold mb-4">Meow Mix</h3>
          <p className="text-sm leading-relaxed">
            Cats have a third eyelid called a nictitating membrane that helps
            protect their eyes during hunting and play.
          </p>
        </div>

        {/* Random Fact */}
        <div className="text-center border-l border-r border-black px-8">
          <h3 className="text-xl font-bold mb-4">Trivia Dump</h3>
          <p className="text-sm leading-relaxed">
            Honey never spoils. Archaeologists have found pots of honey in
            ancient Egyptian tombs that are over 3,000 years old and still
            perfectly edible.
          </p>
        </div>

        {/* Dog Fact */}
        <div className="text-center">
          <h3 className="text-xl font-bold mb-4">Pup Culture</h3>
          <p className="text-sm leading-relaxed">
            Dogs have around 300 million olfactory receptors in their noses,
            compared to humans who have about 6 million.
          </p>
        </div>
      </div>
    </div>
  );
}
