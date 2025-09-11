"use client";
import { useState } from "react";
import { Button, Input, message } from "antd";

declare global {
  interface Window {
    cloudinary: any;
  }
}


export default function FoodsPage() {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleUpload = () => {
  if (!window.cloudinary) {
    message.error("Cloudinary chưa load!");
    return;
  }

  window.cloudinary.openUploadWidget(
    {
      cloudName: "dw07sstsw",
      uploadPreset: "ml_default",
      sources: ["local", "url", "camera"],
      multiple: false,
      cropping: false,
    },
    (error: any, result: any) => {
      if (error) {
        console.error(error);
        message.error("Upload ảnh thất bại");
        return;
      }

      if (result && result.event === "success") {
        // ✅ Lấy URL ảnh từ Cloudinary
        const url = result.info.secure_url;
        setImageUrl(url);
        message.success("Upload ảnh thành công!");
      }
    }
  );
};

  const handleSave = async () => {
    if (!name && !imageUrl) {
      message.error("Cần nhập front hoặc upload ảnh!");
      return;
    }

    try {
      await fetch("https://be-flashcard-rikj.onrender.com/foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          imageUrl,
        }),
      });
      message.success("Thêm card thành công!");
    } catch (err) {
      console.error(err);
      message.error("Thêm card thất bại");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Thêm món mới</h1>

      <label>Tên món</label>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-2"
      />

      <Button onClick={handleUpload} className="mb-2">
        Upload Ảnh
      </Button>

      {imageUrl && (
        <div className="mb-2">
          <img src={imageUrl} alt="preview" className="w-40 rounded-lg shadow" />
        </div>
      )}

      <Button type="primary" onClick={handleSave}>
        Lưu
      </Button>
    </div>
  );
}
