import React, { useState } from 'react';
import { FaPlay, FaEdit, FaTrash, FaEye, FaCalendar, FaYoutube } from 'react-icons/fa';

const ProjectCard = ({ project, onPlay, onEdit, onDelete }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        onDelete(project.id);
        setShowDeleteConfirm(false);
    };

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
                {/* Thumbnaill */}
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

                    {/* YouTube Badge */}
                    {project.youtubeId && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <FaYoutube />
                            YouTube
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 truncate" title={project.name}>
                        {project.name}
                    </h3>

                    <div className="flex items-center text-sm text-gray-600 mb-4">
                        <FaCalendar className="mr-1" />
                        <span>{project.createdAt}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPlay(project)}
                            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition text-sm ${
                                project.youtubeId 
                                    ? 'bg-red-600 text-white hover:bg-red-700' 
                                    : 'bg-purple-600 text-white hover:bg-purple-700'
                            }`}
                        >
                            {project.youtubeId ? <FaYoutube className="text-xs" /> : <FaPlay className="text-xs" />}
                            {project.youtubeId ? 'YouTube' : 'Xem'}
                        </button>
                        <button
                            onClick={onEdit}
                            className="flex items-center justify-center bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
                        >
                            <FaEdit className="text-sm" />
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
        </>
    );
};

export default ProjectCard;