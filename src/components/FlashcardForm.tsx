"use client";
import { useState } from "react";

export default function FlashcardForm({ onAdd }: { onAdd: (front: string, back: string) => void }) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  const handleSubmit = () => {
    if (!front.trim() || !back.trim()) return;
    onAdd(front, back);
    setFront("");
    setBack("");
  };

  return (
    <div className="flex gap-2 mb-6">
      <input
        value={front}
        onChange={(e) => setFront(e.target.value)}
        placeholder="Mặt trước"
        className="px-3 py-2 border rounded-lg"
      />
      <input
        value={back}
        onChange={(e) => setBack(e.target.value)}
        placeholder="Mặt sau"
        className="px-3 py-2 border rounded-lg"
      />
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
      >
        Thêm
      </button>
    </div>
  );
}
