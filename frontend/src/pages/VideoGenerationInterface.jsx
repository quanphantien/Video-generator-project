import React, { useState } from 'react';
import { ChevronLeft, Bell, Info, Play } from 'lucide-react';
import axios from 'axios';

export default function VideoGenerationInterface() {
  const [activeTab, setActiveTab] = useState('Text to Video');
  const [topicInput, setTopicInput] = useState('');
  const [scriptInput, setScriptInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [proMode, setProMode] = useState(true);
  const [style, setStyle] = useState('General');
  const [duration, setDuration] = useState('5 Seconds');

  const tabs = ['Reference to Video', 'Image to Video', 'Text to Video'];
  const handleCreate = () => {
    setProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setProcessing(false);
    }, 3000);
  };
  const handleTopicSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    if (topicInput.trim()) {
       try {
      const response = await axios.post(
        `${process.env.REACT_APP_CONVEASE_API_BASE_URL}script/generate`,
        { keyword: topicInput, length:100 } 
      );
      setScriptInput(response.data.script); 
    } catch (error) {
      console.error('Error generating script:', error);
    }
  }

  setProcessing(false); 
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        <div  className="px-4 flex items-center justify-between">
          Chủ đề
        </div>
        <div className="p-4 flex-1">
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
            disabled={!topicInput.trim() || processing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg text-sm font-medium transition-colors"
          >
            {processing ? 'Đang xử lý...' : 'Tạo kịch bản'}
          </button>
        </div>
        {/* Input Section */}
        <div className="p-4 flex-1">
          <textarea
            value={scriptInput}
            onChange={(e) => setScriptInput(e.target.value)}
            placeholder="Enter text, describe the content you want to generate"
            className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

        </div>

        {/* Settings */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>

          {/* Style */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">Style</span>
              <Info size={14} className="text-gray-400" />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="style"
                  value="General"
                  checked={style === 'General'}
                  onChange={(e) => setStyle(e.target.value)}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">General</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="style"
                  value="Animation"
                  checked={style === 'Animation'}
                  onChange={(e) => setStyle(e.target.value)}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">Animation</span>
              </label>
            </div>
          </div>

          {/* Duration */}
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-700 block mb-2">Duration</span>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="duration"
                value="5 Seconds"
                checked={duration === '5 Seconds'}
                onChange={(e) => setDuration(e.target.value)}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-700">5 Seconds</span>
            </label>
          </div>

          {/* Resolution */}
          <div className="mb-6">
            <span className="text-sm font-medium text-gray-700 block mb-2">Resolution</span>
            <div className="relative">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="resolution"
                  value="1080p"
                  defaultChecked
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">1080p</span>
              </label>
              <span className="absolute -top-2 left-8 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                Upgrade
              </span>
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreate}
            disabled={!scriptInput.trim() || processing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg text-sm font-medium transition-colors"
          >
            {processing ? 'Processing...' : 'Create'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          {/* Illustration */}
          <div className="w-64 h-64 mx-auto mb-8 relative">
            <div className="absolute inset-0 bg-white rounded-full shadow-lg opacity-20"></div>
            <div className="absolute inset-8 bg-white rounded-full shadow-md opacity-40"></div>
            <div className="absolute inset-16 bg-white rounded-2xl shadow-lg flex items-center justify-center">
              <div className="w-20 h-16 bg-gray-200 rounded-lg flex items-center justify-center relative">
                <Play className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            {/* Decorative dots */}
            <div className="absolute top-12 left-12 w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
            <div className="absolute top-20 right-16 w-1 h-1 bg-indigo-400 rounded-full animate-pulse delay-75"></div>
            <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse delay-150"></div>
            <div className="absolute bottom-16 right-12 w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-300"></div>
            <div className="absolute top-32 left-8 w-1 h-1 bg-indigo-300 rounded-full animate-pulse delay-500"></div>
          </div>

          {/* Text */}
          <h2 className="text-xl font-medium text-gray-700">
            Start creating your first video now!
          </h2>
        </div>
      </div>
    </div>
  );
}