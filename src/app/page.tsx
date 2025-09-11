"use client";

import { useEffect, useState } from "react";
import { FlashcardList } from "@/types";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Modal,
  Input,
  Row,
  Col,
  Space,
  Empty,
  Spin,
  message,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  TagOutlined,
  SearchOutlined,
} from "@ant-design/icons";

export default function Home() {
  const [lists, setLists] = useState<FlashcardList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const [search, setSearch] = useState(""); // state cho tìm kiếm
  const [filterTag, setFilterTag] = useState<string | null>(null); // state cho bộ lọc tag

  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          "https://be-flashcard-rikj.onrender.com/flashcards"
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setLists(data);
      } catch (err) {
        console.error(err);
        message.error("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Xác nhận xoá",
      content: "Bạn có chắc chắn muốn xoá bộ sưu tập này?",
      okText: "Xoá",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await fetch(
            `https://be-flashcard-rikj.onrender.com/flashcards/${id}`,
            {
              method: "DELETE",
            }
          );
          setLists((prev) => prev.filter((item) => item._id !== id));
          message.success("Đã xoá");
        } catch (err) {
          console.error("Failed to delete", err);
          message.error("Xoá thất bại");
        }
      },
    });
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      message.warning("Tên bộ sưu tập không được để trống");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch(
        "https://be-flashcard-rikj.onrender.com/flashcards",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newName,
            cards: [],
            tags: [], // thêm tags mặc định rỗng
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to add");

      const newFlashcard = await res.json();
      setLists((prev) => [...prev, newFlashcard]);
      setNewName("");
      setShowForm(false);
      message.success("Thêm thành công");
    } catch (err) {
      console.error("Failed to add flashcard", err);
      message.error("Thêm thất bại");
    } finally {
      setAdding(false);
    }
  };

  const goToDetail = (id: string) => {
    router.push(`/flashcard/${id}`);
  };

  // Lọc danh sách theo search + tag
  const filteredLists = lists.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesTag = filterTag ? item.tags?.includes(filterTag) : true;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-[#f0f4ff] to-[#e2e8f0]">
      <div className="relative w-[950px] min-h-[550px] bg-white rounded-[30px] shadow-xl overflow-hidden flex flex-col p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOutlined style={{ fontSize: "26px", color: "#fa8c16" }} />
            Bộ sưu tập
          </h1>
          <div className="flex gap-4">
            <Button
              type="primary"
              size="large"
              icon={<ThunderboltOutlined />}
              onClick={() => router.push("/foods")}
              className="rounded-lg px-4"
            >
              Foods
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<ThunderboltOutlined />}
              onClick={() => router.push("/quiz")}
              className="rounded-lg px-4"
            >
              Crazy Mode
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => setShowForm(true)}
              className="rounded-lg px-4"
            >
              Thêm mới
            </Button>
          </div>
        </div>

        {/* Thanh tìm kiếm + lọc */}
        <div className="flex gap-4 mb-6">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm kiếm bộ sưu tập..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-1/2"
          />
          <Select
            placeholder="Lọc theo tag"
            allowClear
            value={filterTag}
            onChange={(val) => setFilterTag(val)}
            options={[
              { value: "Hiragana", label: "Hiragana" },
              { value: "Chữ Hán", label: "Chữ Hán" },
              { value: "Khác", label: "Khác" },
            ]}
            className="w-1/3"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Spin size="large" />
          </div>
        ) : filteredLists.length === 0 ? (
          <Empty description="Không có kết quả phù hợp" />
        ) : (
          <Row gutter={[16, 16]} className="mt-2">
            {filteredLists.map((item) => (
              <Col xs={24} sm={12} md={8} key={item._id}>
                <Card
                  hoverable
                  className="rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
                  onClick={() => goToDetail(item._id)}
                  title={
                    <Space>
                      <BookOutlined
                        style={{ fontSize: "20px", color: "#1677ff" }}
                      />
                      <span className="font-semibold">{item.name}</span>
                    </Space>
                  }
                  actions={[
                    <EditOutlined
                      key="edit"
                      style={{ fontSize: "20px", color: "#1677ff" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/flashcard/${item._id}/edit`);
                      }}
                    />,
                    <DeleteOutlined
                      key="delete"
                      style={{ fontSize: "20px", color: "red" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item._id);
                      }}
                    />,
                  ]}
                >
                  <div className="flex justify-between items-center">
                    {/* Tag hiển thị */}
                    {item.tags && item.tags.length > 0 && (
                      <span className="px-3 py-1 bg-gradient-to-r from-pink-400 to-rose-500 text-white text-[13px] font-semibold rounded-full flex items-center gap-1 shadow">
                        <TagOutlined /> {item.tags[0]}
                      </span>
                    )}
                    {/* Số thẻ */}
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-[13px] font-semibold rounded-full flex items-center gap-2 shadow">
                      <FileTextOutlined /> {item.cards?.length || 0} thẻ
                    </span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Modal thêm mới */}
        <Modal
          title="Thêm bộ sưu tập mới"
          open={showForm}
          onCancel={() => setShowForm(false)}
          onOk={handleAdd}
          confirmLoading={adding}
          okText="Lưu"
          cancelText="Hủy"
        >
          <Input
            placeholder="Tên bộ sưu tập..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </Modal>
      </div>
    </div>
  );
}
