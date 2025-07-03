import { useState, useEffect } from 'react';
import { videoAPI, statisticsAPI } from '../services/api';

export const useDashboard = () => {
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch projects từ API
    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const result = await videoAPI.getAllVideos();
            
            if (result.code === 200 && result.data) {
                // Transform API data to match our project structure
                const transformedProjects = result.data.map(video => ({
                    id: video.video_id,
                    name: video.name,
                    status: "Completed",
                    videoUrl: video.video_url,
                    thumbnail: video.thumbnail_url || "/placeholder-thumbnail.jpg",
                    createdAt: new Date().toLocaleDateString(),
                    views: Math.floor(Math.random() * 20000), // Mock data
                    platform: "YouTube", // Mock data
                    type: "video"
                }));

                setProjects(transformedProjects);
                
                // Cập nhật statistics
                const totalViews = transformedProjects.reduce((acc, project) => acc + project.views, 0);
                setStatistics(prev => ({
                    ...prev,
                    totalProjects: transformedProjects.length,
                    totalViews: totalViews
                }));

                // Fetch statistics nếu có API
                await fetchStatistics();
            }
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError('Không thể tải danh sách project. Vui lòng thử lại.');
            
            // Fallback to mock data
            const mockProjects = [
                { 
                    id: 1, 
                    name: "AI Video Tutorial", 
                    status: "Completed", 
                    views: 12000, 
                    platform: "YouTube",
                    type: "video",
                    thumbnail: "/placeholder-thumbnail.jpg",
                    createdAt: "2025-01-15"
                },
                { 
                    id: 2, 
                    name: "Product Demo", 
                    status: "In Progress", 
                    views: 8000, 
                    platform: "Facebook",
                    type: "video",
                    thumbnail: "/placeholder-thumbnail.jpg",
                    createdAt: "2025-01-20"
                },
                { 
                    id: 3, 
                    name: "Marketing Campaign", 
                    status: "Planning", 
                    views: 15000, 
                    platform: "TikTok",
                    type: "video",
                    thumbnail: "/placeholder-thumbnail.jpg",
                    createdAt: "2025-01-25"
                },
                { 
                    id: 4, 
                    name: "Brand Story", 
                    status: "Completed", 
                    views: 9500, 
                    platform: "YouTube",
                    type: "video",
                    thumbnail: "/placeholder-thumbnail.jpg",
                    createdAt: "2025-01-10"
                }
            ];
            
            setProjects(mockProjects);
            setStatistics({
                totalProjects: mockProjects.length,
                totalViews: mockProjects.reduce((acc, project) => acc + project.views, 0),
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
                setStatistics(prev => ({
                    ...prev,
                    // Cập nhật các field statistics từ API
                }));
            }
        } catch (err) {
            console.warn('Could not fetch statistics:', err);
        }
    };

    // Handle delete project
    const deleteProject = async (projectId) => {
        try {
            await videoAPI.deleteVideo(projectId);
            setProjects(prev => prev.filter(p => p.id !== projectId));
            return { success: true };
        } catch (error) {
            console.error('Error deleting project:', error);
            return { success: false, error: 'Có lỗi xảy ra khi xóa project.' };
        }
    };

    // Handle play video
    const playVideo = (project) => {
        if (project.videoUrl) {
            window.open(project.videoUrl, '_blank');
        }
    };

    // Handle edit project
    const editProject = (projectId) => {
        window.open(`/edit/${projectId}`, '_blank');
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    return {
        projects,
        statistics,
        loading,
        error,
        fetchProjects,
        deleteProject,
        playVideo,
        editProject
    };
};
