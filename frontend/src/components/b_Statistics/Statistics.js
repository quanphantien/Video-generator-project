import React, { useState, useEffect } from "react";
import { FaFacebook, FaYoutube, FaTiktok } from "react-icons/fa";
import { getStatistics } from "../../services/api";
import { useAuth } from "../../context/authContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./Statistics.css";

const StatisticsPage = () => {
  const { isAuthenticated, getValidToken } = useAuth();
  const [statisticsSummary, setStatisticsSummary] = useState(null);
  const [videoStats, setVideoStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // VideoCard component
  const VideoCard = ({ video }) => {
    const handleYouTubeClick = () => {
      if (video.video_youtube_id) {
        window.open(`https://www.youtube.com/watch?v=${video.video_youtube_id}`, '_blank');
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 mr-2">
            <h3 className="font-semibold text-gray-800 text-sm truncate">
              {video.title || 'Untitled Video'}
            </h3>
            {video.video_youtube_id && (
              <p className="text-xs text-gray-500 font-mono bg-gray-100 px-1 rounded mt-1">
                {video.video_youtube_id}
              </p>
            )}
          </div>
          {video.video_youtube_id && (
            <button
              onClick={handleYouTubeClick}
              className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded text-xs hover:bg-red-200 transition-colors"
            >
              <FaYoutube className="text-xs" />
              YouTube
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-xs text-blue-600 font-medium">Lượt xem</div>
            <div className="text-sm font-bold text-blue-800">
              {video.viewCount?.toLocaleString() || 0}
            </div>
          </div>
          <div className="bg-green-50 p-2 rounded">
            <div className="text-xs text-green-600 font-medium">Lượt thích</div>
            <div className="text-sm font-bold text-green-800">
              {video.likeCount?.toLocaleString() || 0}
            </div>
          </div>
          <div className="bg-yellow-50 p-2 rounded">
            <div className="text-xs text-yellow-600 font-medium">Bình luận</div>
            <div className="text-sm font-bold text-yellow-800">
              {video.commentCount?.toLocaleString() || 0}
            </div>
          </div>
        </div>

        {video.publishedAt && (
          <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
            Đăng: {new Date(video.publishedAt).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);

        if (!isAuthenticated) {
          setError("Please login to view statistics");
          setLoading(false);
          return;
        }

        const token = await getValidToken();
        if (!token) {
          setError("Please login again to view statistics");
          setLoading(false);
          return;
        }

        const response = await getStatistics();
        console.log("API Response:", response);

        if (response.code === 200) {
          // Kiểm tra xem data có tồn tại không
          const responseData = response.data;
          
          if (!responseData) {
            console.warn("API returned success but data is null/undefined");
            // Set default empty data khi data null
            setStatisticsSummary({
              facebook: { views: 0, likes: 0, comments: 0, shares: 0 },
              youtube: { views: 0, likes: 0, comments: 0, shares: 0 },
              tiktok: { views: 0, likes: 0, comments: 0, shares: 0 },
            });
            setVideoStats([]);
            setError(null);
            return;
          }

          // Sửa lại để lấy đúng cấu trúc từ API response
          const summary = responseData.summary;
          const videoStatistics = responseData.statistics; // Trực tiếp từ responseData, không phải responseData.data

          // Xử lý trường hợp summary hoặc statistics có thể null
          const youtubeSummary = {
            views: summary?.total_views || 0,
            likes: summary?.total_likes || 0,
            comments: Array.isArray(videoStatistics) 
              ? videoStatistics.reduce((sum, v) => sum + (v?.commentCount || 0), 0)
              : 0,
            shares: 0,
          };

          setStatisticsSummary({
            facebook: { views: 0, likes: 0, comments: 0, shares: 0 },
            youtube: youtubeSummary,
            tiktok: { views: 0, likes: 0, comments: 0, shares: 0 },
          });

          // Đảm bảo videoStatistics là array trước khi set
          const processedVideoStats = Array.isArray(videoStatistics) ? videoStatistics : [];
          console.log("Processed video stats:", processedVideoStats);
          
          // Log từng video để kiểm tra cấu trúc
          processedVideoStats.forEach((video, index) => {
            console.log(`Video ${index}:`, {
              title: video?.title,
              video_youtube_id: video?.video_youtube_id,
              viewCount: video?.viewCount,
              likeCount: video?.likeCount,
              commentCount: video?.commentCount
            });
          });
          
          setVideoStats(processedVideoStats);
          setError(null);
        } else {
          setError("Failed to load statistics");
        }
      } catch (err) {
        console.error("Error:", err);
        if (
          err.message.includes("Authentication failed") ||
          err.message.includes("401")
        ) {
          setError("Please login again to view statistics");
        } else {
          setError("Error fetching statistics: " + err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [isAuthenticated, getValidToken]);

  const renderPlatformStats = (platform, icon, stats) => {
    // Đảm bảo stats luôn có giá trị mặc định
    const safeStats = {
      views: stats?.views || 0,
      likes: stats?.likes || 0,
      comments: stats?.comments || 0,
      shares: stats?.shares || 0,
    };

    return (
      <div className="bg-white p-6 shadow rounded-lg text-center">
        <div className="text-4xl text-purple-600 mb-4">{icon}</div>
        <h3 className="text-xl font-semibold">{platform}</h3>
        <div className="text-left mt-4">
          <p>
            Views:{" "}
            <span className="font-bold">{safeStats.views.toLocaleString()}</span>
          </p>
          <p>
            Likes:{" "}
            <span className="font-bold">{safeStats.likes.toLocaleString()}</span>
          </p>
          <p>
            Comments:{" "}
            <span className="font-bold">{safeStats.comments.toLocaleString()}</span>
          </p>
          <p>
            Shares:{" "}
            <span className="font-bold">{safeStats.shares.toLocaleString()}</span>
          </p>
        </div>
      </div>
    );
  };

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
            <p className="text-gray-600">
              Overview of engagement metrics across platforms
            </p>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      {statisticsSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderPlatformStats(
            "Facebook",
            <FaFacebook />,
            statisticsSummary.facebook
          )}
          {renderPlatformStats(
            "YouTube",
            <FaYoutube />,
            statisticsSummary.youtube
          )}
          {renderPlatformStats("TikTok", <FaTiktok />, statisticsSummary.tiktok)}
        </div>
      ) : (
        <div className="bg-white p-6 shadow rounded-lg text-center">
          <p className="text-gray-500">Không có dữ liệu thống kê</p>
        </div>
      )}

      {/* Video Chart Section */}
      {videoStats && videoStats.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg shadow-sm mt-6">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Thống kê từng video</h2>
              {videoStats.some(v => v.video_youtube_id) && (
                <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded">
                  <FaYoutube className="inline mr-1" />
                  {videoStats.filter(v => v.video_youtube_id).length} on YouTube
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-1">
              Biểu đồ lượt xem, lượt thích và bình luận của từng video
              {videoStats.some(v => v.video_youtube_id) && (
                <span className="text-red-600"> • Xem cards bên dưới để truy cập YouTube</span>
              )}
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={videoStats.map((video, index) => ({
                ...video,
                displayTitle: (() => {
                  const title = video?.title || 'Untitled';
                  const shortId = video.video_youtube_id ? `(${video.video_youtube_id.slice(-4)})` : '';
                  const fullTitle = `${title}${shortId}`;
                  return fullTitle.length > 15 ? fullTitle.slice(0, 15) + "..." : fullTitle;
                })(),
                uniqueKey: `${video.video_id || index}_${video.video_youtube_id || 'no-yt'}`,
                hasYouTube: !!video.video_youtube_id
              }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis 
                dataKey="displayTitle"
                tick={{
                  fontSize: 12,
                  fill: '#374151'
                }}
              />
              <YAxis />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;

                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg min-w-[200px]">
                        <div className="mb-2">
                          <p className="font-semibold text-gray-800 text-sm">
                            {data.title || label}
                          </p>
                          
                          {data.publishedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(data.publishedAt).toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                        <div className="text-sm space-y-1 border-t pt-2">
                          <div className="flex justify-between items-center">
                            <span style={{ color: '#8884d8' }}>Lượt xem:</span>
                            <span className="font-semibold">{data.viewCount?.toLocaleString() || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span style={{ color: '#82ca9d' }}>Lượt thích:</span>
                            <span className="font-semibold">{data.likeCount?.toLocaleString() || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span style={{ color: '#ffc658' }}>Bình luận:</span>
                            <span className="font-semibold">{data.commentCount?.toLocaleString() || 0}</span>
                          </div>
                        </div>
                        {data.video_youtube_id && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                              <FaYoutube /> Có trên YouTube
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="viewCount" 
                fill="#8884d8" 
                name="Lượt xem"
              />
              <Bar 
                dataKey="likeCount" 
                fill="#82ca9d" 
                name="Lượt thích"
              />
              <Bar 
                dataKey="commentCount" 
                fill="#ffc658" 
                name="Bình luận"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Video Cards Section */}
      {videoStats && videoStats.length > 0 && (
        <div className="mt-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Video Details</h2>
            <p className="text-gray-600 text-sm">
              Thông tin chi tiết và liên kết YouTube cho từng video
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videoStats.map((video, index) => (
              <VideoCard key={video.video_id || index} video={video} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State for Video Stats */}
      {(!videoStats || videoStats.length === 0) && statisticsSummary && (
        <div className="bg-white p-6 shadow rounded-lg text-center mt-6">
          <p className="text-gray-500">Chưa có dữ liệu video để hiển thị biểu đồ</p>
        </div>
      )}
    </div>
  );
};

export default StatisticsPage;
