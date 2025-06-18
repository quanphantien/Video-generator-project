import React, { useState } from 'react';
import { ChevronLeft, Bell, Info, Play } from 'lucide-react';
import axios from 'axios';
import { FaYoutube, FaTiktok } from 'react-icons/fa';
import DropdownTrendSource from '../components/DropdownTrendSource';
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
  const [trendTopics, setTrendTopics] = useState([]);

  const tabs = ['Reference to Video', 'Image to Video', 'Text to Video'];
  
  const youtubeHandleClick = () => {
    const fetchYoutubeTrends = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_CONVEASE_API_BASE_URL}go-trends/youtube-trending`);
        setTrendTopics(response.data);
        console.log('Youtube trends fetched:', response.data);
      } catch (error) {
        console.error('Error fetching YouTube trends:', error);
      }
    }
    fetchYoutubeTrends();
    console.log(trendTopics);
  };


  const options = [
    { label: 'Youtube', value: 'youtube', onClick: youtubeHandleClick },
    { label: 'Tiktok', value: 'tiktok' },
    { label: 'Google', value: 'google' },
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
      <div className="bg-white border-r border-gray-200 flex flex-col ">
        <div  className="px-4 flex items-center justify-between">
          Chủ đề
        </div>
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
                  <div className ="px-4">
            <Dropdown
            options={options}
            placeholder="Chọn một nền tảng gợi ý xu hướng..."
            // onSelect={(option) => console.log('Selected:', option)}
          />
          </div>
          <div className="grid gap-4 grid-cols-1 ">
        {trendTopics.map((topic, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 group cursor-pointer"
          >
            {topic}
          </div>
        ))}


        </div>
        {/* Input Section */}
        {/* Settings */}
      </div>
      <div className="flex-1 p-4 bg-gray-100">
        <span className="px-4 text-2xl font-semibold mb-4 flex items-center gap-2">
          Kịch bản
        </span>
        <div className="px-4 flex-1">
          <textarea
            value={scriptInput}
            onChange={(e) => setScriptInput(e.target.value)}
            placeholder=""
            className="w-full h-[60vh] p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

      </div>
    </div>
  );
}