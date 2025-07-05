import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { FaChartBar, FaProjectDiagram, FaEye, FaPlus } from "react-icons/fa";
import { videoAPI, statisticsAPI } from "../../services/api";
import ProjectCard from "./ProjectCard";
import AddProjectCard from "./AddProjectCard";

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [statistics, setStatistics] = useState({
        totalProjects: 0,
        totalViews: 0,
        platforms: {
            youtube: 0,
            facebook: 0,
            tiktok: 0,
        },
    });
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showUserProfile, setShowUserProfile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    // Fetch projects từ APIi
    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError(null);

            // Kiểm tra xem API service có tồn tại không
            if (!videoAPI || !videoAPI.getAllVideos) {
                throw new Error('API service not available');
            }

            const result = await videoAPI.getAllVideos();

            if (result && result.code === 200 && result.data) {
                // Transform API data to match our project structure
                const transformedProjects = result.data.map(video => ({
                    id: video.video_id,
                    name: video.name,
                    status: "Completed",
                    videoUrl: video.video_url,
                    thumbnail: video.thumbnail_url || "/placeholder-thumbnail.jpg",
                    createdAt: new Date(video.created_at || Date.now()).toLocaleDateString(),
                    views: Math.floor(Math.random() * 20000),
                    platform: "YouTube",
                    type: "video"
                }));

                setProjects(transformedProjects);

                // Cập nhật statistics
                const totalViews = transformedProjects.reduce((acc, project) => acc + project.views, 0);
                setStatistics(prev => ({
                    ...prev,
                    totalProjects: transformedProjects.length,
                    totalViews: totalViews,
                    platforms: {
                        youtube: transformedProjects.filter(p => p.platform === "YouTube").reduce((acc, p) => acc + p.views, 0),
                        facebook: transformedProjects.filter(p => p.platform === "Facebook").reduce((acc, p) => acc + p.views, 0),
                        tiktok: transformedProjects.filter(p => p.platform === "TikTok").reduce((acc, p) => acc + p.views, 0),
                    }
                }));

                // Fetch statistics nếu có API
                try {
                    await fetchStatistics();
                } catch (statErr) {
                    console.warn('Could not fetch statistics:', statErr);
                }
            } else {
                throw new Error('Invalid API response');
            }
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError('Không thể tải danh sách project từ server. Hiển thị dữ liệu mẫu.');

            // Fallback to mock data - đảm bảo luôn có data
            const mockProjects = [
                {
                    id: 1,
                    name: "AI Video Tutorial",
                    status: "Completed",
                    views: 12000,
                    platform: "YouTube",
                    type: "video",
                    thumbnail: "/placeholder-thumbnail.jpg",
                    createdAt: "2025-01-15",
                    videoUrl: "https://www.youtube.com/watch?v=sample1"
                },
                {
                    id: 2,
                    name: "Product Demo",
                    status: "In Progress",
                    views: 8000,
                    platform: "Facebook",
                    type: "video",
                    thumbnail: "/placeholder-thumbnail.jpg",
                    createdAt: "2025-01-20",
                    videoUrl: "https://www.facebook.com/watch?v=sample2"
                },
                {
                    id: 3,
                    name: "Marketing Campaign",
                    status: "Planning",
                    views: 15000,
                    platform: "TikTok",
                    type: "video",
                    thumbnail: "/placeholder-thumbnail.jpg",
                    createdAt: "2025-01-25",
                    videoUrl: "https://www.tiktok.com/@user/video/sample3"
                },
                {
                    id: 4,
                    name: "Brand Story",
                    status: "Completed",
                    views: 9500,
                    platform: "YouTube",
                    type: "video",
                    thumbnail: "/placeholder-thumbnail.jpg",
                    createdAt: "2025-01-10",
                    videoUrl: "https://www.youtube.com/watch?v=sample4"
                },
                {
                    id: 5,
                    name: "Tutorial Series",
                    status: "Completed",
                    views: 18500,
                    platform: "YouTube",
                    type: "video",
                    thumbnail: "/placeholder-thumbnail.jpg",
                    createdAt: "2025-01-05",
                    videoUrl: "https://www.youtube.com/watch?v=sample5"
                },
                {
                    id: 6,
                    name: "Social Media Content",
                    status: "In Progress",
                    views: 5500,
                    platform: "TikTok",
                    type: "video",
                    thumbnail: "/placeholder-thumbnail.jpg",
                    createdAt: "2025-01-28",
                    videoUrl: "https://www.tiktok.com/@user/video/sample6"
                }
            ];

            setProjects(mockProjects);

            // Cập nhật statistics với mock data
            const totalViews = mockProjects.reduce((acc, project) => acc + project.views, 0);
            setStatistics({
                totalProjects: mockProjects.length,
                totalViews: totalViews,
                platforms: {
                    youtube: mockProjects.filter((p) => p.platform === "YouTube").reduce((acc, p) => acc + p.views, 0),
                    facebook: mockProjects.filter((p) => p.platform === "Facebook").reduce((acc, p) => acc + p.views, 0),
                    tiktok: mockProjects.filter((p) => p.platform === "TikTok").reduce((acc, p) => acc + p.views, 0),
                }
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch statistics từ API  
    const fetchStatistics = async () => {
        try {
            const result = await statisticsAPI.getUserStatistics();
            if (result.code === 200 && result.data) {
                // Update statistics với data từ API
                // Cấu trúc data tùy theo API response
                setStatistics(prev => ({
                    ...prev,
                    // Cập nhật các field statistics từ API
                }));
            }
        } catch (err) {
            console.warn('Could not fetch statistics:', err);
            // Không cần hiển thị error vì statistics không quan trọng bằng projects
        }
    };

    // Handle delete project
    const handleDeleteProject = async (projectId) => {
        try {
            await videoAPI.deleteVideo(projectId);
            
            // Remove project from local state
            setProjects(prev => prev.filter(p => p.id !== projectId));
            alert('Project đã được xóa thành công!');
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Có lỗi xảy ra khi xóa project. Vui lòng thử lại.');
        }
    };

    // Handle play video
    const handlePlayVideo = (project) => {
        if (project.videoUrl) {
            window.open(project.videoUrl, '_blank');
        }
    };

    // Handle edit project
    const handleEditProject = (projectId) => {
        // Navigate to edit page - có thể dùng React Router
        window.open(`/edit/${projectId}`, '_blank');
    };

    const handleCreateProject = () => {
        // Mở tab mới với URL của trang tạo project
        const newWindow = window.open('/create', '_blank');
        newWindow.focus();
        setShowCreateProjectModal(false);
    };

    return (
        <div className="dashboard-container bg-gray-100 p-6">
            {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <h1 className="text-3xl font-bold text-purple-600">Dashboard</h1>
                                    <p className="text-gray-600">Quản lý dự án video AI của bạn</p>
                                </div>
                            </div>

                            <div className="flex gap-4 relative">
                                <button
                                    onClick={() => setShowCreateProjectModal(true)}
                                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                                >
                                    <FaPlus />
                                    Tạo Project Mới
                                </button>

                                <button
                                    onClick={() => setShowUserProfile(!showUserProfile)}
                                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                                >
                                    Thông tin cá nhân
                                </button>

                                <button
                                    onClick={() => window.open('/api-demo', '_blank')}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                >
                                    Demo API
                                </button>

                                <button
                                    className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-purple-600 flex items-center gap-2"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    Tài khoản đã kết nối
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {isDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                                        <div className="px-4 py-2 hover:bg-gray-100">
                                            <span className="text-sm font-medium">YouTube Channel</span>
                                            <p className="text-xs text-gray-500">channel@gmail.com</p>
                                        </div>
                                        <div className="px-4 py-2 hover:bg-gray-100">
                                            <span className="text-sm font-medium">Facebook Page</span>
                                            <p className="text-xs text-gray-500">My Page Name</p>
                                        </div>
                                        <div className="px-4 py-2 hover:bg-gray-100">
                                            <span className="text-sm font-medium">TikTok Account</span>
                                            <p className="text-xs text-gray-500">@tiktokhandle</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Statistics Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 shadow rounded-lg text-center">
                    <FaProjectDiagram className="text-4xl text-purple-600 mb-4" />
                    <h3 className="text-xl font-semibold">Thống kê sơ bộ</h3>
                    <div className="text-left mt-4">
                        <p>Tổng số dự án: {statistics.totalProjects}</p>
                        <p>Tổng số video đã xuất bản:</p>
                    </div>
                </div>
                <div className="bg-white p-6 shadow rounded-lg text-center">
                    <FaEye className="text-4xl text-purple-600 mb-4" />
                    <h3 className="text-xl font-semibold">Tổng lượt xem</h3>
                    <p className="text-2xl font-bold">{statistics.totalViews}</p>
                </div>
                <div className="bg-white p-6 shadow rounded-lg text-center">
                    <FaChartBar className="text-4xl text-purple-600 mb-4" />
                    <h3 className="text-xl font-semibold">Lượt xem theo nền tảng</h3>
                    <div className="text-left mt-4">
                        <p>YouTube: {statistics.platforms.youtube}</p>
                        <p>Facebook: {statistics.platforms.facebook}</p>
                        <p>TikTok: {statistics.platforms.tiktok}</p>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showCreateProjectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h2 className="text-2xl font-bold text-purple-600 mb-4">Tạo Project Mới</h2>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn tạo một project mới không?
                            Một tab mới sẽ được mở để bạn bắt đầu.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowCreateProjectModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleCreateProject}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Project List Section */}
            <div className="bg-white p-6 shadow rounded-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-purple-600">Danh sách dự án</h2>
                    <button
                        onClick={fetchProjects}
                        className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Làm mới
                    </button>
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        <span className="ml-3 text-gray-600">Đang tải...</span>
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {/* Project Grid - 4 columns per row */}
                {!loading && !error && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 xl:gap-6">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onPlay={handlePlayVideo}
                                onEdit={handleEditProject}
                                onDelete={handleDeleteProject}
                            />
                        ))}

                        {/* Add new project card */}
                        <AddProjectCard onClick={() => setShowCreateProjectModal(true)} />
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && projects.length === 0 && (
                    <div className="text-center py-12">
                        <FaProjectDiagram className="text-6xl text-gray-300 mb-4 mx-auto" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">Chưa có project nào</h3>
                        <p className="text-gray-500 mb-4">Bắt đầu tạo project đầu tiên của bạn</p>
                        <button
                            onClick={() => setShowCreateProjectModal(true)}
                            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
                        >
                            Tạo Project Đầu Tiên
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;