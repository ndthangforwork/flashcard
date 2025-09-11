"use client";

import { message } from "antd";
import router from "next/router";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Food = {
  name: string;
  imageUrl: string;
};

export default function FoodsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [mode, setMode] = useState<"flip" | "typing" | "quiz">("flip");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<null | boolean>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quizOptions, setQuizOptions] = useState<Food[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState<boolean>(false);

  const currentFood = foods.length > 0 ? foods[currentIndex] : null;

  const router = useRouter();

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(
          "https://be-flashcard-rikj.onrender.com/foods"
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data: Food[] = await res.json();
        setFoods(data);
        setCurrentIndex(0);
      } catch (err) {
        console.error(err);
        message.error("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (mode !== "quiz" || !currentFood || foods.length === 0) {
      setQuizOptions([]);
      return;
    }

    // chọn 3 câu sai ngẫu nhiên
    const wrong = foods.filter((f) => f.name !== currentFood.name);
    // shuffle wrong then take up to 3
    const shuffledWrong = wrong.sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [...shuffledWrong, currentFood].sort(() => Math.random() - 0.5);

    setQuizOptions(options);
    // reset quiz state
    setSelected(null);
    setAnswered(false);
    setResult(null);
  }, [mode, currentFood, foods]);

  // Tạo 4 đáp án cho quiz
  useEffect(() => {
    if (mode === "quiz" && currentFood && foods.length > 0) {
      const wrongOptions = foods
        .filter((f) => f.name !== currentFood.name)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const options = [...wrongOptions, currentFood].sort(
        () => Math.random() - 0.5
      );
      setQuizOptions(options);
      setResult(null);
    }
  }, [mode, currentFood, foods]);

  const handleFlip = () => setFlipped((prev) => !prev);

  const handleCheck = () => {
    if (!currentFood) return;
    if (answer.trim().toLowerCase() === currentFood.name.toLowerCase()) {
      setResult(true);
    } else {
      setResult(false);
    }
  };

  const handleQuizAnswer = (selected: string) => {
    if (!currentFood) return;
    setResult(selected === currentFood.name);
  };

  const nextCard = () => {
    if (foods.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % foods.length);
    setFlipped(false);
    setAnswer("");
    setResult(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  // Empty state
  if (!currentFood) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Không có flashcard nào</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      {/* Home Button */}
      <button
        onClick={() => router.push("/")}
        className="mb-6 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
      >
        ← Quay về Home
      </button>

      <h1 className="text-2xl font-bold mb-4">Flashcard Foods</h1>

      {/* Switch Mode */}
      <div className="mb-6">
        <button
          className={`px-4 py-2 rounded-l-lg ${
            mode === "flip" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode("flip")}
        >
          Flip Mode
        </button>
        <button
          className={`px-4 py-2 ${
            mode === "typing" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode("typing")}
        >
          Typing Mode
        </button>
        <button
          className={`px-4 py-2 rounded-r-lg ${
            mode === "quiz" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode("quiz")}
        >
          Quiz Mode
        </button>
      </div>

      {/* Flip Mode */}
{mode === "flip" && (
  <div
    className="w-[28rem] h-[25rem] perspective cursor-pointer"
    onClick={handleFlip}
  >
    <div
      className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
        flipped ? "[transform:rotateY(180deg)]" : ""
      }`}
    >
      {/* Front */}
      <div className="absolute w-full h-full flex items-center justify-center rounded-2xl shadow-lg bg-white backface-hidden">
        <img
          src={currentFood.imageUrl}
          alt={currentFood.name}
          className="w-96 h-96 object-cover rounded-lg"
        />
      </div>

      {/* Back */}
      <div className="absolute w-full h-full flex items-center justify-center rounded-2xl shadow-lg bg-blue-100 [transform:rotateY(180deg)] backface-hidden">
        <p className="text-4xl sm:text-6xl font-bold text-center px-4">
          {currentFood.name}
        </p>
      </div>
    </div>
    {/* Progress + Input chỉnh số thứ tự */}
        <div className="mt-3 flex flex-col items-center gap-2 mt-20">
            <p className="text-gray-600">
            {currentIndex + 1} / {foods.length}
            </p>
            <div className="flex items-center gap-2">
            <label htmlFor="cardIndex" className="text-sm text-gray-700">
                Chọn thẻ:
            </label>
            <input
                id="cardIndex"
                type="number"
                min={1}
                max={foods.length}
                value={currentIndex + 1}
                onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 1 && value <= foods.length) {
                        setFlipped(false);
                        setCurrentIndex(value - 1);
                    }
                }}
                className="w-20 border rounded px-2 py-1 bg-white"
            />
            </div>
        </div>
  </div>
)}

{/* Typing Mode */}
{mode === "typing" && (
  <div className="w-[28rem] h-[36rem] bg-white rounded-lg shadow flex flex-col items-center justify-center p-8">
    <img
      src={currentFood.imageUrl}
      alt={currentFood.name}
      className="w-80 h-80 object-cover mb-6 rounded"
    />
    <input
      type="text"
      value={answer}
      onChange={(e) => setAnswer(e.target.value)}
      placeholder="Nhập tên món..."
      className="border p-4 rounded w-full mb-4 text-xl"
    />
    <button
      onClick={handleCheck}
      className="bg-green-500 text-white px-8 py-3 rounded mb-4 text-xl"
    >
      Kiểm tra
    </button>
    {result !== null && (
      <p
        className={`font-bold text-xl ${
          result ? "text-green-600" : "text-red-600"
        }`}
      >
        {result ? "Đúng rồi!" : `Sai, đáp án: ${currentFood.name}`}
      </p>
    )}
  </div>
)}

{/* Quiz Mode */}
{mode === "quiz" && (
  <div className="w-[45rem] bg-white rounded-lg shadow flex flex-col items-center justify-center p-8">
    <img
      src={currentFood.imageUrl}
      alt={currentFood.name}
      className="w-80 h-80 object-cover mb-6 rounded"
    />
    <div className="grid grid-cols-2 gap-4 w-full">
      {quizOptions.map((opt, i) => {
        const isCorrect = opt.name === currentFood.name;
        const isSelected = opt.name === selected;
        const btnClass = answered
          ? isCorrect
            ? "bg-green-500 text-white border-green-600"
            : isSelected
            ? "bg-red-500 text-white border-red-600"
            : "bg-gray-200 border-gray-300"
          : "bg-white hover:bg-blue-100 border-gray-400";

        return (
          <button
            key={i}
            onClick={() => handleQuizAnswer(opt.name)}
            className={`${btnClass} px-6 py-4 rounded text-xl text-center`}
          >
            {opt.name}
          </button>
        );
      })}
    </div>

    {result !== null && (
      <p
        className={`mt-6 font-bold text-2xl ${
          result ? "text-green-600" : "text-red-600"
        }`}
      >
        {result ? "Chính xác 🎉" : `Sai, đáp án: ${currentFood.name}`}
      </p>
    )}
  </div>
)}



      {/* Next Button */}
      <button
        onClick={nextCard}
        className="mt-6 bg-gray-700 text-white px-4 py-2 rounded"
      >
        Next
      </button>
    </div>
  );
}
