"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, Layout, Menu, Input, Button, Row, Col, Card, Tag } from "antd";
import {
  BookOutlined,
  StarOutlined,
  FireOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { FlashcardList } from "@/types";

const { Header, Sider, Content } = Layout;

export default function Home() {
  const [lists, setLists] = useState<FlashcardList[]>([]);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchLists = async () => {
      setLoading(true);
      try {
        const res = await fetch("https://be-flashcard-rikj.onrender.com/flashcards");
        const data = await res.json();
        setLists(data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, []);

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Bạn có chắc muốn xóa?",
      onOk: async () => {
        try {
          await fetch(`http://localhost:4000/flashcards/${id}`, {
            method: "DELETE",
          });
          setLists((prev) => prev.filter((l) => l._id !== id));
        } catch (error) {
          console.error("Lỗi khi xóa:", error);
        }
      },
    });
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="text-white text-center py-4 font-bold text-lg">
          Flashcard
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={["all"]}>
          <Menu.Item key="all" icon={<BookOutlined />}>
            Tất cả
          </Menu.Item>
          <Menu.Item key="favorite" icon={<StarOutlined />}>
            Ưa thích
          </Menu.Item>
          <Menu.Item key="learning" icon={<FireOutlined />}>
            Đang học
          </Menu.Item>
          <Menu.Item key="done" icon={<CheckCircleOutlined />}>
            Hoàn thành
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        {/* Header */}
        <Header className="bg-white shadow flex justify-between items-center px-6">
          <Input.Search
            placeholder="Tìm kiếm bộ sưu tập..."
            style={{ width: 300 }}
          />
          <div className="flex gap-3">
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              className="rounded-lg"
            >
              Crazy Mode
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="rounded-lg"
              onClick={() => router.push("/create")}
            >
              Thêm mới
            </Button>
          </div>
        </Header>

        {/* Main Content */}
        <Content className="p-6 bg-gray-50 min-h-screen">
          <Row gutter={[16, 16]}>
            {lists.map((list) => (
              <Col span={8} key={list._id}>
                <Card
                  title={list.name}
                  variant="outlined"
                  className="rounded-xl shadow hover:shadow-lg transition"
                  extra={
                    <Button
                      danger
                      size="small"
                      onClick={() => handleDelete(list._id)}
                    >
                      Xóa
                    </Button>
                  }
                  onClick={() => router.push(`/list/${list._id}`)}
                >
                  <p>{list.name}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {list.tags?.map((tag, i) => (
                      <Tag color="blue" key={i}>
                        {tag}
                      </Tag>
                    ))}
                  </div>
                  <div className="text-gray-500 text-sm mt-2">
                    {list.cards?.length || 0} thẻ
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
}
