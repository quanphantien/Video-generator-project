import React, { useEffect, useState } from "react";
import { ChevronLeft, Bell, Info, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaYoutube, FaTiktok, FaGoogle } from "react-icons/fa";
import DropdownTrendSource from "../components/DropdownTrendSource";
import Dropdown from "../components/Dropdown";
import NumberInput from "../components/NumberInput";
import LanguageSelect from "../components/LanguageSelect";
import ScriptGenerationForm from "../components/ScriptGenerationForm";
import VideoNameInput from "../components/VideoNameInput";
import VideoGenerationProgress from "../components/VideoGenerationProgress";
import VideoPreview from "../components/VideoPreview";
import api from "../services/authService";
import { useAuth } from "../context/authContext";
import videoGenerationService from "../services/videoGenerationService";
import mediaGenerationService from "../services/mediaGenerationService";
import { parseScriptToScenes, validateScenes, formatScriptForVideo } from "../utils/scriptUtils";

export default function VideoGenerationInterface() {
  const [activeTab, setActiveTab] = useState("Text to Video");
  const [topicInput, setTopicInput] = useState("");
  const [scriptInput, setScriptInput] = useState("");
  const [scriptProcessing, setScriptProcessing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [proMode, setProMode] = useState(true);
  const [style, setStyle] = useState("General");
  const [duration, setDuration] = useState("5 Seconds");
  const [trendTopics, setTrendTopics] = useState([]);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [imageModels, setImageModels] = useState([]);
  const [voiceModels, setVoiceModels] = useState([]);

  const [selectedImageModel, setSelectedImageModel] = useState("");
  const [selectedVoiceModel, setSelectedVoiceModel] = useState("");
  const [numScenes, setNumScenes] = useState(5); // Số lượng scenes mặc định
  const [language, setLanguage] = useState('vi'); // Ngôn ngữ mặc định
  const [videoName, setVideoName] = useState(''); // Tên video
  const [videoGenerating, setVideoGenerating] = useState(false); // Trạng thái tạo video
  const [generationProgress, setGenerationProgress] = useState(''); // Tiến trình tạo video
  const [generationError, setGenerationError] = useState(null); // Lỗi trong quá trình tạo video
  const [completedSteps, setCompletedSteps] = useState(0); // Số bước đã hoàn thành
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null); // URL video đã tạo
  const { getValidToken } = useAuth();
  const navigate = useNavigate();

  const tabs = ["Reference to Video", "Image to Video", "Text to Video"];

  // Gọi api để lấy danh sách mô hình hình ảnh và giọng nói
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const [imageRes, voiceRes] = await Promise.all([
          api.get("/image/models"),
          api.get("/tts/voices"),
        ]);

        setImageModels(imageRes.data.data);
        setVoiceModels(voiceRes.data.data);
      } catch (err) {
        console.error("Lỗi khi gọi API lấy mô hình:", err);
      }
    };

    fetchModels();
  }, []);

  // Hàm xử lý khi người dùng chọn mô hình hình ảnh và giọng nói
  const handleSubmit = async () => {
    if (!scriptInput.trim()) {
      alert('Vui lòng tạo kịch bản trước khi tiếp tục');
      return;
    }

    if (!selectedImageModel) {
      alert('Vui lòng chọn model hình ảnh');
      return;
    }

    if (!selectedVoiceModel) {
      alert('Vui lòng chọn giọng đọc');
      return;
    }

    if (!videoName.trim()) {
      alert('Vui lòng nhập tên video');
      return;
    }

    setVideoGenerating(true);
    setGenerationProgress('Đang phân tích script...');
    setGenerationError(null);
    setCompletedSteps(0);

    try {
      // Bước 1: Parse script thành scenes
      const scenes = parseScriptToScenes(scriptInput);
      validateScenes(scenes);

      console.log('Parsed scenes:', scenes);
      setGenerationProgress(`Tìm thấy ${scenes.length} scenes. Đang tạo audio...`);
      setCompletedSteps(1);

      // Bước 2: Tạo TTS cho từng scene
      const audioUrls = [];
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        setGenerationProgress(`Đang tạo audio cho scene ${i + 1}/${scenes.length}...`);
        
        try {
          const ttsResponse = await mediaGenerationService.generateTTS(
            scene.text,
            selectedVoiceModel
          );

          if (ttsResponse.code === 200 && ttsResponse.data?.audio_url) {
            audioUrls.push(ttsResponse.data.audio_url);
            console.log(`Audio generated for scene ${i + 1}:`, ttsResponse.data.audio_url);
          } else {
            throw new Error(`Không thể tạo audio cho scene ${i + 1}: ${ttsResponse.message || 'Unknown error'}`);
          }
        } catch (error) {
          console.error(`TTS error for scene ${i + 1}:`, error);
          throw new Error(`Lỗi tạo audio cho scene ${i + 1}: ${error.message || error}`);
        }
      }

      setGenerationProgress(`Hoàn thành ${audioUrls.length} audio. Đang tạo hình ảnh...`);
      setCompletedSteps(2);

      // Bước 3: Tạo hình ảnh cho từng scene
      const imageUrls = [];
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        setGenerationProgress(`Đang tạo hình ảnh cho scene ${i + 1}/${scenes.length}...`);
        
        try {
          const imageResponse = await mediaGenerationService.generateImage(
            scene.prompt || scene.text,
            selectedImageModel
          );

          if (imageResponse.code === 200 && imageResponse.data?.image_url) {
            imageUrls.push(imageResponse.data.image_url);
            console.log(`Image generated for scene ${i + 1}:`, imageResponse.data.image_url);
          } else {
            throw new Error(`Không thể tạo hình ảnh cho scene ${i + 1}: ${imageResponse.message || 'Unknown error'}`);
          }
        } catch (error) {
          console.error(`Image generation error for scene ${i + 1}:`, error);
          throw new Error(`Lỗi tạo hình ảnh cho scene ${i + 1}: ${error.message || error}`);
        }
      }

      setGenerationProgress(`Hoàn thành ${imageUrls.length} hình ảnh. Đang tạo video cuối cùng...`);
      setCompletedSteps(3);

      // Bước 4: Tạo video cuối cùng
      const formattedScript = formatScriptForVideo(scenes);
      const videoResponse = await mediaGenerationService.generateVideo(
        "string",
        videoName.trim(),
        audioUrls,
        imageUrls,
        2
      );

      console.log('Video generation response:', videoResponse);
      setGenerationProgress('Hoàn thành! Video đã được tạo thành công.');
      setCompletedSteps(4);
      
      // Lưu URL video đã tạo để có thể edit
      if (videoResponse && videoResponse.data && videoResponse.data.video_url) {
        setGeneratedVideoUrl(videoResponse.data.video_url);
      }
      
      // Hiển thị thông báo thành công
      alert(`Video "${videoName}" đã được tạo thành công!`);

    } catch (error) {
      console.error('Video generation failed:', error);
      setGenerationError(error.message || error);
      setGenerationProgress('');
    } finally {
      setVideoGenerating(false);
    }
  };

  const youtubeHandleClick = async () => {
    setTrendsLoading(true);
    try {
      const response = await videoGenerationService.getYoutubeTrends();
      setTrendTopics(response);
      console.log("Youtube trends fetched:", response);
    } catch (error) {
      console.error("Error fetching YouTube trends:", error);
    } finally {
      setTrendsLoading(false);
    }
  };

  const googleHandleClick = async () => {
    setTrendsLoading(true);
    try {
      // Gọi API với keyword optional
      const keyword = topicInput.trim() || undefined;
      const response = await videoGenerationService.getTrends(keyword, 10);
      // Chuyển đổi response thành format phù hợp
      const trends = response.data.map((item) => item.keyword);
      setTrendTopics(trends);
      console.log("Google trends fetched:", trends);
    } catch (error) {
      console.error("Error fetching Google trends:", error);
      alert("Không thể lấy xu hướng. Vui lòng thử lại.");
    } finally {
      setTrendsLoading(false);
    }
  };

  const options = [
    {
      label: (
        <div className="flex items-center gap-2">
          <FaYoutube className="text-red-500" />
          Youtube
        </div>
      ),
      value: "youtube",
      onClick: youtubeHandleClick,
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <FaTiktok className="text-black" />
          Tiktok
        </div>
      ),
      value: "tiktok",
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <FaGoogle className="text-blue-500" />
          <div>
            <div>Google AI Trends</div>
          </div>
        </div>
      ),
      value: "google",
      onClick: googleHandleClick,
    },
  ];

  const handleCreate = () => {
    setProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setProcessing(false);
    }, 3000);
  };
  const handleTopicSubmit = async () => {
    setScriptProcessing(true);

    if (topicInput.trim()) {
      try {
        const response = await videoGenerationService.generateScript({
          language: language,
          prompt: topicInput.trim(),
          num_scenes: numScenes,
        });

        console.log("Script response:", response); // Debug log

        // Kiểm tra cấu trúc response từ API
        if (response && response.code === 200 && response.data) {
          const scriptData = response.data;

          // Nếu có scenes array, format thành text
          if (Array.isArray(scriptData.scenes)) {
            const scriptText = scriptData.scenes
              .map((scene, index) => {
                const sceneNumber = index + 1;
                const text = scene.text || scene.description || "";
                const prompt = scene.prompt || "";
                const tts = scene.tts || "";

                return `Scene ${sceneNumber}:
Text: ${text}
${prompt ? `Prompt: ${prompt}` : ""}`;
              })
              .join("\n\n");

            setScriptInput(scriptText);
          }
          // Nếu có field script trực tiếp
          else if (scriptData.script) {
            setScriptInput(scriptData.script);
          }
          // Nếu data là string
          else if (typeof scriptData === "string") {
            setScriptInput(scriptData);
          }
          // Fallback: stringify data
          else {
            setScriptInput(JSON.stringify(scriptData, null, 2));
          }
        }
        // Nếu response không có structure mong đợi
        else {
          console.error("Unexpected response format:", response);
          if (response && response.message) {
            setScriptInput(`Lỗi: ${response.message}`);
          } else {
            setScriptInput("Có lỗi xảy ra khi tạo kịch bản. Vui lòng thử lại.");
          }
        }
      } catch (error) {
        console.error("Error generating script:", error);

        // Xử lý error message từ backend
        if (error && error.detail) {
          setScriptInput(`Lỗi từ server: ${error.detail}`);
        } else if (error && error.message) {
          setScriptInput(`Lỗi: ${error.message}`);
        } else {
          setScriptInput(
            "Không thể tạo kịch bản. Vui lòng kiểm tra kết nối và thử lại."
          );
        }
      }
    }

    setScriptProcessing(false);
  };

  // Function to navigate to edit page with video URL
  const handleEditVideo = () => {
    if (generatedVideoUrl) {
      const encodedVideoUrl = encodeURIComponent(generatedVideoUrl);
      console.log("Encoded video URL:", encodedVideoUrl); // Debug log
      const url = `/editor?videoUrl=${encodedVideoUrl}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="bg-white border-r border-gray-200 flex flex-col w-3/12">
        <div className="flex gap-4"></div>

        <div className="p-4">
          <ScriptGenerationForm
            topicInput={topicInput}
            setTopicInput={setTopicInput}
            language={language}
            setLanguage={setLanguage}
            numScenes={numScenes}
            setNumScenes={setNumScenes}
            onSubmit={handleTopicSubmit}
            isProcessing={scriptProcessing}
          />
        </div>
        <div className="px-4 mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Gợi ý xu hướng
          </h3>
          <Dropdown
            options={options}
            placeholder="Chọn một nền tảng gợi ý xu hướng..."
            onSelect={(option) => console.log("Selected:", option)}
          />
        </div>

        {trendsLoading && (
          <div className="px-4 py-6 text-center">
            <div className="inline-flex items-center gap-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Đang tải xu hướng...</span>
            </div>
          </div>
        )}

        {trendTopics.length > 0 && !trendsLoading && (
          <div className="px-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">
                Xu hướng ({trendTopics.length})
              </h4>
              <button
                onClick={() => setTrendTopics([])}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Xóa tất cả
              </button>
            </div>
            <div className="space-y-2 max-h-[45vh] overflow-y-auto">
              {trendTopics.map((topic, index) => (
                <div
                  key={index}
                  onClick={() => setTopicInput(topic)}
                  className="group bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-blue-100 border border-gray-200 hover:border-blue-300 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800 group-hover:text-blue-700 flex-1 pr-2">
                      {topic}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!trendsLoading && trendTopics.length === 0 && (
          <div className="px-4 py-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500 mb-1">Chưa có xu hướng nào</p>
            <p className="text-xs text-gray-400">
              Chọn một nền tảng để xem xu hướng phổ biến
            </p>
          </div>
        )}
        {/* Input Section */}
        {/* Settings */}
      </div>
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between px-4 mb-4">
          <span className="text-2xl font-semibold flex items-center gap-2">
            Kịch bản
          </span>
          {scriptInput && (
            <div className="flex gap-2">
              <button
                onClick={() => setScriptInput("")}
                className="text-sm px-3 py-1 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Xóa
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(scriptInput)}
                className="text-sm px-3 py-1 text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
              >
                Sao chép
              </button>
            </div>
          )}
        </div>
        <div className="px-4 flex-1">
          <textarea
            value={scriptInput}
            onChange={(e) => setScriptInput(e.target.value)}
            placeholder="Kịch bản sẽ được tạo tại đây..."
            className="w-full h-[65vh] p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm leading-relaxed"
          />
        </div>

        {/*Dropdown chọn model giọng nói và tạo hình ảnh*/}
        <div className="px-4 mt-4">
          <div className="grid grid-cols-1 gap-4 mb-4">
            <VideoNameInput
              label="Tên video"
              value={videoName}
              onChange={setVideoName}
              placeholder="Nhập tên video..."
              disabled={videoGenerating}
              required
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Dropdown chọn hình ảnh */}
            <select
              className="flex-1 border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              value={selectedImageModel}
              onChange={(e) => setSelectedImageModel(e.target.value)}
              disabled={videoGenerating}
            >
              <option value="">-- Chọn model hình ảnh --</option>
              {Array.isArray(imageModels) &&
                imageModels.map((model, index) => (
                  <option key={index} value={model.code}>
                    {model.name}
                  </option>
                ))}
            </select>

            {/* Dropdown chọn giọng đọc */}
            <select
              className="flex-1 border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              value={selectedVoiceModel}
              onChange={(e) => setSelectedVoiceModel(e.target.value)}
              disabled={videoGenerating}
            >
              <option value="">-- Chọn giọng đọc --</option>
              {Array.isArray(voiceModels) &&
                voiceModels.map((voice, index) => (
                  <option key={index} value={voice.name}>
                    {voice.name} ({voice.gender}, {voice.language})
                  </option>
                ))}
            </select>

            {/* Nút gửi */}
            <button
              onClick={handleSubmit}
              disabled={videoGenerating || !scriptInput.trim() || !selectedImageModel || !selectedVoiceModel || !videoName.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded text-sm font-medium transition-colors flex items-center gap-2"
            >
              {videoGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang tạo video...
                </>
              ) : (
                "Tạo video"
              )}
            </button>
          </div>
          
          {/* Progress indicator */}
          <VideoGenerationProgress
            isGenerating={videoGenerating}
            progress={generationProgress}
            completedSteps={completedSteps}
            totalSteps={4}
            error={generationError}
          />
          
          {/* Video Preview */}
          {generatedVideoUrl && (
            <VideoPreview
              videoUrl={generatedVideoUrl}
              videoName={videoName || 'Video đã tạo'}
              onEdit={handleEditVideo}
              className="mt-4"
            />
          )}
          
          {/* Test Section for Quick Testing */}
          <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">🧪 Test Video Editor</h3>
            <p className="text-sm text-gray-600 mb-4">
              Sử dụng section này để test nhanh chức năng edit video với các video mẫu
            </p>
            {/* Quick Actions */}
            <div className="border-t pt-4 mb-4">
              <h4 className="text-md font-medium text-gray-700 mb-3">🚀 Quick Actions</h4>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    const editUrl = `/editor`;
                    window.open(editUrl, '_blank');
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Mở Editor Trống
                </button>
                
                <button
                  onClick={() => {
                    // Test với resource list sample
                    const sampleResourceList = [
                      "https://pub-678b8517ce85460f91e69a5c322f3ea7.r2.dev/836cb7493a764771821f719fd936d3bf.png",
                      "https://videos.pexels.com/video-files/3139886/3139886-hd_720_1280_30fps.mp4",
                      "https://pub-678b8517ce85460f91e69a5c322f3ea7.r2.dev/4326b0f984a544dfaec15b8fe5193365.png"
                    ];
                    
                    const sampleTiming = [
                      {start_time: 0, end_time: 3},
                      {start_time: 3, end_time: 6},
                      {start_time: 6, end_time: 9}
                    ];
                    
                    const audioUrl = "https://cdn.img.ly/assets/demo/v1/ly.img.audio/audios/far_from_home.m4a";
                    
                    navigate('/editor', {
                      state: {
                        resourceList: sampleResourceList,
                        timing: sampleTiming,
                        audioUrl: audioUrl,
                        workspaceId: 'test-workspace'
                      }
                    });
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-10v8a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2h-8a2 2 0 00-2 2z" />
                  </svg>
                  Test với Timeline Mẫu
                </button>
              </div>
            </div>
            
            {/* Custom URL Test */}
            <div className="border-t pt-4">
              <h4 className="text-md font-medium text-gray-700 mb-2">Test với URL tùy chỉnh</h4>
              <CustomVideoUrlTest />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Test Video Card Component
const TestVideoCard = ({ title, description, videoUrl, onEdit }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <h4 className="font-semibold text-gray-800 mb-1">{title}</h4>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(videoUrl)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Video
        </button>
        <button
          onClick={() => window.open(videoUrl, '_blank')}
          className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" />
          Preview
        </button>
      </div>
    </div>
  );
};

// Custom Video URL Test Component
const CustomVideoUrlTest = () => {
  const [customUrl, setCustomUrl] = useState('');
  
  const handleCustomEdit = () => {
    if (!customUrl.trim()) {
      alert('Vui lòng nhập URL video');
      return;
    }
    
    try {
      new URL(customUrl); // Validate URL
      const encodedUrl = encodeURIComponent(customUrl);
      const editUrl = `/editor?videoUrl=${encodedUrl}`;
      window.open(editUrl, '_blank');
    } catch (error) {
      alert('URL không hợp lệ. Vui lòng nhập URL video đúng định dạng.');
    }
  };
  
  return (
    <div className="flex gap-2">
      <input
        type="url"
        value={customUrl}
        onChange={(e) => setCustomUrl(e.target.value)}
        placeholder="Nhập URL video để test..."
        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleCustomEdit}
        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
      >
        Test Edit
      </button>
    </div>
  );
};
