"use client";
import { useState } from "react";

interface Flashcard {
  front: string;
  back: string;
}

const flashcards: Flashcard[] = [
  { front: "犬 (いぬ)", back: "Con chó" },
  { front: "猫 (ねこ)", back: "Con mèo" },
  { front: "学校 (がっこう)", back: "Trường học" },
];

export default function FlashcardPage() {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const handleFlip = () => setFlipped(!flipped);
  const nextCard = () => {
    setFlipped(false);
    setCurrent((prev) => (prev + 1) % flashcards.length);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div
        className="w-64 h-40 [perspective:1000px]"
        onClick={handleFlip}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* Front */}
          <div className="absolute w-full h-full flex items-center justify-center text-xl font-bold rounded-2xl shadow-lg bg-white backface-hidden">
            {flashcards[current].front}
          </div>

          {/* Back */}
          <div className="absolute w-full h-full flex items-center justify-center text-xl font-bold rounded-2xl shadow-lg bg-blue-200 [transform:rotateY(180deg)] backface-hidden">
            {flashcards[current].back}
          </div>
        </div>
      </div>

      <button
        onClick={nextCard}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-xl shadow hover:bg-blue-600"
      >
        Thẻ tiếp theo
      </button>
    </div>
  );
}
