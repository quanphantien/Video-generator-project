import React, { useState } from 'react';
import { FaPlay, FaEdit, FaTrash, FaEye, FaCalendar, FaYoutube } from 'react-icons/fa';
import { youtubeService } from '../ConnectYoutube/serviceYoutube';

const ProjectCard = ({ project, onPlay, onEdit, onDelete, onPublishToYoutube }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showPublishConfirm, setShowPublishConfirm] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        onDelete(project.id);
        setShowDeleteConfirm(false);
    };

    const handlePublishClick = () => {
        if (!isYoutubeConnected) {
            onPublishToYoutube(project); // Để Dashboard xử lý thông báo lỗi
            return;
        }
        setShowPublishConfirm(true);
    };

    const handleConfirmPublish = async () => {
        setIsPublishing(true);
        setShowPublishConfirm(false);
        try {
            await onPublishToYoutube(project);
        } finally {
            setIsPublishing(false);
        }
    };

    const isYoutubeConnected = youtubeService.isConnected();

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed':
                return 'text-green-600 bg-green-100';
            case 'In Progress':
                return 'text-yellow-600 bg-yellow-100';
            case 'Planning':
                return 'text-blue-600 bg-blue-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getPlatformColor = (platform) => {
        switch (platform) {
            case 'YouTube':
                return 'text-red-600 bg-red-100';
            case 'Facebook':
                return 'text-blue-600 bg-blue-100';
            case 'TikTok':
                return 'text-purple-600 bg-purple-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                {/* Thumbnail */}
                <div className="relative h-40 bg-gray-200">
                    {!imageError ? (
                        <img
                            src={project.thumbnail}
                            alt={project.name}
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FaPlay className="text-4xl" />
                        </div>
                    )}

                    {/* Status Badge */}
                    <span className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                    </span>

                    {/* Platform Badge */}
                    <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getPlatformColor(project.platform)}`}>
                        {project.platform}
                    </span>
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 truncate" title={project.name}>
                        {project.name}
                    </h3>

                    <div className="flex items-center text-sm text-gray-600 mb-2">
                        <FaEye className="mr-1" />
                        <span>{project.views?.toLocaleString() || 0} lượt xem</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-4">
                        <FaCalendar className="mr-1" />
                        <span>{project.createdAt}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPlay(project)}
                            className="flex-1 flex items-center justify-center gap-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition text-sm"
                        >
                            <FaPlay className="text-xs" />
                            Xem
                        </button>
                        <button
                            onClick={() => onEdit(project.id)}
                            className="flex items-center justify-center bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
                        >
                            <FaEdit className="text-sm" />
                        </button>
                        <button
                            onClick={handlePublishClick}
                            disabled={isPublishing}
                            className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition text-sm ${
                                isYoutubeConnected 
                                    ? 'bg-red-600 text-white hover:bg-red-700' 
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            title={!isYoutubeConnected ? "Chưa kết nối YouTube" : "Xuất bản lên YouTube"}
                        >
                            <FaYoutube className="text-xs" />
                            {isPublishing ? "Đang xuất bản..." : "YouTube"}
                        </button>
                        <button
                            onClick={handleDeleteClick}
                            className="flex items-center justify-center bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition"
                        >
                            <FaTrash className="text-sm" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Xác nhận xóa</h3>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn xóa project "{project.name}" không?
                            Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* YouTube Publish Confirmation Modal */}
            {showPublishConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <FaYoutube className="text-red-600 text-2xl" />
                            <h3 className="text-lg font-semibold text-gray-800">Upload lên YouTube</h3>
                        </div>
                        <div className="mb-6">
                            <p className="text-gray-600 mb-3">
                                Bạn có muốn upload video "{project.name}" lên kênh YouTube đã kết nối không?
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                                <p><strong>📹 Tên video:</strong> {project.name}</p>
                                <p><strong>📝 Mô tả:</strong> Video được tạo từ dự án {project.name}</p>
                                <div className="border-t pt-2 mt-3">
                                    <p className="text-orange-600 font-medium mb-2">⚠️ Lưu ý quan trọng:</p>
                                    <ul className="text-gray-600 space-y-1 text-xs">
                                        <li>• Video sẽ được upload với trạng thái <strong>Private (riêng tư)</strong></li>
                                        <li>• Bạn có thể thay đổi trạng thái trong YouTube Studio sau khi upload</li>
                                        <li>• Quá trình upload có thể mất vài phút tùy kích thước video</li>
                                        <li>• Chỉ hỗ trợ video được tạo trực tiếp từ ứng dụng</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowPublishConfirm(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmPublish}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                            >
                                <FaYoutube />
                                Bắt đầu Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProjectCard;