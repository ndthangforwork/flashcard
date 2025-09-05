"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Papa from "papaparse";
import { Table, Input, Button, Space, Upload, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { UploadOutlined } from "@ant-design/icons";

interface Card {
  front: string;
  back: string;
}

interface FlashcardDetail {
  _id: string;
  name: string;
  cards: Card[];
}

export default function EditFlashcardPage() {
  const { id } = useParams();
  const router = useRouter();

  const [flashcard, setFlashcard] = useState<FlashcardDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `https://be-flashcard-rikj.onrender.com/flashcards/${id}`
        );
        const data = await res.json();
        setFlashcard(data);
      } catch (err) {
        console.error("Failed to fetch", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  const handleAddCard = () => {
    if (!flashcard) return;
    setFlashcard({
      ...flashcard,
      cards: [...flashcard.cards, { front: "", back: "" }],
    });
  };

  const handleDeleteCard = (index: number) => {
    if (!flashcard) return;
    const updated = flashcard.cards.filter((_, i) => i !== index);
    setFlashcard({ ...flashcard, cards: updated });
  };

  const handleChange = (
    index: number,
    field: "front" | "back",
    value: string
  ) => {
    if (!flashcard) return;
    const updated = [...flashcard.cards];
    updated[index][field] = value;
    setFlashcard({ ...flashcard, cards: updated });
  };

  const handleSave = async () => {
    if (!flashcard) return;
    try {
      await fetch(
        `https://be-flashcard-rikj.onrender.com/flashcards/${flashcard._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(flashcard),
        }
      );
      message.success("Đã lưu thành công!");
      router.push("/"); // quay về Home sau khi lưu
    } catch (err) {
      console.error("Failed to save", err);
      message.error("Lỗi khi lưu");
    }
  };

  const handleCSVUpload = (file: File) => {
    // Parse first with header: true để kiểm tra xem file có header front/back không
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<any>) => {
        const rows = results.data as any[];
        if (!rows || rows.length === 0) return;

        const first = rows[0];
        const keys = Object.keys(first).map((k) =>
          String(k).trim().toLowerCase()
        );
        const hasFrontBack = keys.includes("front") && keys.includes("back");

        if (hasFrontBack) {
          const newCards: Card[] = rows
            .map((r) => ({
              front: String(r.front ?? r.Front ?? "").trim(),
              back: String(r.back ?? r.Back ?? "").trim(),
            }))
            .filter((c) => c.front && c.back);

          setFlashcard((prev) =>
            prev ? { ...prev, cards: [...prev.cards, ...newCards] } : null
          );
        } else {
          Papa.parse(file, {
            header: false,
            skipEmptyLines: true,
            complete: (resNoHeader: Papa.ParseResult<any[]>) => {
              const rowsArr = resNoHeader.data as any[];
              const newCards: Card[] = rowsArr
                .map((r) => {
                  const arr = Array.isArray(r) ? r : Object.values(r);
                  const front = String(arr[0] ?? "").trim();
                  const back = String(arr[1] ?? "").trim();
                  return { front, back };
                })
                .filter((c) => c.front && c.back);

              setFlashcard((prev) =>
                prev ? { ...prev, cards: [...prev.cards, ...newCards] } : null
              );
            },
          });
        }
      },
      error: (err) => {
        console.error("Error parsing with header:", err);
      },
    });

    return false; // để antd Upload không tự upload
  };

  if (loading) return <p className="text-center mt-10">Đang tải...</p>;
  if (!flashcard) return <p className="text-center mt-10">Không tìm thấy flashcard</p>;

  const columns: ColumnsType<Card> = [
    {
      title: "Front",
      dataIndex: "front",
      render: (text, _, index) => (
        <Input
          value={text}
          onChange={(e) => handleChange(index, "front", e.target.value)}
        />
      ),
    },
    {
      title: "Back",
      dataIndex: "back",
      render: (text, _, index) => (
        <Input
          value={text}
          onChange={(e) => handleChange(index, "back", e.target.value)}
        />
      ),
    },
    {
      title: "Hành động",
      render: (_, __, index) => (
        <Button danger onClick={() => handleDeleteCard(index)}>
          Xóa
        </Button>
      ),
    },
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-[#e2e2e2] to-[#c9d6ff]">
      <div className="relative w-[1200px] h-[750px] bg-white rounded-[30px] shadow-lg overflow-hidden flex flex-col p-2.5">
         <div className="p-6 flex flex-col justify-center items-center">
          <h1 className="text-xl font-bold mb-4">Chỉnh sửa: {flashcard.name}</h1>

          {/* Upload CSV */}
          <Upload
            beforeUpload={handleCSVUpload}
            showUploadList={false}
            accept=".csv"
          >
            <Button icon={<UploadOutlined />}>Upload CSV</Button>
          </Upload>
          <p className="text-xs text-gray-500 mt-2">CSV format: front,back</p>

          {/* Danh sách card */}
          <Table
            className="mt-4"
            dataSource={flashcard.cards.map((c, i) => ({ ...c, key: i }))}
            columns={columns}
            pagination={{ pageSize: 6 }}
            scroll={{ y: 400 }}
          />

          <Space className="mt-4">
            <Button type="primary" onClick={handleAddCard}>
              + Thêm thẻ
            </Button>
            <Button onClick={handleSave} type="default">
              Lưu thay đổi
            </Button>
            <Button onClick={() => router.push("/")}>← Quay về Home</Button>
          </Space>
        </div>
      </div>
    </div>
  );
}
