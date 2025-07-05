import React, { useState, useEffect } from "react";
import { FaFacebook, FaYoutube, FaTiktok } from "react-icons/fa";
import { getStatistics } from "../../services/api";
import { useAuth } from "../../context/authContext";
import "./Statistics.css";

const StatisticsPage = () => {
    const { isAuthenticated, getValidToken } = useAuth();
    const [statistics, setStatistics] = useState({
        facebook: { views: 0, likes: 0, comments: 0, shares: 0 },
        youtube: { views: 0, likes: 0, comments: 0, shares: 0 },
        tiktok: { views: 0, likes: 0, comments: 0, shares: 0 },
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                setLoading(true);

                // Kiểm tra authenticationn
                if (!isAuthenticated) {
                    setError('Please login to view statistics');
                    setLoading(false);
                    return;
                }

                // Lấy token hợp lệ (tự động refresh nếu cần )
                const token = await getValidToken();
                if (!token) {
                    setError('Please login again to view statistics');
                    setLoading(false);
                    return;
                }

                const response = await getStatistics();
                console.log('API Response:', response);

                if (response.code === 200 && response.data) {
                    const transformedStats = {
                        facebook: { views: 0, likes: 0, comments: 0, shares: 0 },
                        youtube: {
                            views: response.data.summary.total_views || 0,
                            likes: response.data.summary.total_likes || 0,
                            comments: response.data.statistics.reduce((sum, video) => sum + (video.commentCount || 0), 0),
                            shares: 0
                        },
                        tiktok: { views: 0, likes: 0, comments: 0, shares: 0 },
                    };

                    setStatistics(transformedStats);
                    setError(null);
                } else {
                    setError('Failed to load statistics');
                }
            } catch (err) {
                console.error('Error:', err);
                if (err.message.includes('Authentication failed') || err.message.includes('401')) {
                    setError('Please login again to view statistics');
                } else {
                    setError('Error fetching statistics: ' + err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, [isAuthenticated, getValidToken]);

    const renderPlatformStats = (platform, icon, stats) => (
        <div className="bg-white p-6 shadow rounded-lg text-center">
            <div className="text-4xl text-purple-600 mb-4">{icon}</div>
            <h3 className="text-xl font-semibold">{platform}</h3>
            <div className="text-left mt-4">
                <p>Views: <span className="font-bold">{stats.views.toLocaleString()}</span></p>
                <p>Likes: <span className="font-bold">{stats.likes.toLocaleString()}</span></p>
                <p>Comments: <span className="font-bold">{stats.comments.toLocaleString()}</span></p>
                <p>Shares: <span className="font-bold">{stats.shares.toLocaleString()}</span></p>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="statistics-container bg-gray-100 p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="text-xl">Loading statistics...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="statistics-container bg-gray-100 p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="text-xl text-red-600">Error: {error}</div>
                </div>
            </div>
        );
    }

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