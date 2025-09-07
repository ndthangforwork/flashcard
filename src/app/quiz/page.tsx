"use client"
import { Card, Row, Col, Button } from "antd";
import { 
  TrophyOutlined, 
  ThunderboltOutlined, 
  FireOutlined, 
  HomeOutlined
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

export default function QuizPage() {
  const router = useRouter();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-[#f0f4ff] to-[#e2e8f0]">
      <div className="relative w-[900px] min-h-[550px] bg-white rounded-[30px] shadow-xl overflow-hidden flex flex-col p-8">
        
        {/* Title */}
        <h1 className="text-4xl font-semibold text-center mb-10 flex items-center justify-center gap-3 text-red-500">
          <FireOutlined style={{ fontSize: "40px" }} />
          Game show bùng nổ
        </h1>

        {/* Cards */}
        <div className="flex-1">
          <Row gutter={[20, 20]} justify="center">
            <Col xs={24} md={12}>
              <Card
                hoverable
                variant="borderless"
                className="rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 h-full border-2 border-yellow-400"
                onClick={() => router.push("/quiz/quick-quiz")}
                title={
                  <span className="font-semibold text-lg flex items-center gap-2">
                    <ThunderboltOutlined className="text-yellow-500" /> Quiz nhanh
                  </span>
                }
              >
                Trả lời nhanh các flashcard để kiểm tra trí nhớ.
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card
                hoverable
                variant="borderless"
                className="rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 h-full border-2 border-red-400"
                onClick={() => router.push("/quiz/match-game")}
                title={
                  <span className="font-semibold text-lg flex items-center gap-2">
                    <FireOutlined className="text-red-500" /> Match game
                  </span>
                }
              >
                Ghép từ với nghĩa đúng, rèn phản xạ.
              </Card>
            </Col>

            <Col xs={24}>
              <Card
                hoverable
                variant="borderless"
                className="rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-blue-400"
                title={
                  <span className="font-semibold text-lg flex items-center gap-2">
                    <TrophyOutlined className="text-blue-500" /> Streak & thành tích ( CHỨC NĂNG NÀY CHƯA HỖ TRỢ HEHEHEHE)
                  </span>
                }
              >
                Duy trì chuỗi ngày học và nhận thưởng 🎉
              </Card>
            </Col>
          </Row>
        </div>

        {/* Back Home Button */}
        <div className="mt-10 flex justify-center">
          <Button 
            type="primary" 
            size="large"
            icon={<HomeOutlined />} 
            onClick={() => router.push("/")}
            className="rounded-xl px-6 shadow-lg"
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  )
}
