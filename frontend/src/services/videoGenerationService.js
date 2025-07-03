import api from './authService';

export const videoGenerationService = {
  // Lấy xu hướng từ Google/AI
  getTrends: async (keyword = '', count = 10) => {
    try {
      const params = { count };
      if (keyword && keyword.trim()) {
        params.keyword = keyword.trim();
      }
      
      const response = await api.get('/trends', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching trends:', error);
      throw error.response?.data || error.message;
    }
  },

  // Lấy xu hướng YouTube
  getYoutubeTrends: async () => {
    try {
      const response = await api.get('/go-trends/youtube-trending');
      return response.data;
    } catch (error) {
      console.error('Error fetching YouTube trends:', error);
      throw error.response?.data || error.message;
    }
  },

  // Tạo kịch bản
  generateScript: async (scriptData) => {
    try {
      const response = await api.post('/script/generate', scriptData);
      return response.data;
    } catch (error) {
      console.error('Error generating script:', error);
      throw error.response?.data || error.message;
    }
  }
};

export default videoGenerationService;
