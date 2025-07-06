import api from './authService';

export const mediaGenerationService = {
  // Generate TTS for text
  generateTTS: async (text, voice) => {
    try {
      const response = await api.post('/tts/generate', {
        text: text,
        voice: voice
      });
      return response.data;
    } catch (error) {
      console.error('Error generating TTS:', error);
      throw error.response?.data || error.message;
    }
  },

  // Generate image from prompt
  generateImage: async (prompt, modelCode) => {
    try {
      const response = await api.post('/image/generate', {
        prompt: prompt,
        modelCode: modelCode
      });
      return response.data;
    } catch (error) {
      console.error('Error generating image:', error);
      throw error.response?.data || error.message;
    }
  },

  // Generate final video
  generateVideo: async (script, videoName, audioUrls, imageUrls, minDurationPerPicture = 2) => {
    try {
      const response = await api.post('/video/generate', {
        script: script,
        video_name: videoName,
        audio_url: audioUrls,
        images_url: imageUrls,
        min_duration_per_picture: minDurationPerPicture
      });
      return response.data;
    } catch (error) {
      console.error('Error generating video:', error);
      throw error.response?.data || error.message;
    }
  }
};

export default mediaGenerationService;
