import React, { useState, useEffect } from 'react';
import './VidListYoutube.css';
import { youtubeService } from '../ConnectYoutube/serviceYoutube';
import { FaPlay, FaEye, FaCalendarAlt, FaSyncAlt, FaYoutube } from 'react-icons/fa';

const VidListYoutube = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [channelInfo, setChannelInfo] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        setIsConnected(youtubeService.isConnected());
        if (youtubeService.isConnected()) {
            fetchChannelVideos();
        }
    }, []);

    const fetchChannelVideos = async () => {
        try {
            setLoading(true);
            setError(null);

            // Lấy thông tin kênh
            const channelData = await youtubeService.getChannelInfo();
            setChannelInfo(channelData);

            // Lấy danh sách video từ kênh
            const videosData = await youtubeService.getChannelVideos();
            setVideos(videosData);

        } catch (err) {
            console.error('Error fetching YouTube videos:', err);
            setError('Không thể tải danh sách video từ YouTube. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const formatViewCount = (count) => {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K';
        }
        return count.toString();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleVideoClick = (videoId) => {
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        window.open(videoUrl, '_blank');
    };

    if (!isConnected) {
        return (
            <div className="youtube-video-list">
                <div className="not-connected-message">
                    <FaYoutube className="youtube-icon" />
                    <h3>Chưa kết nối YouTube</h3>
                    <p>Vui lòng kết nối tài khoản YouTube để xem danh sách video</p>
                </div>
            </div>
        );
    }

    return (
        <div className="youtube-video-list">
            <div className="youtube-header">
                <div className="header-content">
                    <FaYoutube className="youtube-icon" />
                    <div className="header-info">
                        <h2>Video YouTube</h2>
                        {channelInfo && (
                            <p>Kênh: {channelInfo.title} ({channelInfo.subscriberCount} subscribers)</p>
                        )}
                    </div>
                </div>
                <button
                    onClick={fetchChannelVideos}
                    className="refresh-button"
                    disabled={loading}
                >
                    <FaSyncAlt className={loading ? 'spinning' : ''} />
                    Làm mới
                </button>
            </div>

            {loading && (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải video từ YouTube...</p>
                </div>
            )}

            {error && (
                <div className="error-state">
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && videos.length === 0 && (
                <div className="empty-state">
                    <FaYoutube className="empty-icon" />
                    <h3>Chưa có video nào</h3>
                    <p>Kênh YouTube của bạn chưa có video hoặc tất cả video đều ở chế độ riêng tư</p>
                </div>
            )}

            {!loading && !error && videos.length > 0 && (
                <div className="videos-grid">
                    {videos.map((video) => (
                        <div
                            key={video.id}
                            className="video-card"
                            onClick={() => handleVideoClick(video.id)}
                        >
                            <div className="video-thumbnail">
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    loading="lazy"
                                />
                                <div className="play-overlay">
                                    <FaPlay className="play-icon" />
                                </div>
                                {video.duration && (
                                    <div className="video-duration">
                                        {video.duration}
                                    </div>
                                )}
                            </div>

                            <div className="video-info">
                                <h3 className="video-title" title={video.title}>
                                    {video.title}
                                </h3>

                                <div className="video-stats">
                                    <div className="stat-item">
                                        <FaEye className="stat-icon" />
                                        <span>{formatViewCount(video.viewCount)} lượt xem</span>
                                    </div>

                                    <div className="stat-item">
                                        <FaCalendarAlt className="stat-icon" />
                                        <span>{formatDate(video.publishedAt)}</span>
                                    </div>
                                </div>

                                {video.description && (
                                    <p className="video-description">
                                        {video.description.substring(0, 100)}
                                        {video.description.length > 100 && '...'}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VidListYoutube;