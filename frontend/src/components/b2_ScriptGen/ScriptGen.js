import React from "react";
import "./ScriptGen.css";
import { FaRedo, FaArrowLeft, FaArrowRight, FaSyncAlt } from "react-icons/fa";

const ScriptGen = () => {
  return (
    <div className="scriptgen-container bg-slate-300 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 p-6">
      {/* Left Section */}
      <div className="bg-white p-6 shadow rounded-lg space-y-4">
        <h2 className="text-xl font-semibold mb-4">📋 Thông tin video</h2>

        {/* Selected Info */}
        <div className="space-y-2 text-sm">
          <div><strong>Chủ đề:</strong> Ẩm thực</div>
          <div><strong>Định dạng:</strong> TikTok</div>
          <div><strong>Kích thước:</strong> Dọc (9:16)</div>
          <div><strong>Thời lượng:</strong> 1 phút 30 giây</div>
        </div>

        {/* Nhân vật chính */}
        <div>
          <label className="block font-medium mb-1">🎭 Nhân vật chính:</label>
          <input type="text" placeholder="Nhập đối tượng..." className="w-full border px-3 py-2 rounded" />
        </div>

        {/* Hình thức video */}
        <div>
          <label className="block font-medium mb-1">🎥 Hình thức video:</label>
          <select className="w-full border px-3 py-2 rounded">
            <option>Hướng dẫn</option>
            <option>Kiến thức</option>
            <option>Review</option>
            <option>Phỏng vấn</option>
          </select>
        </div>

        {/* Độ dài kịch bản */}
        <div>
          <label className="block font-medium mb-1">🕒 Độ dài kịch bản:</label>
          <select className="w-full border px-3 py-2 rounded">
            <option>Ngắn (~150 từ)</option>
            <option>Trung bình (~300 từ)</option>
            <option>Dài (~500 từ)</option>
          </select>
        </div>

        <div className="flex justify-end">
          <button className="bg-purple-600 text-white px-4 py-2 rounded shadow">Tạo kịch bản</button>
        </div>
      </div>

      {/* Right Section */}
      <div className="bg-white p-6 shadow rounded-lg flex flex-col h-full relative">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            {["Chọn chủ đề", "Tạo kịch bản", "Tạo giọng đọc", "Sinh hình ảnh", "Chỉnh sửa", "Xuất video"].map((label, index) => (
              <div key={index} className="flex flex-col items-center w-1/6">
                <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold ${index === 1 ? "bg-purple-600" : "bg-purple-300"}`}>
                  {index + 1}
                </div>
                <span className="text-xs text-center mt-1">{label}</span>
              </div>
            ))}
          </div>
          <div className="h-2 bg-purple-200 rounded-full w-full"></div>
        </div>

        <h3 className="text-lg font-semibold mb-4">📝 Nội dung kịch bản</h3>

        {/* Script Output */}
        <div className="overflow-y-auto space-y-4 flex-1 pr-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border rounded p-4 bg-gray-50">
              <div className="text-sm text-gray-500 mb-1">00:{i}0 - 00:{i + 1}0</div>
              <p className="text-sm mb-2">
                Đây là nội dung chi tiết cho đoạn kịch bản thứ {i + 1}. Nội dung này có thể dài và sẽ có thể lăn chuột để xem toàn bộ.
              </p>
              <button className="text-blue-500 text-sm flex items-center gap-1">
                <FaRedo /> Tạo lại đoạn này
              </button>
            </div>
          ))}
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end space-x-3 mt-4">
          <button className="bg-yellow-500 text-white px-4 py-2 rounded shadow flex items-center gap-2">
            <FaSyncAlt /> Tái tạo toàn bộ
          </button>
          <button className="bg-gray-400 text-white px-4 py-2 rounded shadow flex items-center gap-2">
            <FaArrowLeft /> Quay lại
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded shadow flex items-center gap-2">
            Tiếp theo <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScriptGen;
