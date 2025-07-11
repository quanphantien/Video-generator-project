import api from './authService'; // Import axios instance đã config sẵn

// Service để chuyển đổi audio và upload
class AudioService {
  // Chuyển đổi WAV buffer sang MP3 (sử dụng Web Audio API và MediaRecorder)
  static convertWavToMp3(wavBuffer, sampleRate = 44100) {
    return new Promise((resolve, reject) => {
      try {
        // Tạo AudioContext
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Tạo AudioBuffer từ WAV data
        const audioBuffer = audioContext.createBuffer(1, wavBuffer.length, sampleRate);
        audioBuffer.copyToChannel(wavBuffer, 0);
        
        // Tạo offline context để render
        const offlineContext = new OfflineAudioContext(1, audioBuffer.length, sampleRate);
        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineContext.destination);
        source.start();
        
        // Render và chuyển đổi
        offlineContext.startRendering().then(renderedBuffer => {
          // Sử dụng MediaRecorder để encode thành WebM/MP3
          const stream = audioContext.createMediaStreamDestination();
          const mediaRecorder = new MediaRecorder(stream.stream, {
            mimeType: 'audio/webm;codecs=opus' // Fallback nếu không support MP3
          });
          
          const chunks = [];
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunks.push(event.data);
            }
          };
          
          mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            resolve(blob);
          };
          
          // Play audio through MediaStreamDestination
          const sourceNode = audioContext.createBufferSource();
          sourceNode.buffer = renderedBuffer;
          sourceNode.connect(stream);
          
          mediaRecorder.start();
          sourceNode.start();
          
          // Stop after audio finishes
          setTimeout(() => {
            mediaRecorder.stop();
          }, (renderedBuffer.duration * 1000) + 100);
          
        }).catch(reject);
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  // Chuyển đổi audio blob đơn giản hơn - chỉ convert format
  static async convertAudioToMp3(audioBlob) {
    return new Promise((resolve, reject) => {
      try {
        // Nếu browser không support MP3 encoding, return original blob
        // hoặc convert sang format khác
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target.result;
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            // Sử dụng MediaRecorder để encode lại
            const stream = audioContext.createMediaStreamDestination();
            const mediaRecorder = new MediaRecorder(stream.stream, {
              mimeType: 'audio/webm;codecs=opus'
            });
            
            const chunks = [];
            mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                chunks.push(event.data);
              }
            };
            
            mediaRecorder.onstop = () => {
              const compressedBlob = new Blob(chunks, { type: 'audio/webm' });
              resolve(compressedBlob);
            };
            
            // Create source and play through MediaStreamDestination
            const sourceNode = audioContext.createBufferSource();
            sourceNode.buffer = audioBuffer;
            sourceNode.connect(stream);
            
            mediaRecorder.start();
            sourceNode.start();
            
            // Stop recording after audio duration
            setTimeout(() => {
              mediaRecorder.stop();
            }, (audioBuffer.duration * 1000) + 100);
            
          } catch (error) {
            // Fallback: return original blob if conversion fails
            console.warn('Audio conversion failed, using original:', error);
            resolve(audioBlob);
          }
        };
        
        reader.onerror = () => {
          // Fallback: return original blob
          resolve(audioBlob);
        };
        
        reader.readAsArrayBuffer(audioBlob);
        
      } catch (error) {
        // Fallback: return original blob
        console.warn('Audio conversion not supported, using original:', error);
        resolve(audioBlob);
      }
    });
  }
  
  // Upload audio lên server
  static async uploadAudio(audioBlob, filename = 'recording.wav') {
    const formData = new FormData();
    formData.append('file', audioBlob, filename);
    
    try {
      const response = await api.post('/audio/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
      
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }
  
  // Chuyển đổi và upload (frontend processing)
  static async convertAndUpload(wavBlob, filename = 'recording') {
    try {
      // Thử chuyển đổi audio
      const convertedBlob = await this.convertAudioToMp3(wavBlob);
      
      // Xác định filename và extension
      const finalFilename = convertedBlob.type.includes('webm') ? 
        `${filename}.webm` : `${filename}.mp3`;
      
      // Upload converted audio
      const result = await this.uploadAudio(convertedBlob, finalFilename);
      
      // Tính toán compression ratio
      const compressionRatio = convertedBlob.size < wavBlob.size ? 
        ((wavBlob.size - convertedBlob.size) / wavBlob.size * 100).toFixed(2) : '0';
      
      return {
        success: true,
        data: result,
        convertedBlob: convertedBlob,
        originalSize: wavBlob.size,
        compressedSize: convertedBlob.size,
        compressionRatio: compressionRatio,
        format: convertedBlob.type.includes('webm') ? 'webm' : 'mp3'
      };
      
    } catch (error) {
      console.error('Convert and upload error:', error);
      
      // Fallback: upload original WAV file
      console.log('🔄 Fallback: Uploading original WAV file...');
      try {
        const result = await this.uploadAudio(wavBlob, `${filename}.wav`);
        return {
          success: true,
          data: result,
          convertedBlob: wavBlob,
          originalSize: wavBlob.size,
          compressedSize: wavBlob.size,
          compressionRatio: '0',
          format: 'wav',
          note: 'Conversion failed, uploaded original WAV'
        };
      } catch (uploadError) {
        console.error('Both conversion and upload failed:', uploadError);
        throw uploadError;
      }
    }
  }
  
  // API tổng hợp: Upload → Convert → Cloud trong một lần gọi
  static async uploadForServerConversion(audioBlob, filename = 'recording.webm') {
    const formData = new FormData();
    formData.append('file', audioBlob, filename);
    
    try {
      console.log('📤 Uploading audio for processing:', filename);
      
      // Sử dụng API tổng hợp mới
      const response = await api.post('/audio/process-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30s timeout cho conversion
      });
      
      console.log('✅ Audio processing completed:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Audio processing failed:', error);
      
      // Enhanced error handling
      if (error.response?.status === 413) {
        throw new Error('File quá lớn. Vui lòng thử file nhỏ hơn.');
      } else if (error.response?.status === 500) {
        throw new Error('Lỗi server khi xử lý audio. Vui lòng thử lại.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout - file quá lớn hoặc mạng chậm.');
      } else {
        throw new Error(error.response?.data?.detail || error.message || 'Lỗi không xác định');
      }
    }
  }
  
  // Legacy method - giữ lại cho compatibility
  static async convertAndUpload(audioBlob, filename = 'recording') {
    return this.uploadForServerConversion(audioBlob, `${filename}.webm`);
  }
}

export default AudioService;
