"use client";

import { useEffect, useState } from "react";
import { FlashcardList } from "@/types";
import { useRouter } from "next/navigation";
import { Modal } from "antd";

export default function Home() {
  const [lists, setLists] = useState<FlashcardList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const router = useRouter();
  const { confirm } = Modal;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("https://be-flashcard-rikj.onrender.com/flashcards");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setLists(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Xóa flashcard
  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá?")) return;

    try {
      await fetch(`https://be-flashcard-rikj.onrender.com/flashcards/${id}`, {
        method: "DELETE",
      });
      setLists((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  // Thêm flashcard mới
  const handleAdd = async () => {
    try {
      const res = await fetch("https://be-flashcard-rikj.onrender.com/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          cards: [], // mặc định rỗng
        }),
      });

      if (!res.ok) throw new Error("Failed to add");

      const newFlashcard = await res.json();
      setLists((prev) => [...prev, newFlashcard]);
      setNewName("");
      setShowForm(false);
    } catch (err) {
      console.error("Failed to add flashcard", err);
    }
  };

  const goToDetail = (id: string) => {
    router.push(`/flashcard/${id}`);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-[#e2e2e2] to-[#c9d6ff]">
      <div className="relative w-[850px] h-[550px] bg-white rounded-[30px] shadow-lg overflow-hidden flex flex-col p-2.5">
        {/* Tiêu đề */}
        <div className="flex items-center justify-center">
          <h1 className="text-2xl font-bold mb-6">Bộ sưu tập</h1>
        </div>

        {/* Nút thêm mới */}
        <button
          onClick={() => setShowForm(true)}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          + Thêm mới
        </button>

        {/* Danh sách flashcard */}
        <div className="flex flex-col gap-3 overflow-y-auto">
          {lists.map((item) => (
            <div
              key={item._id}
              onClick={() => goToDetail(item._id)}
              className="flex justify-between items-center p-4 border rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer"
            >
              <span>{item.name}</span>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/flashcard/${item._id}/edit`);
                  }}
                  className="px-3 py-1 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 cursor-pointer"
                >
                  Sửa
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item._id);
                  }}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal thêm mới */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
            <h2 className="text-lg font-bold mb-4">Thêm Flashcard mới</h2>
            <input
              type="text"
              placeholder="Tên flashcard..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
