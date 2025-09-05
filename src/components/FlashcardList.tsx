"use client";

import { useState } from "react";
import { FlashcardList } from "@/types";

interface Props {
  list: FlashcardList;
}

export default function FlashcardListComp({ list }: Props) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = list.cards[current];

  const handleNext = () => {
    setFlipped(false);
    setCurrent((prev) => (prev + 1) % list.cards.length);
  };

  return (
    <div className="p-6 max-w-md mx-auto text-center">
      <h2 className="text-xl font-bold mb-4">{list.name}</h2>

      {/* Flashcard */}
      <div
        className={`relative w-64 h-40 cursor-pointer mx-auto perspective`}
        onClick={() => setFlipped(!flipped)}
      >
        <div
          className={`absolute w-full h-full transition-transform duration-500 preserve-3d ${
            flipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front */}
          <div className="absolute w-full h-full flex items-center justify-center bg-white rounded-xl shadow-xl backface-hidden">
            <p className="text-lg font-semibold">{card.front}</p>
          </div>
          {/* Back */}
          <div className="absolute w-full h-full flex items-center justify-center bg-blue-100 rounded-xl shadow-xl rotate-y-180 backface-hidden">
            <p className="text-lg">{card.back}</p>
          </div>
        </div>
      </div>

      <button
        onClick={handleNext}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg shadow"
      >
        Next Card
      </button>
    </div>
  );
}
