import axios from 'axios';

// Instantiate standard axios client pointing to FastAPI
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds synthesis timeout (synthesis might take a while on slower CPUs)
});

export const ttsApi = {
  /**
   * Retrieves all available voice profiles from the backend.
   */
  async getVoices() {
    const response = await apiClient.get('/voices');
    return response.data;
  },

  /**
   * Triggers the TTS generation pipeline.
   * @param {string} text - The input characters to synthesize.
   * @param {string} voiceId - Unique voice profile identifier.
   */
  async generateAudio(text, voiceId) {
    const response = await apiClient.post('/generate-audio', {
      text,
      voice_id: voiceId,
    });
    return response.data;
  }
};

export default ttsApi;
