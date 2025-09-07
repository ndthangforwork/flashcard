"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Result, Spin, message, Progress } from "antd";

type Flashcard = {
  front: string;
  back: string;
};

type FlashcardSet = {
  _id: string;
  name: string;
  cards: Flashcard[];
};

type Question = {
  front: string;
  correct: string;
  options: string[];
};

// Shuffle helper
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function QuickQuizPage() {
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);

  // Fetch dữ liệu
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch("https://be-flashcard-rikj.onrender.com/flashcards");
        const data: FlashcardSet[] = await res.json();

        const allCards = data.flatMap((set) => set.cards);
        if (allCards.length === 0) {
          setQuestions([]);
          return;
        }

        const sampled = shuffle(allCards).slice(0, 10);

        const qList: Question[] = sampled.map((card) => {
          const wrongAnswers = shuffle(
            allCards.filter((c) => c.back !== card.back).map((c) => c.back)
          ).slice(0, 3);

          const options = shuffle([card.back, ...wrongAnswers]);

          return {
            front: card.front,
            correct: card.back,
            options,
          };
        });

        setQuestions(qList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (finished || answered) return;

    if (timeLeft === 0) {
      // Hết giờ -> coi như sai
      setAnswered(true);
      message.error(`Hết giờ! Đáp án đúng: ${questions[index].correct}`);
      return;
    }

    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, answered, finished, index, questions]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <Result
        status="404"
        title="Không có flashcard nào để chơi Quiz"
        extra={<Button onClick={() => router.push("/")}>Quay lại trang chủ</Button>}
      />
    );
  }

  const current = questions[index];

  const handleSelect = (option: string) => {
    if (answered) return;

    setSelected(option);
    setAnswered(true);

    if (option === current.correct) {
      setScore((prev) => prev + 1);
      message.success("Đúng rồi 🎉");
    } else {
      message.error(`Sai rồi 😢. Đáp án đúng: ${current.correct}`);
    }
  };

  const nextQuestion = () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setSelected(null);
      setAnswered(false);
      setTimeLeft(10); // reset countdown
    } else {
      setFinished(true);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-[#f0f4ff] to-[#e2e8f0] p-6">
      <div className="w-[700px]">
        {!finished ? (
          <Card
            className="rounded-2xl shadow-lg"
            title={`Câu ${index + 1} / ${questions.length}`}
            extra={
              <div className="flex items-center gap-2">
                <span>⏱ {timeLeft}s</span>
                <Progress
                  percent={(timeLeft / 10) * 100}
                  showInfo={false}
                  strokeColor={timeLeft <= 3 ? "red" : "green"}
                  className="w-24"
                />
              </div>
            }
          >
            <p className="text-4xl font-semibold mb-6 text-center">{current.front}</p>

            <div className="grid grid-cols-2 gap-4">
              {current.options.map((opt, i) => (
                <Card
                  key={i}
                  hoverable={!answered}
                  onClick={() => handleSelect(opt)}
                  className={`cursor-pointer text-center font-medium transition-all ${
                    answered && opt === current.correct
                      ? "!border-1 !border-green-500 !bg-green-100"
                      : answered && opt === selected
                      ? "!border-1 !border-red-500 !bg-red-100"
                      : "hover:shadow-lg"
                  }`}
                >
                  <p className="text-lg">{opt}</p>
                </Card>
              ))}
            </div>

            {answered && (
              <div className="flex justify-end mt-6">
                <Button type="primary" onClick={nextQuestion}>
                  {index + 1 < questions.length ? "Câu tiếp theo" : "Hoàn thành"}
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <Result
            status="success"
            title="Hoàn thành Quiz!"
            subTitle={`Bạn trả lời đúng ${score}/${questions.length} câu 🎉`}
            extra={[
              <Button
                type="primary"
                key="restart"
                onClick={() => {
                  setIndex(0);
                  setSelected(null);
                  setScore(0);
                  setFinished(false);
                  setAnswered(false);
                  setTimeLeft(10);
                }}
              >
                Chơi lại
              </Button>,
              <Button key="back" onClick={() => router.push("/quiz")}>
                Quay lại
              </Button>,
            ]}
          />
        )}
      </div>
    </div>
  );
}
