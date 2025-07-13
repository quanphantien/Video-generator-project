import React, { useEffect, useRef } from 'react';
import { Play, Edit, Download, ExternalLink, RefreshCw } from 'lucide-react';

const VideoPreview = ({ 
  videoUrl, 
  videoName = 'Video đã tạo',
  onEdit,
  onDownload,
  className = ""
}) => {
  const videoRef = useRef(null);

  // Force reload video khi URL thay đổi
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      console.log('VideoPreview: Loading new video URL:', videoUrl);
      videoRef.current.load(); // Force reload video element
    }
  }, [videoUrl]);

  if (!videoUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `${videoName}.mp4`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefresh = () => {
    if (videoRef.current) {
      console.log('Manual refresh video');
      videoRef.current.load();
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Play className="w-5 h-5 text-green-500" />
          {videoName}
        </h3>
        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
          Đã hoàn thành
        </span>
      </div>
      
      {/* Video Player */}
      <div className="mb-4">
        <video 
          ref={videoRef}
          key={videoUrl} // Force re-render khi URL thay đổi
          controls 
          className="w-full rounded-lg shadow-sm"
          style={{ maxHeight: '300px' }}
          preload="metadata"
        >
          <source src={videoUrl} type="video/mp4" />
          Trình duyệt của bạn không hỗ trợ video.
        </video>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={onEdit}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Edit className="w-4 h-4" />
          Chỉnh sửa video
        </button>
        
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
        
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Tải xuống
        </button>
        
        <button
          onClick={() => window.open(videoUrl, '_blank')}
          className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Xem toàn màn hình
        </button>
      </div>
      
      {/* Video Info */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          <div>URL: <span className="font-mono text-blue-600">{videoUrl}</span></div>
        </div>
      </div>
    </div>
  );
};

export default VideoPreview;
