const API_BASE_URL = 'http://127.0.0.1:8000';

// Import auth context để lấy tokenn
let authContext = null;

export const setAuthContext = (context) => {
    authContext = context;
};

const apiRequest = async (endpoint, options = {}) => {
    try {
        let token = localStorage.getItem('token') || localStorage.getItem('accessToken');

        // Nếu có authContext, sử dụng getValidToken để tự động refresh
        if (authContext && authContext.getValidToken) {
            token = await authContext.getValidToken();
        }

        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers,
            },
            ...options,
        };

        const response = await fetch(url, config);

        if (!response.ok) {
            if (response.status === 401) {
                if (authContext && authContext.logout) {
                    authContext.logout();
                }
                throw new Error('Authentication failed. Please login again.');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
};

export const getStatistics = async () => {
    try {
        const token = localStorage.getItem('token');
        console.log('Token:', token ? 'exists' : 'not found');
        console.log('API URL:', `${API_BASE_URL}/statistics/summary`);

        return await apiRequest('/statistics/summary');
    } catch (error) {
        console.error('Error fetching statistics:', error);
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
    getSummary: async () => {
        return apiRequest('/statistics/summary');
    },

    // getUserStatistics: async () => {
    //     return apiRequest('/statistics/user');
    // },

    // getVideoStatistics: async (videoId) => {
    //     return apiRequest(`/statistics/video/${videoId}`);
    // },
};

// Cá nhân hóa người dùng
export const styleService = {
  addStyle: async (styleData) => {
    return apiRequest('/style', {
      method: 'POST',
      body: JSON.stringify(styleData),
    });
  }
};
