import React, { useState } from 'react';
import { FaYoutube, FaCopy, FaExternalLinkAlt, FaCheck } from 'react-icons/fa';

const YouTubeLinkCard = ({ project }) => {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(project.youtubeUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    const handleOpenYouTube = () => {
        window.open(project.youtubeUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="border border-red-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-red-50 to-white">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <FaYoutube className="text-red-600 text-lg" />
                    <h3 className="font-medium text-gray-800 truncate flex-1" title={project.name}>
                        {project.name}
                    </h3>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {project.createdAt}
                </span>
            </div>
            
            {/* YouTube Info */}
            <div className="bg-white rounded-md p-3 mb-3 border border-gray-100">
                <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">YouTube ID:</span>
                </div>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-700 block break-all">
                    {project.youtubeId}
                </code>
                
                <div className="text-sm text-gray-600 mt-2 mb-1">
                    <span className="font-medium">Link:</span>
                </div>
                <div className="flex items-center gap-2">
                    <code className="bg-blue-50 px-2 py-1 rounded text-xs font-mono text-blue-700 flex-1 truncate">
                        {project.youtubeUrl}
                    </code>
                </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={handleOpenYouTube}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                >
                    <FaYoutube className="text-sm" />
                    Mở YouTube
                    <FaExternalLinkAlt className="text-xs" />
                </button>
                
                <button
                    onClick={handleCopyLink}
                    className={`flex items-center justify-center px-4 py-2 rounded-lg transition-all duration-200 ${
                        copied 
                            ? 'bg-green-100 text-green-700 border border-green-300' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}
                    title={copied ? 'Đã copy!' : 'Copy link'}
                >
                    {copied ? <FaCheck className="text-sm" /> : <FaCopy className="text-sm" />}
                </button>
            </div>
            
            {/* Copy Success Message */}
            {copied && (
                <div className="mt-2 text-center">
                    <span className="text-xs text-green-600 font-medium">
                        ✅ Đã copy link vào clipboard!
                    </span>
                </div>
            )}
        </div>
    );
};

export default YouTubeLinkCard;
