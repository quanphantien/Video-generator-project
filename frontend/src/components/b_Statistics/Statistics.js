import React, { useState, useEffect } from "react";
import { FaFacebook, FaYoutube, FaTiktok } from "react-icons/fa";
import "./Statistics.css";

const StatisticsPage = () => {
  const [statistics, setStatistics] = useState({
    facebook: { views: 0, likes: 0, comments: 0, shares: 0 },
    youtube: { views: 0, likes: 0, comments: 0, shares: 0 },
    tiktok: { views: 0, likes: 0, comments: 0, shares: 0 },
  });

  const [videoDetails, setVideoDetails] = useState({
    facebook: [],
    youtube: [],
    tiktok: [],
  });

  const [currentPage, setCurrentPage] = useState({
    facebook: 0,
    youtube: 0,
    tiktok: 0,
  });

  const [searchKeyword, setSearchKeyword] = useState({
    facebook: "",
    youtube: "",
    tiktok: "",
  });

  const [itemsPerPage, setItemsPerPage] = useState(2);

  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      if (width >= 1024) setItemsPerPage(3);
      else if (width >= 768) setItemsPerPage(2);
      else setItemsPerPage(1);
    };
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  useEffect(() => {
    const mockStatistics = {
      facebook: { views: 12000, likes: 800, comments: 150, shares: 50 },
      youtube: { views: 25000, likes: 2000, comments: 300, shares: 100 },
      tiktok: { views: 18000, likes: 1200, comments: 250, shares: 80 },
    };

    const mockVideoDetails = {
      facebook: [
        {
          id: 1,
          title: "FB Video 1",
          thumbnail: "https://via.placeholder.com/150x90.png?text=FB+1",
          views: 3000,
          likes: 200,
          comments: 40,
          shares: 10,
          link: "https://facebook.com/video1",
        },
        {
          id: 2,
          title: "FB Video 2",
          thumbnail: "https://via.placeholder.com/150x90.png?text=FB+2",
          views: 4000,
          likes: 300,
          comments: 50,
          shares: 20,
          link: "https://facebook.com/video2",
        },
        {
          id: 3,
          title: "FB Video 3",
          thumbnail: "https://via.placeholder.com/150x90.png?text=FB+3",
          views: 5000,
          likes: 400,
          comments: 70,
          shares: 30,
          link: "https://facebook.com/video3",
        },
        {
          id: 4,
          title: "FB Video 4",
          thumbnail: "https://via.placeholder.com/150x90.png?text=FB+4",
          views: 5000,
          likes: 400,
          comments: 70,
          shares: 30,
          link: "https://facebook.com/video4",
        },
        {
          id: 5,
          title: "FB Video 5",
          thumbnail: "https://via.placeholder.com/150x90.png?text=FB+5",
          views: 5000,
          likes: 400,
          comments: 70,
          shares: 30,
          link: "https://facebook.com/video5",
        },
      ],
      youtube: [
        {
          id: 1,
          title: "YT Video 1",
          thumbnail: "https://via.placeholder.com/150x90.png?text=YT+1",
          views: 10000,
          likes: 800,
          comments: 120,
          shares: 50,
          link: "https://youtube.com/watch?v=video1",
        },
        {
          id: 2,
          title: "YT Video 2",
          thumbnail: "https://via.placeholder.com/150x90.png?text=YT+2",
          views: 15000,
          likes: 1200,
          comments: 180,
          shares: 60,
          link: "https://youtube.com/watch?v=video2",
        },
      ],
      tiktok: [
        {
          id: 1,
          title: "TT Video 1",
          thumbnail: "https://via.placeholder.com/150x90.png?text=TT+1",
          views: 7000,
          likes: 500,
          comments: 80,
          shares: 30,
          link: "https://tiktok.com/@user/video1",
        },
        {
          id: 2,
          title: "TT Video 2",
          thumbnail: "https://via.placeholder.com/150x90.png?text=TT+2",
          views: 11000,
          likes: 700,
          comments: 170,
          shares: 50,
          link: "https://tiktok.com/@user/video2",
        },
      ],
    };

    setStatistics(mockStatistics);
    setVideoDetails(mockVideoDetails);
  }, []);

  const handleSearchChange = (platform, value) => {
    setSearchKeyword((prev) => ({
      ...prev,
      [platform]: value,
    }));
    setCurrentPage((prev) => ({
      ...prev,
      [platform]: 0,
    }));
  };

  const handlePageChange = (platform, pageIndex) => {
    setCurrentPage((prev) => ({
      ...prev,
      [platform]: pageIndex,
    }));
  };

  const renderVideoList = (platform, videos) => {
    const keyword = searchKeyword[platform].toLowerCase();
    const filtered = videos.filter((video) =>
      video.title.toLowerCase().includes(keyword)
    );
    const page = currentPage[platform];
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const start = page * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedVideos = filtered.slice(start, end);

    return (
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
          <h3 className="text-lg font-semibold capitalize">{platform} Videos</h3>
          <input
            type="text"
            placeholder="Search..."
            className="border p-1 rounded"
            value={searchKeyword[platform]}
            onChange={(e) => handleSearchChange(platform, e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {paginatedVideos.map((video) => (
              <a
                key={video.id}
                href={video.link}
                target="_blank"
                rel="noopener noreferrer"
                className="video-card bg-white rounded shadow p-4 hover:shadow-lg transition"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-32 object-cover rounded"
                />
                <div className="mt-2">
                  <h4 className="font-semibold text-base">{video.title}</h4>
                  <p className="text-sm text-gray-600">
                    Views: <span className="font-bold">{video.views}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Likes: <span className="font-bold">{video.likes}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Comments: <span className="font-bold">{video.comments}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Shares: <span className="font-bold">{video.shares}</span>
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {totalPages >= 1 && (
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              onClick={() => handlePageChange(platform, Math.max(0, page - 1))}
              disabled={page === 0}
              className={`px-4 py-1 rounded text-sm font-semibold ${
                page === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-purple-500 text-white hover:bg-purple-600"
              }`}
            >
              &lt; Prev
            </button>

            <span className="text-sm text-gray-600">
              Page {page + 1} of {totalPages}
            </span>

            <button
              onClick={() =>
                handlePageChange(platform, Math.min(totalPages - 1, page + 1))
              }
              disabled={page >= totalPages - 1}
              className={`px-4 py-1 rounded text-sm font-semibold ${
                page >= totalPages - 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-purple-500 text-white hover:bg-purple-600"
              }`}
            >
              Next &gt;
            </button>
          </div>
        )}
      </div>
    );
  };

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
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="flex items-baseline gap-2">
          <h1 className="text-3xl font-bold text-purple-600">Statistics</h1>
          <p className="text-gray-600">
            Overview of engagement metrics across platforms
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderPlatformStats("Facebook", <FaFacebook />, statistics.facebook)}
        {renderPlatformStats("YouTube", <FaYoutube />, statistics.youtube)}
        {renderPlatformStats("TikTok", <FaTiktok />, statistics.tiktok)}
      </div>

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

        {renderVideoList("facebook", videoDetails.facebook)}
        {renderVideoList("youtube", videoDetails.youtube)}
        {renderVideoList("tiktok", videoDetails.tiktok)}
      </div>
    </div>
  );
};

export default StatisticsPage;
