import React from "react";
import "./Trending.css";
import { FaSearch } from "react-icons/fa";

const Trending = () => {
  return (
    <div className="trending-container bg-slate-300 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      {/* Left Section */}
      <div className="bg-white p-6 shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-4">📈 Xu hướng phổ biến</h2>
        
        {/* Hashtag List */}
        <div className="space-y-3 mb-6">
          {["#du lịch", "#nấu ăn", "#review sách"].map((tag, index) => (
            <div key={index} className="flex justify-between border px-4 py-2 rounded">
              <span>{tag}</span>
              <span className="text-gray-500">{Math.floor(Math.random() * 1000)} videos in 7 days</span>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-2 mb-6 text-sm">
          <button className="px-3 py-1 rounded border hover:bg-gray-100">Prev</button>
          
          <button className="px-3 py-1 rounded border bg-purple-500 text-white border-purple-500">1</button>
          
          <span className="px-2">...</span>
          
          <button className="px-3 py-1 rounded border hover:bg-gray-100">5</button>
          
          <span className="px-2">...</span>
          
          <button className="px-3 py-1 rounded border hover:bg-gray-100">8</button>
          
          <button className="px-3 py-1 rounded border hover:bg-gray-100">Next</button>
          
        </div>
        
        {/* Search box */}
        <div className="flex items-center border rounded overflow-hidden">
          <input
            type="text"
            placeholder="Tìm kiếm hashtag..."
            className="flex-grow px-4 py-2 outline-none"
          />
          <button className="bg-purple-500 text-white p-2">
            <FaSearch />
          </button>
        </div>
      </div>

      {/* Right Section */}
      <div className="bg-white p-6 shadow rounded-lg flex flex-col h-full relative">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            {[
              { step: 1, label: "Chọn chủ đề" },
              { step: 2, label: "Tạo kịch bản" },
              { step: 3, label: "Tạo giọng đọc" },
              { step: 4, label: "Sinh hình ảnh" },
              { step: 5, label: "Chỉnh sửa" },
              { step: 6, label: "Xuất video" },
            ].map(({ step, label }) => (
            <div key={step} className="flex flex-col items-center w-1/6">
              <div
              className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold ${
                step === 1 ? "bg-purple-600" : "bg-purple-300"
              }`}>
              {step}
              </div>
                <span className="text-xs text-center mt-1">{label}</span>
              </div>
            ))}
          </div>
          <div className="h-2 bg-purple-200 rounded-full w-full"></div>
        </div>

        <h3 className="text-lg font-semibold mb-4">🎯 Chọn chủ đề video</h3>

        {/* Chọn từ xu hướng */}
        <div className="mb-4">
          <label className="font-medium mb-2 block">📌 Chủ đề từ xu hướng:</label>
          <div className="flex flex-wrap gap-2">
            {["Ẩm thực", "Thời trang", "Học tập"].map((item, index) => (
              <div key={index} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Tạo chủ đề mới */}
        <div className="mb-4">
          <label className="font-medium block mb-2">✏️ Tạo chủ đề mới:</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nhập chủ đề..."
              className="flex-grow border px-3 py-2 rounded"
            />
            <button className="bg-purple-500 text-white px-4 py-2 rounded">Thêm</button>
          </div>
        </div>

        {/* Gợi ý loại video */}
        <div className="mb-6">
          <label className="font-semibold block mb-2">🎬 Gợi ý loại video:</label>
          
          {/* Loại video dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Nền tảng:</label>
            <select className="w-full border rounded px-3 py-2">
              <option>TikTok</option>
              <option>YouTube Shorts</option>
              <option>Instagram Reels</option>
              <option>Facebook Reels</option>
            </select>
          </div>
          
          {/* Kích thước video dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Kích thước video:</label>
            <select className="w-full border rounded px-3 py-2">
              <option>Dọc (9:16)</option>
              <option>Vuông (1:1)</option>
              <option>Ngang (16:9)</option>
            </select>
          </div>
          
          {/* Thời lượng video */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Thời lượng video:</label>
            <input
            type="text"
            placeholder="Ví dụ: 2 phút 30 giây, 30 giây, 300 giây"
            className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Nút tiếp tục */}
        <div className="flex justify-end">
          <button className="bg-green-500 text-white px-6 py-2 rounded shadow">
            Tiếp tục
            </button>
        </div>
      </div>
    </div>
  );
};

export default Trending;

