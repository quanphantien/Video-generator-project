import React, { useState, useEffect } from 'react';
import { FaYoutube, FaUnlink } from 'react-icons/fa';
import { youtubeService } from './serviceYoutube';

const ConnectYoutube = () => {
    const [connected, setConnected] = useState(false);
    const [channelInfo, setChannelInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        if (youtubeService.isConnected()) {
            try {
                setLoading(true);
                const info = await youtubeService.getChannelInfo();
                setChannelInfo(info);
                setConnected(true);
            } catch (error) {
                console.error('Error checking connection:', error);
                setConnected(false);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleConnect = async () => {
        try {
            setLoading(true);
            const result = await youtubeService.connectYouTube();

            if (result.success) {
                setConnected(true);
                await checkConnection();
                alert('Kết nối YouTube thành công!');
            } else {
                alert('Lỗi kết nối: ' + result.error);
            }
        } catch (error) {
            alert('Lỗi kết nối YouTube: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = () => {
        if (window.confirm('Bạn có chắc muốn ngắt kết nối YouTube?')) {
            youtubeService.disconnect();
            setConnected(false);
            setChannelInfo(null);
            alert('Đã ngắt kết nối YouTube!');
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center gap-3 mb-4">
                    <FaYoutube className="text-red-500 text-2xl" />
                    <h3 className="text-lg font-semibold">YouTube Integration</h3>
                </div>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
                <FaYoutube className="text-red-500 text-2xl" />
                <h3 className="text-lg font-semibold">YouTube Integration</h3>
            </div>

            {connected && channelInfo ? (
                <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <p className="text-green-800 font-medium">✅ Đã kết nối thành công!</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {channelInfo.thumbnail && (
                            <img
                                src={channelInfo.thumbnail}
                                alt="Channel"
                                className="w-10 h-10 rounded-full"
                            />
                        )}
                        <div>
                            <p className="font-medium">{channelInfo.title}</p>
                            <p className="text-sm text-gray-600">
                                {Number(channelInfo.subscriberCount).toLocaleString()} subscribers
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-600">Tổng video</p>
                            <p className="font-medium">{channelInfo.videoCount}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Tổng lượt xem</p>
                            <p className="font-medium">{Number(channelInfo.viewCount).toLocaleString()}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleDisconnect}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                        <FaUnlink />
                        Ngắt kết nối
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Kết nối với YouTube để quản lý video và xem thống kê channel.
                    </p>

                    <button
                        onClick={handleConnect}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
                    >
                        <FaYoutube />
                        {loading ? 'Đang kết nối...' : 'Kết nối YouTube'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ConnectYoutube;