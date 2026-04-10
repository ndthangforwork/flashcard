'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, PencilBrush, Path } from 'fabric';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<Canvas | null>(null);

  const [result, setResult] = useState<{ top: string; candidates: string[]; meaning?: string } | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);

  // 🧠 State để điều khiển việc mở Popup
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // 🧠 Hàm đóng Popup và xóa kết quả cũ
  const closePopup = () => {
    setIsPopupOpen(false);
    setTimeout(() => setResult(null), 300); // Đợi hiệu ứng đóng xong mới xóa data
  };

  // 🧠 1. Khởi tạo Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    // Khởi tạo Fabric Canvas
    const canvas = new Canvas(canvasRef.current, {
      isDrawingMode: true,
      backgroundColor: '#fff',
    });

    // Cấu hình Brush (Bút vẽ) chuẩn Fabric v6
    const brush = new PencilBrush(canvas);
    brush.width = 5;
    brush.color = '#000000';
    brush.decimate = 2; // Giảm bớt điểm thừa để stroke mượt hơn
    canvas.freeDrawingBrush = brush;

    fabricRef.current = canvas;

    // Cleanup khi unmount
    return () => {
      canvas.dispose();
    };
  }, []);

  // 🧹 2. Xóa Canvas
  const clearCanvas = () => {
    if (!fabricRef.current) return;
    fabricRef.current.clear();
    fabricRef.current.backgroundColor = '#fff';
    fabricRef.current.renderAll();
    setResult(null);
  };

  // ↩️ 3. Hoàn tác (Undo) nét vẽ cuối
  const undo = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    if (objects.length > 0) {
      canvas.remove(objects[objects.length - 1]);
      canvas.renderAll();
    }
  };

  // 🔥 4. Chuyển đổi Objects thành định dạng Strokes [ [ [xs], [ys] ], ... ]
  const convertToStrokes = () => {
    const canvas = fabricRef.current;
    if (!canvas) return [];

    const paths = canvas.getObjects().filter((obj) => obj instanceof Path) as Path[];

    return paths.map((pathItem) => {
        const xs: number[] = [];
        const ys: number[] = [];

        pathItem.path?.forEach((step: any) => {
        const [command, ...coords] = step;
        if (command === 'M' || command === 'L') {
            // Sử dụng Math.round() để đưa về số nguyên
            xs.push(Math.round(coords[0]));
            ys.push(Math.round(coords[1]));
        } else if (command === 'Q') {
            xs.push(Math.round(coords[2]));
            ys.push(Math.round(coords[3]));
        }
        });
        return [xs, ys];
    });
    };

  // 📡 5. Gọi NestJS API
  const recognize = async () => {
    const strokes = convertToStrokes();

    if (strokes.length === 0) {
      alert('Vẽ gì đó trước khi nhận diện nhé! ✍️');
      return;
    }

    setIsRecognizing(true);
    try {
      const response = await fetch(`https://be-flashcard-rikj.onrender.com/kanji/recognize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strokes }),
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      setResult(data);
      setIsPopupOpen(true);
    } catch (err) {
      console.error('Lỗi nhận diện:', err);
      alert('Không thể kết nối đến server NestJS');
    } finally {
      setIsRecognizing(false);
    }
  };

  return (
    <main style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      padding: '40px',
      fontFamily: 'sans-serif' 
    }}>
      <h2 style={{ marginBottom: '20px' }}>✍️ Kanji Handwriting</h2>

      <div style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          width={350}
          height={350}
          style={{ border: '1px solid #ccc', cursor: 'crosshair' }}
        />
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={clearCanvas}
          style={{ padding: '10px 20px', cursor: 'pointer', background: '#f44336', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          Xóa sạch
        </button>

        <button 
          onClick={undo}
          style={{ padding: '10px 20px', cursor: 'pointer', background: '#ff9800', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          Hoàn tác
        </button>

        <button 
          onClick={recognize}
          disabled={isRecognizing}
          style={{ 
            padding: '10px 20px', 
            cursor: 'pointer', 
            background: isRecognizing ? '#9ccc65' : '#4caf50', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '4px',
            fontWeight: 'bold'
          }}
        >
          {isRecognizing ? 'Đang giải mã...' : 'Nhận diện ngay'}
        </button>
      </div>

      {result && (
        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          border: '1px solid #e0e0e0', 
          borderRadius: '8px',
          width: '350px',
          textAlign: 'center',
          backgroundColor: '#f9f9f9'
        }}>
          <p style={{ color: '#666', margin: '0' }}>Kết quả tốt nhất:</p>
          <h1 style={{ fontSize: '64px', margin: '10px 0', color: '#333' }}>{result.top}</h1>
          
          {result.candidates && result.candidates.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <p style={{ color: '#888', fontSize: '14px' }}>Các gợi ý khác:</p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {result.candidates.slice(1, 6).map((char, index) => (
                  <span key={index} style={{ fontSize: '24px', cursor: 'pointer', padding: '5px' }} onClick={() => alert(`Bạn chọn: ${char}`)}>
                    {char}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- PHẦN POPUP KẾT QUẢ --- */}
      {isPopupOpen && result && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000, transition: 'all 0.3s ease-in-out'
        }}
        onClick={closePopup} // Bấm ra ngoài lớp phủ tối để đóng
        >
          {/* Hộp nội dung chính */}
          <div style={{
            backgroundColor: '#fff', padding: '30px', borderRadius: '16px', width: '380px', 
            textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'popIn 0.3s ease-out', // Hiệu ứng "nổ" nhẹ khi hiện
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()} // Ngăn chặn sự kiện đóng popup khi bấm vào bên trong hộp
          >
            {/* Nút đóng góc trên bên phải */}
            <button onClick={closePopup} style={{ 
              position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', 
              fontSize: '20px', cursor: 'pointer', color: '#999' 
            }}>×</button>

            <p style={{ color: '#666', margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>KẾT QUẢ</p>
            
            {/* Chữ Kanji to nhất, màu xanh lam */}
            <h1 style={{ fontSize: '100px', margin: '10px 0', color: '#1a73e8' }}>{result.top}</h1>
            
            {/* Nghĩa tiếng Việt */}
            <div style={{ 
              backgroundColor: '#e8f0fe', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '20px', 
              border: '1px solid #d2e3fc' 
            }}>
              <p style={{ margin: 0, fontSize: '24px', color: '#1967d2', fontWeight: 'bold' }}>
                {result.meaning || 'Đang cập nhật nghĩa...'}
              </p>
            </div>
            
            {result.candidates && result.candidates.length > 1 && (
              <div style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <p style={{ color: '#888', fontSize: '13px', marginBottom: '10px' }}>Các gợi ý khác:</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {result.candidates.slice(1, 6).map((char, index) => (
                    <span 
                      key={index} 
                      style={{ 
                        fontSize: '26px', cursor: 'pointer', padding: '6px 12px', 
                        backgroundColor: '#f1f3f4', borderRadius: '6px', 
                        transition: 'backgroundColor 0.2s' 
                      }} 
                      onClick={() => alert(`Chữ: ${char}`)}
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Hiệu ứng Pop-in bằng CSS Keyframes (Cần thêm vào Global CSS hoặc dùng CSS-in-JS xịn hơn) --- */}
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.8) opacity(0); }
          100% { transform: scale(1) opacity(1); }
        }
      `}</style>
    </main>
  );
}