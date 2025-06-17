import React, { useState } from 'react';
import { ChevronLeft, Bell, Info, Play } from 'lucide-react';
import axios from 'axios';
import { FaYoutube, FaTiktok } from 'react-icons/fa';
import Dropdown from '../components/Dropdown';

export default function VideoGenerationInterface() {
  const [activeTab, setActiveTab] = useState('Text to Video');
  const [topicInput, setTopicInput] = useState('');
  const [scriptInput, setScriptInput] = useState('');
  const [scriptProcessing, setScriptProcessing] = useState(false);
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
    setScriptProcessing(true);
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

  setScriptProcessing(false); 
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="bg-white border-r border-gray-200 flex flex-col w-full">
        <div  className="px-4 flex items-center justify-between">
          Chủ đề
        </div>
        <div className="flex gap-4">
      <a target="_blank" rel="noopener noreferrer">
        <FaYoutube className="text-red-600 text-2xl hover:opacity-80" />
      </a>
      <a target="_blank" rel="noopener noreferrer">
        <FaTiktok className="text-black text-2xl hover:opacity-80" />
      </a>
    </div>
    <div className ="px-4">
    <Dropdown />
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
            disabled={!topicInput.trim() || scriptProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg text-sm font-medium transition-colors"
          >
            {scriptProcessing ? 'Đang xử lý...' : 'Tạo kịch bản'}
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
    </div>
  );
}