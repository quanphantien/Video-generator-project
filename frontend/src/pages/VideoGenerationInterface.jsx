import React, { useState } from 'react';
import { ChevronLeft, Bell, Info, Play } from 'lucide-react';
import axios from 'axios';
import { FaYoutube, FaTiktok, FaGoogle } from 'react-icons/fa';
import DropdownTrendSource from '../components/DropdownTrendSource';
import Dropdown from '../components/Dropdown';
import api from '../services/authService';
import videoGenerationService from '../services/videoGenerationService';

export default function VideoGenerationInterface() {
  const [activeTab, setActiveTab] = useState('Text to Video');
  const [topicInput, setTopicInput] = useState('');
  const [scriptInput, setScriptInput] = useState('');
  const [scriptProcessing, setScriptProcessing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [proMode, setProMode] = useState(true);
  const [style, setStyle] = useState('General');
  const [duration, setDuration] = useState('5 Seconds');
  const [trendTopics, setTrendTopics] = useState([]);
  const [trendsLoading, setTrendsLoading] = useState(false);

  const tabs = ['Reference to Video', 'Image to Video', 'Text to Video'];
  
  const youtubeHandleClick = async () => {
    setTrendsLoading(true);
    try {
      const response = await videoGenerationService.getYoutubeTrends();
      setTrendTopics(response);
      console.log('Youtube trends fetched:', response);
    } catch (error) {
      console.error('Error fetching YouTube trends:', error);
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
      const trends = response.data.map(item => item.keyword);
      setTrendTopics(trends);
      console.log('Google trends fetched:', trends);
    } catch (error) {
      console.error('Error fetching Google trends:', error);
      alert('Không thể lấy xu hướng. Vui lòng thử lại.');
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
      value: 'youtube', 
      onClick: youtubeHandleClick 
    },
    { 
      label: (
        <div className="flex items-center gap-2">
          <FaTiktok className="text-black" />
          Tiktok
        </div>
      ), 
      value: 'tiktok' 
    },
    { 
      label: (
        <div className="flex items-center gap-2">
          <FaGoogle className="text-blue-500" />
          <div>
            <div>Google AI Trends</div>
            <div className="text-xs text-gray-500">Keyword tùy chọn</div>
          </div>
        </div>
      ), 
      value: 'google', 
      onClick: googleHandleClick 
    },
  ];

  const handleCreate = () => {
    setProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setProcessing(false);
    }, 3000);
  };
  const handleTopicSubmit = async (e) => {
    e.preventDefault();
    setScriptProcessing(true);
    
    if (topicInput.trim()) {
      try {
        const response = await videoGenerationService.generateScript({
          language: "vi",
          prompt: topicInput.trim(),
          num_scenes: 10
        });
        
        console.log('Script response:', response); // Debug log
        
        // Kiểm tra cấu trúc response từ API
        if (response && response.code === 'SUCCESS' && response.data) {
          const scriptData = response.data;
          
          // Nếu có scenes array, format thành text
          if (Array.isArray(scriptData.scenes)) {
            const scriptText = scriptData.scenes.map((scene, index) => {
              const sceneNumber = index + 1;
              const text = scene.text || scene.description || '';
              const prompt = scene.prompt || '';
              const tts = scene.tts || '';
              
              return `Scene ${sceneNumber}:
Text: ${text}
${prompt ? `Prompt: ${prompt}` : ''}
${tts ? `TTS: ${tts}` : ''}`;
            }).join('\n\n');
            
            setScriptInput(scriptText);
          }
          // Nếu có field script trực tiếp
          else if (scriptData.script) {
            setScriptInput(scriptData.script);
          }
          // Nếu data là string
          else if (typeof scriptData === 'string') {
            setScriptInput(scriptData);
          }
          // Fallback: stringify data
          else {
            setScriptInput(JSON.stringify(scriptData, null, 2));
          }
        } 
        // Nếu response không có structure mong đợi
        else {
          console.error('Unexpected response format:', response);
          if (response && response.message) {
            setScriptInput(`Lỗi: ${response.message}`);
          } else {
            setScriptInput('Có lỗi xảy ra khi tạo kịch bản. Vui lòng thử lại.');
          }
        }
      } catch (error) {
        console.error('Error generating script:', error);
        
        // Xử lý error message từ backend
        if (error && error.detail) {
          setScriptInput(`Lỗi từ server: ${error.detail}`);
        } else if (error && error.message) {
          setScriptInput(`Lỗi: ${error.message}`);
        } else {
          setScriptInput('Không thể tạo kịch bản. Vui lòng kiểm tra kết nối và thử lại.');
        }
      }
    }

    setScriptProcessing(false); 
  }

  return (
    <div className="min-h-screen flex">
      <div className="bg-white border-r border-gray-200 flex flex-col w-3/12">
        <div className="flex gap-4">
    </div>

        <div className="p-4">
          <textarea
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="Nhập chủ đề video"
            className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          </div>

          <div  className="p-4">
           <button
            onClick={handleTopicSubmit}
            disabled={!topicInput.trim() || scriptProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg text-sm font-medium transition-colors"
          >
            {scriptProcessing ? 'Đang xử lý...' : 'Tạo kịch bản'}
          </button>
        </div>
                  <div className="px-4 mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Gợi ý xu hướng</h3>
            <Dropdown
              options={options}
              placeholder="Chọn một nền tảng gợi ý xu hướng..."
              onSelect={(option) => console.log('Selected:', option)}
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
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 mb-1">Chưa có xu hướng nào</p>
              <p className="text-xs text-gray-400">Chọn một nền tảng để xem xu hướng phổ biến</p>
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
                onClick={() => setScriptInput('')}
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

      </div>
    </div>
  );
}