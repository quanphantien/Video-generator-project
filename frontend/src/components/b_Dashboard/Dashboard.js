import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { FaChartBar, FaProjectDiagram, FaEye } from "react-icons/fa";

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

    return (
        <div className="dashboard-container bg-gray-100 p-6">
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-purple-600">Dashboard</h1>
                <p className="text-gray-600">Quản lý dự án video AI của bạn</p>
            </div>

            {/* Statistics Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 shadow rounded-lg text-center">
                    <FaProjectDiagram className="text-4xl text-purple-600 mb-4" />
                    <h3 className="text-xl font-semibold">Tổng số dự án</h3>
                    <p className="text-2xl font-bold">{statistics.totalProjects}</p>
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
        </div>
    );
};

export default Dashboard;