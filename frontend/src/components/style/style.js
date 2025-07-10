import React, { useState } from "react";
import { styleService } from "../../services/api"; // Đảm bảo đường dẫn đúng

const AddStyle = () => {
  const [form, setForm] = useState({
    style: "",
    tone: "",
    sentence_length: "",
    vocabulary: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);
    try {
      await styleService.addStyle(form);
      setMessage("✅ Đã lưu phong cách thành công!");
    } catch (err) {
      setMessage(
        "❌ Lỗi khi lưu phong cách: " + (err.message || "Không xác định")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Thiết lập phong cách cá nhân
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hãy điền vào biểu mẫu dưới đây để lưu phong cách viết của bạn
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {message && (
              <div
                className={`px-4 py-3 rounded relative text-sm ${
                  message.startsWith("✅")
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            {/* Phong cách viết */}
            <div>
              <label
                htmlFor="style"
                className="block text-sm font-medium text-gray-700"
              >
                Phong cách viết
              </label>
              <input
                id="style"
                name="style"
                value={form.style}
                onChange={handleChange}
                placeholder="Ví dụ: cổ điển, hiện đại..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                required
              />
            </div>

            {/* Tông giọng */}
            <div>
              <label
                htmlFor="tone"
                className="block text-sm font-medium text-gray-700"
              >
                Tông giọng
              </label>
              <input
                id="tone"
                name="tone"
                value={form.tone}
                onChange={handleChange}
                placeholder="Ví dụ: buồn, vui, hài hước..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                required
              />
            </div>

            {/* Độ dài câu */}
            <div>
              <label
                htmlFor="sentence_length"
                className="block text-sm font-medium text-gray-700"
              >
                Độ dài câu
              </label>
              <select
                id="sentence_length"
                name="sentence_length"
                value={form.sentence_length}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                required
              >
                <option value="">-- Chọn độ dài --</option>
                <option value="short">Ngắn</option>
                <option value="medium">Trung bình</option>
                <option value="long">Dài</option>
              </select>
            </div>

            {/* Từ vựng */}
            <div>
              <label
                htmlFor="vocabulary"
                className="block text-sm font-medium text-gray-700"
              >
                Loại từ vựng
              </label>
              <select
                id="vocabulary"
                name="vocabulary"
                value={form.vocabulary}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                required
              >
                <option value="">-- Chọn từ vựng --</option>
                <option value="formal">Trang trọng</option>
                <option value="informal">Thân mật</option>
                <option value="technical">Kỹ thuật</option>
                <option value="poetic">Thơ mộng</option>
                <option value="narrative">Kể chuyện</option>
                <option value="academic">Học thuật</option>
                <option value="marketing">Tiếp thị</option>
                <option value="satirical">Châm biếm</option>
              </select>
            </div>

            {/* Nút xác nhận */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                }`}
              >
                {isSubmitting ? "Đang lưu..." : "Xác nhận"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStyle;
