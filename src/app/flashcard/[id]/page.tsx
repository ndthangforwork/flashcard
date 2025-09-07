"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FlashcardList } from "@/types";
import { Empty } from "antd";

export default function FlashcardDetailPage() {
  const { id } = useParams();
  const [flashcard, setFlashcard] = useState<FlashcardList | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState<"flip" | "typing" | "quiz">("flip");
  const [answer, setAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>("");
   // thêm state shuffle deck
  const [quizOrder, setQuizOrder] = useState<number[]>([]);
  const [quizPos, setQuizPos] = useState(0);

  const router = useRouter();

  // fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `https://be-flashcard-rikj.onrender.com/flashcards/${id}`
        );
        const data = await res.json();
        setFlashcard(data);
      } catch (err) {
        console.error("Failed to fetch flashcard", err);
      }
    }
    if (id) fetchData();
  }, [id]);

  // khi đổi mode sang quiz → tạo shuffle deck
  useEffect(() => {
    if (mode === "quiz" && flashcard) {
      const order = [...flashcard.cards.keys()].sort(() => 0.5 - Math.random());
      setQuizOrder(order);
      setQuizPos(0);
      setCurrentIndex(order[0]);
    }
  }, [mode, flashcard]);

  // generate options khi ở quiz mode hoặc khi currentIndex thay đổi
  useEffect(() => {
    if (mode === "quiz" && flashcard) {
      generateOptions();
    }
    // reset state khi đổi câu
    setIsCorrect(null);
    setAnswer("");
    setSelectedOption("");
    setFlipped(false);
  }, [mode, currentIndex, flashcard]);

  if (!flashcard) return <p className="text-center mt-10">Đang tải...</p>;
  if (flashcard.cards.length === 0) return <Empty description="Không có dữ liệu" />;

  const card = flashcard.cards[currentIndex];

  const handleNext = () => {
    if (mode === "quiz") {
      // đi tiếp trong shuffle deck
      const nextPos = (quizPos + 1) % quizOrder.length;
      setQuizPos(nextPos);
      setCurrentIndex(quizOrder[nextPos]);
    } else {
      setCurrentIndex((prev) => (prev + 1) % flashcard.cards.length);
    }
  };

  const handleRandom = () => {
    const randomIndex = Math.floor(Math.random() * flashcard.cards.length);
    setCurrentIndex(randomIndex);
  };

  const handleFlip = () => setFlipped(!flipped);

  // Tạo 4 đáp án (1 đúng, 3 sai random)
  const generateOptions = () => {
    if (!flashcard) return;
    const correctAnswer = flashcard.cards[currentIndex].back;

    let wrongAnswers = flashcard.cards
      .map((c) => c.back)
      .filter((ans) => ans !== correctAnswer);

    wrongAnswers = wrongAnswers.sort(() => 0.5 - Math.random()).slice(0, 3);

    const allOptions = [correctAnswer, ...wrongAnswers].sort(
      () => 0.5 - Math.random()
    );
    setOptions(allOptions);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-[#e2e2e2] to-[#c9d6ff] p-6 mb-10">
      <h1 className="text-3xl font-bold mb-6">{flashcard.name}</h1>

      {/* Nút quay về */}
      <button
        onClick={() => router.push("/")}
        className="mb-6 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
      >
        ← Quay về Home
      </button>

      {/* Chọn mode */}
      <div className="flex gap-4 mb-6">
        {["flip", "typing", "quiz"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m as typeof mode)}
            className={`px-4 py-2 rounded-lg ${
              mode === m
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {m === "flip"
              ? "Flip Mode"
              : m === "typing"
              ? "Typing Mode"
              : "Quiz Mode"}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center pb-[150px]">
        {/* Quiz Mode */}
        {mode === "quiz" && (
          <div className="flex flex-col items-center">
            <div className="w-96 h-40 sm:w-[600px] sm:h-[250px] flex items-center justify-center text-3xl sm:text-5xl font-bold rounded-2xl shadow-lg bg-white mb-6">
              {card.front}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[600px]">
              {options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedOption(opt);
                    if (
                      opt.trim().toLowerCase() ===
                      card.back.trim().toLowerCase()
                    ) {
                      setIsCorrect(true);
                    } else {
                      setIsCorrect(false);
                    }
                  }}
                  className={`px-4 py-3 rounded-lg shadow text-lg font-medium transition
                    ${
                      isCorrect !== null
                        ? opt === card.back
                          ? "bg-green-500 text-white"
                          : opt === selectedOption
                          ? "bg-red-500 text-white"
                          : "bg-gray-200"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {isCorrect !== null && (
              <p
                className={`mt-4 font-semibold ${
                  isCorrect ? "text-green-600" : "text-red-600"
                }`}
              >
                {isCorrect
                  ? "✅ Chính xác!"
                  : `❌ Sai rồi. Đáp án: ${card.back}`}
              </p>
            )}

            <button
              onClick={handleNext}
              className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
            >
              Thẻ tiếp theo
            </button>
          </div>
        )}

        {/* Flip Mode */}
        {mode === "flip" && (
          <>
            <div
              className="w-96 h-56 [perspective:1000px] sm:w-[600px] sm:h-[450px]"
              onClick={handleFlip}
            >
              <div
                className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
                  flipped ? "[transform:rotateY(180deg)]" : ""
                }`}
              >
                {/* Front */}
                <div className="absolute w-full h-full flex items-center justify-center text-3xl sm:text-8xl font-bold rounded-2xl shadow-lg bg-white backface-hidden">
                  {card.front}
                </div>

                {/* Back */}
                <div className="absolute w-full h-full flex items-center justify-center text-3xl sm:text-8xl font-bold rounded-2xl shadow-lg bg-blue-200 [transform:rotateY(180deg)] backface-hidden">
                  {card.back}
                </div>
              </div>
            </div>

            {/* Nút next */}
            <button
              onClick={handleNext}
              className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
            >
              Thẻ tiếp theo
            </button>

            {/* Progress + Input chỉnh số thứ tự */}
            <div className="mt-3 flex flex-col items-center gap-2">
              <p className="text-gray-600">
                {currentIndex + 1} / {flashcard.cards.length}
              </p>
              <div className="flex items-center gap-2">
                <label htmlFor="cardIndex" className="text-sm text-gray-700">
                  Chọn thẻ:
                </label>
                <input
                  id="cardIndex"
                  type="number"
                  min={1}
                  max={flashcard.cards.length}
                  value={currentIndex + 1}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 1 && value <= flashcard.cards.length) {
                      setFlipped(false);
                      setCurrentIndex(value - 1);
                    }
                  }}
                  className="w-20 border rounded px-2 py-1 bg-white"
                />
              </div>
            </div>
          </>
        )}

        {/* Typing Mode */}
        {mode === "typing" && (
          <div className="flex flex-col items-center">
            <div className="w-96 h-40 sm:w-[600px] sm:h-[450px] flex items-center justify-center text-3xl sm:text-8xl font-bold rounded-2xl shadow-lg bg-white">
              {card.front}
            </div>

            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Nhập câu trả lời..."
              className="mt-4 px-4 py-2 border rounded-lg w-80 bg-white"
            />

            <div className="flex gap-4 mt-4">
              <button
                onClick={() => {
                  if (
                    card.back
                      .trim()
                      .toLowerCase()
                      .includes(answer.trim().toLowerCase())
                  ) {
                    setIsCorrect(true);
                  } else {
                    setIsCorrect(false);
                  }
                }}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Kiểm tra
              </button>

              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
              >
                Thẻ tiếp theo
              </button>

              <button
                onClick={handleRandom}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 transition"
              >
                Random
              </button>
            </div>

            {isCorrect === true && (
              <p className="mt-2 text-green-600">
                ✅ Chính xác! Đáp án là: <b>{card.back}</b>
              </p>
            )}
            {isCorrect === false && (
              <p className="mt-2 text-red-600">
                ❌ Sai rồi. Đáp án đúng: <b>{card.back}</b>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
