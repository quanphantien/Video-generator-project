const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Utility function để handle API requests
const apiRequest = async (endpoint, options = {}) => {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        const response = await fetch(url, config);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
};

// Video API endpoints
export const videoAPI = {
    getAllVideos: async () => {
        return apiRequest('/video');
    },

    getVideoById: async (videoId) => {
        return apiRequest(`/video/${videoId}`);
    },

    deleteVideo: async (videoId) => {
        return apiRequest(`/video/${videoId}`, {
            method: 'DELETE',
        });
    },

    createVideo: async (videoData) => {
        return apiRequest('/video', {
            method: 'POST',
            body: JSON.stringify(videoData),
        });
    },

    updateVideo: async (videoId, videoData) => {
        return apiRequest(`/video/${videoId}`, {
            method: 'PUT',
            body: JSON.stringify(videoData),
        });
    },
};

// Statistics API endpoints
export const statisticsAPI = {
    getUserStatistics: async () => {
        return apiRequest('/statistics/user');
    },

    getVideoStatistics: async (videoId) => {
        return apiRequest(`/statistics/video/${videoId}`);
    },
};