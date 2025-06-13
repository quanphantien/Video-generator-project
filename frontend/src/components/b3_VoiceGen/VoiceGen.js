import React, { useState } from "react";
import { FaPlay, FaPause, FaArrowLeft, FaArrowRight, FaVolumeUp } from "react-icons/fa";

const VoiceGen = () => {
    const [selectedVoice, setSelectedVoice] = useState("female1");
    const [speed, setSpeed] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);

    const voices = [
        { id: "female1", name: "Lan (Nữ miền Bắc)", preview: "url-to-audio" },
        { id: "female2", name: "Mai (Nữ miền Nam)", preview: "url-to-audio" },
        { id: "male1", name: "Dũng (Nam miền Bắc)", preview: "url-to-audio" },
        { id: "male2", name: "Phong (Nam miền Nam)", preview: "url-to-audio" },
    ];

    const scriptSections = [
        { time: "00:00 - 00:10", text: "Xin chào các bạn, hôm nay chúng ta sẽ..." },
        { time: "00:10 - 00:20", text: "Đầu tiên, chúng ta cần chuẩn bị..." },
        { time: "00:20 - 00:30", text: "Tiếp theo, chúng ta sẽ thực hiện..." },
    ];

    return (
        <div className="bg-slate-300 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
                {/* Left Section - Voice Controls */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">🎤 Tùy chỉnh giọng đọc</h2>

                    {/* Voice Selection */}
                    <div className="mb-6">
                        <label className="block font-medium mb-2">Chọn giọng đọc:</label>
                        <div className="space-y-2">
                            {voices.map((voice) => (
                                <div
                                    key={voice.id}
                                    className={`p-3 border rounded cursor-pointer flex justify-between items-center ${selectedVoice === voice.id ? "border-purple-500 bg-purple-50" : ""
                                        }`}
                                    onClick={() => setSelectedVoice(voice.id)}
                                >
                                    <div>
                                        <div className="font-medium">{voice.name}</div>
                                        <div className="text-sm text-gray-500">Giọng tự nhiên</div>
                                    </div>
                                    <button
                                        className="p-2 hover:bg-purple-100 rounded-full"
                                        onClick={() => {/* Xử lý nghe thử */ }}
                                    >
                                        <FaVolumeUp className="text-purple-600" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Speed Control */}
                    <div className="mb-6">
                        <label className="block font-medium mb-2">
                            Tốc độ đọc: {speed}x
                        </label>
                        <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={speed}
                            onChange={(e) => setSpeed(parseFloat(e.target.value))}
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>0.5x</span>
                            <span>1x</span>
                            <span>2x</span>
                        </div>
                    </div>
                </div>

                {/* Right Section - Script Preview */}
                <div className="bg-white p-6 rounded-lg shadow">
                    {/* Progress Steps */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            {["Chọn chủ đề", "Tạo kịch bản", "Tạo giọng đọc", "Sinh hình ảnh", "Chỉnh sửa", "Xuất video"].map(
                                (label, index) => (
                                    <div key={index} className="flex flex-col items-center w-1/6">
                                        <div
                                            className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold ${index === 2 ? "bg-purple-600" : "bg-purple-300"
                                                }`}
                                        >
                                            {index + 1}
                                        </div>
                                        <span className="text-xs text-center mt-1">{label}</span>
                                    </div>
                                )
                            )}
                        </div>
                        <div className="h-2 bg-purple-200 rounded-full w-full">
                            <div className="h-full bg-purple-600 rounded-full" style={{ width: "50%" }}></div>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-4">📝 Xem trước kịch bản</h3>

                    {/* Script Sections */}
                    <div className="space-y-4 mb-6">
                        {scriptSections.map((section, index) => (
                            <div key={index} className="border rounded p-4">
                                <div className="text-sm text-gray-500 mb-2">{section.time}</div>
                                <p className="mb-2">{section.text}</p>
                                <div className="flex items-center gap-2">
                                    <button
                                        className={`px-3 py-1 rounded-full text-sm ${isPlaying && index === 0
                                                ? "bg-red-100 text-red-600"
                                                : "bg-purple-100 text-purple-600"
                                            }`}
                                        onClick={() => setIsPlaying(!isPlaying)}
                                    >
                                        {isPlaying && index === 0 ? (
                                            <span className="flex items-center gap-1">
                                                <FaPause /> Tạm dừng
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1">
                                                <FaPlay /> Phát thử
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between">
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded">
                            <FaArrowLeft /> Quay lại
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded">
                            Tiếp tục <FaArrowRight />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceGen;