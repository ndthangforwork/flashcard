"use client";
import { useState } from "react";

interface FlashcardType {
  id?: number;
  front: string;
  back: string;
}

export default function Flashcard({ card }: { card: FlashcardType }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="w-64 h-40 [perspective:1000px] cursor-pointer"
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        <div className="absolute w-full h-full flex items-center justify-center text-xl font-bold rounded-2xl shadow-lg bg-white backface-hidden">
          {card.front}
        </div>
        <div className="absolute w-full h-full flex items-center justify-center text-xl font-bold rounded-2xl shadow-lg bg-blue-200 [transform:rotateY(180deg)] backface-hidden">
          {card.back}
        </div>
      </div>
    </div>
  );
}

