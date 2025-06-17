import React, { useState, useEffect } from "react";
import { FaFacebook, FaYoutube, FaTiktok } from "react-icons/fa";
import "./Statistics.css";

const StatisticsPage = () => {
    const [statistics, setStatistics] = useState({
        facebook: { views: 0, likes: 0, comments: 0, shares: 0 },
        youtube: { views: 0, likes: 0, comments: 0, shares: 0 },
        tiktok: { views: 0, likes: 0, comments: 0, shares: 0 },
    });

    useEffect(() => {
        // Mock data for statistics
        const mockStatistics = {
            facebook: { views: 12000, likes: 800, comments: 150, shares: 50 },
            youtube: { views: 25000, likes: 2000, comments: 300, shares: 100 },
            tiktok: { views: 18000, likes: 1200, comments: 250, shares: 80 },
        };

        setStatistics(mockStatistics);
    }, []);

    const renderPlatformStats = (platform, icon, stats) => (
        <div className="bg-white p-6 shadow rounded-lg text-center">
            <div className="text-4xl text-purple-600 mb-4">{icon}</div>
            <h3 className="text-xl font-semibold">{platform}</h3>
            <div className="text-left mt-4">
                <p>Views: <span className="font-bold">{stats.views}</span></p>
                <p>Likes: <span className="font-bold">{stats.likes}</span></p>
                <p>Comments: <span className="font-bold">{stats.comments}</span></p>
                <p>Shares: <span className="font-bold">{stats.shares}</span></p>
            </div>
        </div>
    );

    return (
        <div className="statistics-container bg-gray-100 p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <div className="flex items-baseline gap-2">
                    <h1 className="text-3xl font-bold text-purple-600">Statistics</h1>
                    <p className="text-gray-600">Overview of engagement metrics across platforms</p>
                </div>
            </div>

        </div>

            {/* Statistics Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {renderPlatformStats("Facebook", <FaFacebook />, statistics.facebook)}
                {renderPlatformStats("YouTube", <FaYoutube />, statistics.youtube)}
                {renderPlatformStats("TikTok", <FaTiktok />, statistics.tiktok)}
            </div>

            {/* Chart Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg shadow-sm mt-6">
                <div className="mb-4">
                    <div className="flex items-center gap-2">
                        <div className="text-pink-500 text-xl">📊</div>
                        <h2 className="text-xl font-semibold">Platform Statistics</h2>
                    </div>
                    <p className="text-gray-600 mt-1">
                        View detailed statistics about your video performance across different platforms
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StatisticsPage;