import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { FaChartBar, FaProjectDiagram, FaEye, FaPlus } from "react-icons/fa";
import UserProfile from "../UserProfile/UserProfile";

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

    useEffect(() => {
        // Mock data for projects and statistics
        const mockProjects = [
            { id: 1, name: "Project A", status: "Completed", views: 12000, platform: "YouTube" },
            { id: 2, name: "Project B", status: "In Progress", views: 8000, platform: "Facebook" },
            { id: 3, name: "Project C", status: "Planning", views: 15000, platform: "TikTok" },
        ];

        const mockStatistics = {
            totalProjects: mockProjects.length,
            totalViews: mockProjects.reduce((acc, project) => acc + project.views, 0),
            platforms: {
                youtube: mockProjects.filter((p) => p.platform === "YouTube").reduce((acc, p) => acc + p.views, 0),
                facebook: mockProjects.filter((p) => p.platform === "Facebook").reduce((acc, p) => acc + p.views, 0),
                tiktok: mockProjects.filter((p) => p.platform === "TikTok").reduce((acc, p) => acc + p.views, 0),
            },
        };

        setProjects(mockProjects);
        setStatistics(mockStatistics);
    }, []);

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
                <h2 className="text-xl font-semibold text-purple-600 mb-4">Danh sách dự án</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div key={project.id} className="border p-4 rounded-lg shadow hover:shadow-lg transition">
                            <h3 className="text-lg font-semibold text-purple-600">{project.name}</h3>
                            <p className="text-gray-600">Trạng thái: <span className={`font-bold ${project.status === "Completed" ? "text-green-500" : project.status === "In Progress" ? "text-yellow-500" : "text-gray-500"}`}>{project.status}</span></p>
                            <p className="text-gray-600">Nền tảng: {project.platform}</p>
                            <p className="text-gray-600">Lượt xem: {project.views}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* User Profile Section */}
            {showUserProfile && (
                <div className="mt-6">
                    <UserProfile />
                </div>
            )}

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

            {/* User Profile Section */}
            {showUserProfile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h2 className="text-2xl font-bold text-purple-600 mb-4">Thông tin người dùng</h2>
                        <UserProfile />
                        <div className="flex justify-end gap-4 mt-4">
                            <button
                                onClick={() => setShowUserProfile(false)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;