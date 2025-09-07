"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Result, Spin, message } from "antd";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

type Flashcard = { front: string; back: string };
type FlashcardSet = { _id: string; name: string; cards: Flashcard[] };

type Pair = { id: string; front: string; back: string };
type Choice = { id: string; text: string; pairId: string };

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

/* ---------- Small helpers for DnD ---------- */
function DroppableSlot({
  id,
  filled,
  correct,
  children,
}: {
  id: string;
  filled?: boolean;
  correct?: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl p-5 min-h-[80px] flex items-center justify-center text-xl font-semibold transition-all
      ${
        filled
          ? correct
            ? "bg-green-100 border-4 border-green-500"
            : "bg-red-100 border-4 border-red-500"
          : isOver
          ? "bg-blue-50 border-2 border-blue-400"
          : "bg-white border-2 border-gray-300"
      }`}
    >
      {children}
    </div>
  );
}

function DraggableChip({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="border-2 border-gray-300 rounded-xl p-4 mb-4 bg-white text-center text-lg font-medium shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing"
    >
      {children}
    </div>
  );
}
/* ------------------------------------------ */

export default function MatchGamePage() {
  const router = useRouter();

  const [pairs, setPairs] = useState<Pair[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [attemptedWrongSlot, setAttemptedWrongSlot] = useState<string | null>(
    null
  );
  const [finished, setFinished] = useState(false);

  // fetch 4 từ
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("https://be-flashcard-rikj.onrender.com/flashcards");
        const data: FlashcardSet[] = await res.json();

        const all = data.flatMap((s) => s.cards);
        const sampled = shuffle(all).slice(0, 5);

        const ps: Pair[] = sampled.map((c, i) => ({
          id: String(i),
          front: c.front,
          back: c.back,
        }));

        const cs: Choice[] = shuffle(
          ps.map((p) => ({ id: `back-${p.id}`, text: p.back, pairId: p.id }))
        );

        setPairs(ps);
        setChoices(cs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // điểm
  const score = useMemo(() => matchedIds.size, [matchedIds.size]);

  useEffect(() => {
    if (pairs.length > 0 && matchedIds.size === pairs.length) {
      setFinished(true);
    }
  }, [matchedIds, pairs.length]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const dragged = choices.find((c) => c.id === String(active.id));
    const slotPairId = String(over.id).replace("slot-", "");

    if (!dragged) return;

    if (dragged.pairId === slotPairId) {
      // đúng: đánh dấu matched, loại chip khỏi danh sách
      setMatchedIds((prev) => new Set(prev).add(dragged.pairId));
      setChoices((prev) => prev.filter((c) => c.id !== dragged.id));
      message.success("Ghép đúng! 🎉");
    } else {
      // sai: hiệu ứng nhẹ
      setAttemptedWrongSlot(String(over.id));
      message.error("Sai rồi 😢");
      setTimeout(() => setAttemptedWrongSlot(null), 400);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (pairs.length === 0) {
    return (
      <Result
        status="404"
        title="Không có dữ liệu để chơi Match Game"
        extra={<Button onClick={() => router.push("/")}>Quay lại</Button>}
      />
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-[#e0f7fa] to-[#fce4ec] p-6">
      <div className="max-w-3xl w-full">
        {!finished ? (
          <Card
            className="rounded-2xl shadow-lg"
            title={<span className="text-xl font-bold">Match Game – Kéo nghĩa đúng vào từ</span>}
          >
            <DndContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-2 gap-6">
                {/* Cột trái: TỪ (slots) */}
                <div>
                  {pairs.map((p) => {
                    const filled = matchedIds.has(p.id);
                    const wrong = attemptedWrongSlot === `slot-${p.id}`;
                    return (
                      <DroppableSlot
                        key={p.id}
                        id={`slot-${p.id}`}
                        filled={filled || !!wrong}
                        correct={filled}
                      >
                        <div className="text-center">
                          <div className="text-xl font-bold">{p.front}</div>
                          {filled && (
                            <div className="text-base mt-1 opacity-80">
                              ({p.back})
                            </div>
                          )}
                        </div>
                      </DroppableSlot>
                    );
                  })}
                </div>

                {/* Cột phải: NGHĨA (draggables) */}
                <div>
                  {choices.map((c) => (
                    <DraggableChip key={c.id} id={c.id}>
                      {c.text}
                    </DraggableChip>
                  ))}
                  {choices.length === 0 && (
                    <div className="text-center text-gray-500 italic">
                      Bạn đã kéo hết các thẻ rồi!
                    </div>
                  )}
                </div>
              </div>
            </DndContext>

            <div className="flex justify-end mt-6">
              <Button onClick={() => router.push("/")} size="large">
                Thoát
              </Button>
            </div>
          </Card>
        ) : (
          <Result
            status="success"
            title="🎉 Hoàn thành Match Game!"
            subTitle={`Bạn ghép đúng ${score}/${pairs.length} cặp`}
            extra={[
              <Button
                type="primary"
                size="large"
                key="restart"
                onClick={() => {
                  // reload lại để lấy bộ mới nhanh gọn
                  window.location.reload();
                }}
              >
                Chơi lại
              </Button>,
              <Button size="large" key="back" onClick={() => router.push("/quiz")}>
                Về trang chủ
              </Button>,
            ]}
          />
        )}
      </div>
    </div>
  );
}
