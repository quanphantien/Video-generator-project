import CreativeEditorSDK from '@cesdk/cesdk-js';
import { useEffect, useRef, useState } from 'react';
import api from '../services/authService';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Mic, MicOff, Play, Pause, Trash2, Plus, ChevronRight, ChevronLeft, Volume2, Loader2, Mic2, X, RotateCcw, Cloud, AlertCircle, Check, Upload } from 'lucide-react';
import AudioService from '../services/AudioService';

const config = {
  license: `${process.env.REACT_APP_CREATIVE_EDITOR_SDK_KEY}`,
  userId: 'video-creator-user',
  callbacks: { onUpload: 'local' },
  theme: 'light',
  ui: {
    elements: {
      view: "default",
      panels: {
        settings: true,
        inspector: true,
        library: true,
      },
      navigation: {
        position: "left",
        action: {
          save: true,
          load: true,
          download: true,
          export: true,
        },
      },
      dock: {
        iconSize: "normal",
        hideLabels: false,
      },
    },
  },
  callbacks: {
    onUpload: "local",
    onSave: (scene) => {
      const element = document.createElement("a");
      const jsonData = JSON.stringify(scene, null, 2);
      const base64Data = btoa(unescape(encodeURIComponent(jsonData)));
      element.setAttribute(
        "href",
        `data:application/json;base64,${base64Data}`
      );
      element.setAttribute(
        "download",
        `video-project-${Date.now()}.json`
      );
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    },
    onLoad: "upload",
    onDownload: "download",
    
    onExport: (blobs, options) => {
      const blob = blobs[0];
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `exported-video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showYouTubeUploadPopup(blob);
    },
  }
};

const showYouTubeUploadPopup = (blob) => {
  // Create popup overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  // Create popup content
  const popup = document.createElement('div');
  popup.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    max-width: 500px;
    width: 90%;
    text-align: center;
    animation: popupSlideIn 0.3s ease-out;
  `;
  
  // Add animation keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes popupSlideIn {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `;
  document.head.appendChild(style);
  
  // Create popup HTML
  popup.innerHTML = `
    <div style="margin-bottom: 20px;">
      <div style="font-size: 48px; margin-bottom: 16px;">🎬</div>
      <h2 style="margin: 0 0 12px 0; color: #333; font-size: 24px; font-weight: 600;">
        Video đã xuất thành công!
      </h2>
      <p style="margin: 0; color: #666; font-size: 16px; line-height: 1.5;">
        Bạn có muốn upload video này lên YouTube không?
      </p>
    </div>
    
    <div style="margin-bottom: 24px;">
      <input 
        type="text" 
        id="videoTitle" 
        placeholder="Nhập tiêu đề video (tùy chọn)"
        style="
          width: 100%;
          padding: 12px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 16px;
          outline: none;
          transition: border-color 0.2s;
        "
      />
    </div>
    
    <div style="display: flex; gap: 12px; justify-content: center;">
      <button 
        id="uploadBtn"
        style="
          background: #ff0000;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        "
      >
        <span>📤</span>
        Upload lên YouTube
      </button>
      
      <button 
        id="cancelBtn"
        style="
          background: #6c757d;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        "
      >
        Không, cảm ơn
      </button>
    </div>
    
    <div id="uploadProgress" style="display: none; margin-top: 20px;">
      <div style="color: #666; margin-bottom: 8px;">Đang upload...</div>
      <div style="width: 100%; background: #f0f0f0; border-radius: 10px; overflow: hidden;">
        <div id="progressBar" style="
          width: 0%;
          height: 8px;
          background: linear-gradient(90deg, #ff0000, #ff4444);
          transition: width 0.3s;
        "></div>
      </div>
    </div>
  `;
  
  // Add event listeners
  const uploadBtn = popup.querySelector('#uploadBtn');
  const cancelBtn = popup.querySelector('#cancelBtn');
  const titleInput = popup.querySelector('#videoTitle');
  const uploadProgress = popup.querySelector('#uploadProgress');
  
  // Style input focus
  titleInput.addEventListener('focus', () => {
    titleInput.style.borderColor = '#ff0000';
  });
  
  titleInput.addEventListener('blur', () => {
    titleInput.style.borderColor = '#e1e5e9';
  });
  
  // Upload button click
  uploadBtn.addEventListener('click', async () => {
    const title = titleInput.value.trim() || `Video - ${new Date().toLocaleString()}`;
    
    // Show progress
    uploadProgress.style.display = 'block';
    uploadBtn.disabled = true;
    cancelBtn.disabled = true;
    uploadBtn.style.opacity = '0.6';
    uploadBtn.style.cursor = 'not-allowed';
    
    try {
      // Call the upload function
      let url = await saveVideoToYoutube(blob, title);
      
      // Success message
      popup.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
          <h2 style="margin: 0 0 12px 0; color: #28a745; font-size: 24px; font-weight: 600;">
            Upload thành công!
          </h2>
          <p style="margin: 0 0 20px 0; color: #666; font-size: 16px;">
            Video đã được upload lên YouTube thành công.
            LINK: ${url}
          </p>
          <button 
            onclick="document.body.removeChild(this.closest('.popup-overlay'))"
            style="
              background: #28a745;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
            "
          >
            Đóng
          </button>
        </div>
      `;
      
      // Auto close after 3 seconds
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }, 10000);
    } catch (error) {
      console.error('Upload failed:', error);
      
      // Error message
      popup.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
          <h2 style="margin: 0 0 12px 0; color: #dc3545; font-size: 24px; font-weight: 600;">
            Upload thất bại!
          </h2>
          <p style="margin: 0 0 20px 0; color: #666; font-size: 16px;">
            ${error.message || 'Đã có lỗi xảy ra khi upload video.'}
          </p>
          <button 
            onclick="document.body.removeChild(this.closest('.popup-overlay'))"
            style="
              background: #dc3545;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
            "
          >
            Đóng
          </button>
        </div>
      `;
    }
  });
  
  // Cancel button click
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
  
  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  });
  
  // Assemble and show popup
  overlay.appendChild(popup);
  overlay.className = 'popup-overlay';
  document.body.appendChild(overlay);
  
  // Focus on title input
  setTimeout(() => titleInput.focus(), 100);
};

export default function CreativeEditorSDKComponent() {
  const cesdk_container = useRef(null);
  const [cesdk, setCesdk] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [mainEngine, setMainEngine] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedAudios, setRecordedAudios] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mặc định là đóng
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  
  // Get video URL from query params
  const [searchParams] = useSearchParams();
  const encodedVideoUrl = searchParams.get('videoUrl');
  const videoUrl = encodedVideoUrl ? decodeURIComponent(encodedVideoUrl) : null;

  // Function to get video duration
  const getVideoDuration = (url) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        resolve(video.duration);
      };
      
      video.onerror = (error) => {
        console.error('Error loading video metadata:', error);
        reject(error);
      };
      
      video.src = url;
    });
  };

  const handleAccessToken = async (token) => {
    console.log('Access Token:', token);
  }

  // Function to start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Kiểm tra các format hỗ trợ - Ưu tiên WebM để ghi âm chất lượng cao
      const supportedFormats = [
        'audio/webm;codecs=opus', // WebM với Opus codec - chất lượng tốt nhất
        'audio/webm', // WebM fallback
        'audio/ogg;codecs=opus',
        'audio/mpeg', // MP3 backup
        'audio/mp4' // MP4 backup
      ];
      
      console.log('🎙️ Supported Audio Formats:');
      supportedFormats.forEach(format => {
        const isSupported = MediaRecorder.isTypeSupported(format);
        console.log(`- ${format}: ${isSupported ? '✅ Supported' : '❌ Not supported'}`);
      });
      
      // Chọn format tốt nhất có sẵn
      let selectedFormat = '';
      for (const format of supportedFormats) {
        if (MediaRecorder.isTypeSupported(format)) {
          selectedFormat = format;
          break;
        }
      }
      
      console.log('🎯 Selected format:', selectedFormat || 'Browser default');
      
      // Tạo MediaRecorder với format tốt nhất
      const options = selectedFormat ? { mimeType: selectedFormat } : {};
      const recorder = new MediaRecorder(stream, options);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // Giữ nguyên format WebM để có chất lượng tốt nhất
        const actualMimeType = recorder.mimeType || selectedFormat || 'audio/webm';
        const blob = new Blob(chunks, { type: actualMimeType });
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toLocaleTimeString();
        const audioId = Date.now();
        
        // Log thông tin chi tiết về file được tạo
        console.log('🎙️ Recording Details:');
        console.log('- File type (MIME):', blob.type);
        console.log('- File size:', blob.size, 'bytes');
        console.log('- File size (KB):', (blob.size / 1024).toFixed(2), 'KB');
        console.log('- MediaRecorder mimeType:', recorder.mimeType);
        console.log('- Actual format being recorded:', recorder.mimeType || 'Browser default');
        
        // Tạo audio item với trạng thái chưa upload
        const audioItem = {
          id: audioId,
          url: url,
          blob: blob,
          name: `Recording ${timestamp}`,
          timestamp: timestamp,
          status: 'recorded',
          cloudUrl: null,
          size: blob.size,
          actualFormat: actualMimeType
        };
        
        setRecordedAudios(prev => [...prev, audioItem]);
        
        // Auto upload và chuyển đổi
        try {
          const result = await AudioService.uploadForServerConversion(blob, `recording_${audioId}.webm`);
          console.log('✅ Audio processing completed:', result);
          
          // Cập nhật audio item với thông tin upload
          setRecordedAudios(prev => prev.map(audio => 
            audio.id === audioId 
              ? { 
                  ...audio, 
                  status: 'uploaded', 
                  cloudUrl: result.data.url,
                  compressionInfo: result.compressionRatio && result.compressionRatio !== '0' ? {
                    originalSize: result.originalSize,
                    compressedSize: result.compressedSize,
                    ratio: result.compressionRatio,
                    format: result.format || 'MP3'
                  } : {
                    originalSize: result.originalSize,
                    compressedSize: result.compressedSize,
                    ratio: '0',
                    format: result.format || 'MP3'
                  },
                  note: result.note || null
                } 
              : audio
          ));
          
          setUploadProgress(prev => ({ ...prev, [audioId]: 100 }));
          
          console.log('✅ Audio uploaded successfully:', result.data.url);
          
        } catch (error) {
          console.error('❌ Upload failed:', error);
          
          // Cập nhật trạng thái lỗi
          setRecordedAudios(prev => prev.map(audio => 
            audio.id === audioId 
              ? { ...audio, status: 'error', error: error.message } 
              : audio
          ));
          
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[audioId];
            return newProgress;
          });
        }
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.');
    }
  };

  // Function to stop recording
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  // Function to add recorded audio to timeline
  const addAudioToTimeline = async (audioItem) => {
    if (!cesdk || !audioItem) {
      console.error('Invalid CESDK instance or audio item');
      return;
    }

    try {
      const engine = cesdk.engine;
      const page = engine.scene.getCurrentPage();
      
      // Sử dụng cloud URL nếu có, nếu không dùng local URL
      const audioUrl = audioItem.cloudUrl || audioItem.url;
      
      // Create audio block
      const audioBlock = engine.block.create("audio");
      engine.block.appendChild(page, audioBlock);
      
      // Set audio source từ cloud hoặc local
      if (audioItem.cloudUrl) {
        // Sử dụng URL từ cloud
        engine.block.setString(audioBlock, 'audio/fileURI', audioItem.cloudUrl);
      } else {
        // Fallback: sử dụng local blob URL (có thể không hoạt động tối ưu)
        console.log('⚠️ Using local blob URL (may not work in production)');
        engine.block.setString(audioBlock, 'audio/fileURI', audioItem.url);
      }
      
    } catch (error) {
      console.error('Error adding audio to timeline:', error);
      alert('Không thể thêm audio vào timeline. Vui lòng thử lại.');
    }
  };

  // Function to delete recorded audio
  const deleteAudio = (audioId) => {
    setRecordedAudios(prev => {
      const audioToDelete = prev.find(audio => audio.id === audioId);
      if (audioToDelete) {
        URL.revokeObjectURL(audioToDelete.url);
      }
      return prev.filter(audio => audio.id !== audioId);
    });
    
    // Cleanup upload progress
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[audioId];
      return newProgress;
    });
  };
  
  // Function to retry upload
  const retryUpload = async (audioId) => {
    const audio = recordedAudios.find(a => a.id === audioId);
    if (!audio || !audio.blob) return;
    
    try {
      setUploadProgress(prev => ({ ...prev, [audioId]: 0 }));
      
      // Update status to uploading
      setRecordedAudios(prev => prev.map(a => 
        a.id === audioId ? { ...a, status: 'uploading', error: null } : a
      ));
      
      const result = await AudioService.uploadForServerConversion(audio.blob, `recording_${audioId}.webm`);
      
      setRecordedAudios(prev => prev.map(a => 
        a.id === audioId 
          ? { 
              ...a, 
              status: 'uploaded', 
              cloudUrl: result.data.url,
              compressionInfo: result.compressionRatio && result.compressionRatio !== '0' ? {
                originalSize: result.originalSize,
                compressedSize: result.compressedSize,
                ratio: result.compressionRatio,
                format: result.format || 'unknown'
              } : null,
              note: result.note || null
            } 
          : a
      ));
      
      setUploadProgress(prev => ({ ...prev, [audioId]: 100 }));
      
    } catch (error) {
      console.error('Retry upload failed:', error);
      setRecordedAudios(prev => prev.map(a => 
        a.id === audioId ? { ...a, status: 'error', error: error.message } : a
      ));
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[audioId];
        return newProgress;
      });
    }
  };

  // Function to load video from URL into the scene
  const loadVideoFromUrl = async (url) => {
    if (!cesdk || !url) return;

    setIsLoadingVideo(true);
    try {
      // Create a video fill from the URL
      const videoFill = await cesdk.engine.asset.createFromUrl(url);
      
      // Get the current scene
      const scene = cesdk.scene.get();
      
      // Find or create a page/block to add the video to
      const pages = cesdk.scene.getPages();
      let targetPage;
      
      if (pages.length > 0) {
        targetPage = pages[0];
      } else {
        // Create a new page if none exists
        targetPage = cesdk.scene.createPage();
      }
      
      // Create a video block
      const videoBlock = cesdk.engine.block.create('graphic');
      cesdk.engine.block.setShape(videoBlock, cesdk.engine.block.createShape('rect'));
      
      // Set the video as fill
      cesdk.engine.block.setFill(videoBlock, videoFill);
      
      // Get page dimensions to fit the video
      const pageWidth = cesdk.engine.block.getFrameWidth(targetPage);
      const pageHeight = cesdk.engine.block.getFrameHeight(targetPage);
      
      // Set video block size and position
      cesdk.engine.block.setPositionX(videoBlock, pageWidth / 2);
      cesdk.engine.block.setPositionY(videoBlock, pageHeight / 2);
      cesdk.engine.block.setWidth(videoBlock, pageWidth * 0.8);
      cesdk.engine.block.setHeight(videoBlock, pageHeight * 0.8);
      
      // Add the video block to the page
      cesdk.engine.block.appendChild(targetPage, videoBlock);
      
      // Select the video block
      cesdk.engine.editor.select(videoBlock);
      
      console.log('Video loaded successfully:', url);
    } catch (error) {
      console.error('Failed to load video:', error);
      alert('Failed to load video. Please check the URL and try again.');
    } finally {
      setIsLoadingVideo(false);
    }
  };

  // Function to export and save video
  const saveVideo = async () => {
    if (!cesdk) return;

    setIsExporting(true);
    try {
      // Export the video as MP4 blob
      const blob = await cesdk.export(cesdk.scene.get(), 'video/mp4');

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `video-${Date.now()}.mp4`; // Unique filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export video. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (!cesdk_container.current) return;
    
    let cleanedUp = false;
    let instance;
    
    CreativeEditorSDK.create(cesdk_container.current, config).then(
      async (_instance) => {
        instance = _instance;
        if (cleanedUp) {
          instance.dispose();
          return;
        }

        // Do something with the instance of CreativeEditor SDK, for example:
        // Populate the asset library with default / demo asset sources.
        await Promise.all([
          instance.addDefaultAssetSources(),
          instance.addDemoAssetSources({ sceneMode: 'Video' })
        ]);

        await instance.createVideoScene();

        var videoUrls = [
          videoUrl,
        ];

        videoUrls = videoUrls;
        const timing = 5;
        const audioUrl = [];
        let engine = instance.engine;

        const track = engine.block.create("track");
        let mainTrack = track;
        setMainEngine(engine)
        const page = engine.scene.getCurrentPage();

        engine.block.setWidth(page, 1280);
        engine.block.setHeight(page, 720);

        console.log("All video URLs", videoUrls);
        engine.block.appendChild(page, track);
        
        // Process videos sequentially to get their durations
        for (let i = 0; i < videoUrls.length; i++) {
          const url = videoUrls[i];
          if (!url) continue; // Skip null/undefined URLs
          
          const video2 = instance.engine.block.create("graphic");
          instance.engine.block.setShape(
            video2,
            engine.block.createShape("rect")
          );
          const videoFill2 = instance.engine.block.createFill(
            url.endsWith("mp4") ? "video" : "image"
          );
          instance.engine.block.setString(
            videoFill2,
            url.endsWith("mp4")
              ? "fill/video/fileURI"
              : "fill/image/imageFileURI",
            url
          );
          instance.engine.block.setFill(video2, videoFill2);
          
          // Get video duration if it's a video file
          let duration = 5; // Default duration for images
          if (url.endsWith("mp4")) {
            try {
              duration = await getVideoDuration(url);
              console.log(`Video ${i + 1} duration:`, duration, 'seconds');
            } catch (error) {
              console.error(`Failed to get duration for video ${i + 1}:`, error);
              duration = 5; // Fallback to default
            }
          }
          
          engine.block.setDuration(video2, duration);
          
          console.log(
            "Video",
            i,
            engine.block.getTimeOffset(video2),
            engine.block.supportsTimeOffset(video2)
          );
          const zoomAnimation = engine.block.createAnimation("zoom");
          const fadeOutAnimation = engine.block.createAnimation("fade");
          engine.block.setDuration(
            zoomAnimation,
            0.4 * duration
          );
          engine.block.setInAnimation(video2, zoomAnimation);
          engine.block.setOutAnimation(video2, fadeOutAnimation);

          console.log(engine.block.supportsPlaybackControl(page));
          engine.block.appendChild(track, video2);
        }

        console.log("Audio URL", audioUrl);

        const track1 = engine.block.create("track");
        engine.block.appendChild(page, track1);
        engine.block.fillParent(track);
        setCesdk(instance);
        
        // Load video if URL is provided
        if (videoUrl) {
          // Wait a bit for the scene to be fully initialized
          setTimeout(() => {
            loadVideoFromUrl(videoUrl);
          }, 1000);
        }
      }
    );
    
    const cleanup = () => {
      cleanedUp = true;
      instance?.dispose();
      setCesdk(null);
      
      // Cleanup recorded audio URLs
      recordedAudios.forEach(audio => {
        URL.revokeObjectURL(audio.url);
      });
      setRecordedAudios([]);
      
      // Stop recording if active
      if (isRecording && mediaRecorder) {
        mediaRecorder.stop();
        setIsRecording(false);
        setMediaRecorder(null);
      }
    };
    
    return cleanup;
  }, [cesdk_container]);

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'row', 
      position: 'relative',
      overflow: 'hidden' // Tắt cuộn ngang
    }}>
      {/* Main Editor Container - Responsive Width */}
      <div
        ref={cesdk_container}
        className="main-editor"
        style={{ 
          width: sidebarOpen ? 'calc(100% - 350px)' : '100%', 
          height: '100%',
          overflow: 'hidden', // Tắt cuộn trong editor
          transition: 'width 0.3s ease' // Smooth transition khi thay đổi width
        }}
      ></div>
      
      <div>
        {/* Recording Button - Fixed Position Top Right */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1001,
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: isRecording ? '#dc3545' : '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease',
            animation: isRecording ? 'pulse 1.5s infinite' : 'none'
          }}
          title={sidebarOpen ? 'Đóng panel ghi âm' : 'Mở panel ghi âm'}
        >
          <Mic2 />
        </button>
      </div>
      
      {/* Right Sidebar - Side by Side */}
      {sidebarOpen && (
        <div 
          className="sidebar-panel"
          style={{
            width: '350px',
            height: '100vh',
            backgroundColor: '#f8f9fa',
            borderLeft: '1px solid #e9ecef',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px 20px 20px 20px', // Top padding để tránh nút ghi âm
            boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
        >
        {/* Audio Recording Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Mic2 size={16} />
            Ghi âm
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#6c757d',
                padding: '4px'
              }}
            >
              <X size={16} />
            </button>
          </h3>

          {/* Recording Controls */}
          <div style={{ marginBottom: '16px' }}>
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="recording-btn"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Mic size={16} />
                Bắt đầu ghi âm
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="recording-btn"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <MicOff size={16} />
                Dừng ghi âm
              </button>
            )}
          </div>
          
          {/* Recording Status */}
          {isRecording && (
            <div style={{
              padding: '8px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#856404',
              textAlign: 'center'
            }}>
              <Mic size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Đang ghi âm...
            </div>
          )}
        </div>

        {/* Recorded Audio List */}
        <div className="sidebar-content" style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '16px',
          flex: 1,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflow: 'auto'
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#333'
          }}>
            <Volume2 size={16} />
            Audio đã ghi ({recordedAudios.length})
          </h3>
          
          {recordedAudios.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#6c757d',
              fontSize: '14px',
              padding: '20px'
            }}>
              Chưa có audio nào được ghi
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recordedAudios.map((audio) => (
                <div
                  key={audio.id}
                  className="audio-item"
                  style={{
                    border: '1px solid #e9ecef',
                    borderRadius: '6px',
                    padding: '12px',
                    backgroundColor: audio.status === 'error' ? '#ffebee' : '#f8f9fa',
                    transition: 'all 0.2s ease',
                    opacity: audio.status === 'uploading' ? 0.7 : 1
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#333'
                      }}>
                        {audio.name}
                      </span>
                      
                      {/* Status indicator */}
                      <div style={{ fontSize: '10px', marginTop: '2px' }}>
                        {audio.status === 'recorded' && (
                          <span style={{ color: '#6c757d' }}>
                            <Check size={10} style={{ display: 'inline', marginRight: '2px' }} />
                            Đã ghi xong
                          </span>
                        )}
                        {audio.status === 'uploading' && (
                          <span style={{ color: '#007bff' }}>
                            <Upload size={10} style={{ display: 'inline', marginRight: '2px' }} />
                            {audio.processingStep || 'Đang xử lý...'}
                          </span>
                        )}
                        {audio.status === 'uploaded' && (
                          <span style={{ color: '#28a745' }}>
                            <Cloud size={10} style={{ display: 'inline', marginRight: '2px' }} />
                            Đã upload
                          </span>
                        )}
                        {audio.status === 'error' && (
                          <span style={{ color: '#dc3545' }}>
                            <AlertCircle size={10} style={{ display: 'inline', marginRight: '2px' }} />
                            Lỗi upload
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {audio.status === 'error' && (
                        <button
                          onClick={() => retryUpload(audio.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#007bff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            padding: '4px',
                            borderRadius: '4px'
                          }}
                          title="Thử lại upload"
                        >
                          <RotateCcw size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteAudio(audio.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc3545',
                          cursor: 'pointer',
                          fontSize: '14px',
                          padding: '4px',
                          borderRadius: '4px',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f8d7da'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Upload progress bar */}
                  {audio.status === 'uploading' && uploadProgress[audio.id] !== undefined && (
                    <div style={{
                      width: '100%',
                      height: '4px',
                      backgroundColor: '#e9ecef',
                      borderRadius: '2px',
                      marginBottom: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${uploadProgress[audio.id]}%`,
                        height: '100%',
                        backgroundColor: '#007bff',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  )}
                  
                  {/* Compression info */}
                  {audio.compressionInfo && (
                    <div style={{
                      fontSize: '10px',
                      color: '#6c757d',
                      marginBottom: '8px',
                      padding: '4px 8px',
                      backgroundColor: '#e3f2fd',
                      borderRadius: '4px'
                    }}>
                      <Volume2 size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      Nén ({audio.compressionInfo.format}): {(audio.compressionInfo.originalSize / 1024).toFixed(1)}KB → {(audio.compressionInfo.compressedSize / 1024).toFixed(1)}KB 
                      ({audio.compressionInfo.ratio}% nhỏ hơn)
                    </div>
                  )}
                  
                  {/* Note/Warning message */}
                  {audio.note && (
                    <div style={{
                      fontSize: '10px',
                      color: '#856404',
                      marginBottom: '8px',
                      padding: '4px 8px',
                      backgroundColor: '#fff3cd',
                      borderRadius: '4px'
                    }}>
                      <AlertCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {audio.note}
                    </div>
                  )}
                  
                  {/* Error message */}
                  {audio.status === 'error' && audio.error && (
                    <div style={{
                      fontSize: '10px',
                      color: '#dc3545',
                      marginBottom: '8px',
                      padding: '4px 8px',
                      backgroundColor: '#f8d7da',
                      borderRadius: '4px'
                    }}>
                      {audio.error}
                    </div>
                  )}
                  
                  <div style={{
                    fontSize: '11px',
                    color: '#6c757d',
                    marginBottom: '8px'
                  }}>
                    {audio.timestamp} • {(audio.size / 1024).toFixed(1)}KB
                    {audio.cloudUrl && (
                      <span style={{ color: '#28a745', marginLeft: '8px' }}>
                        <Cloud size={10} style={{ display: 'inline', marginRight: '2px' }} />
                        Trên cloud
                      </span>
                    )}
                  </div>
                  
                  <audio
                    controls
                    style={{
                      width: '100%',
                      height: '30px',
                      marginBottom: '8px'
                    }}
                  >
                    <source src={audio.url} type={audio.actualFormat || 'audio/webm'} />
                    Trình duyệt không hỗ trợ audio player
                  </audio>
                  
                  <button
                    onClick={() => addAudioToTimeline(audio)}
                    disabled={audio.status === 'uploading'}
                    style={{
                      width: '100%',
                      padding: '6px 12px',
                      backgroundColor: audio.status === 'uploading' ? '#6c757d' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: audio.status === 'uploading' ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (audio.status !== 'uploading') {
                        e.target.style.backgroundColor = '#218838';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (audio.status !== 'uploading') {
                        e.target.style.backgroundColor = '#28a745';
                      }
                    }}
                  >
                    {audio.status === 'uploading' ? (
                      <>
                        <Loader2 size={12} className="animate-spin" style={{ marginRight: '4px' }} />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Plus size={12} style={{ marginRight: '4px' }} />
                        Thêm vào Timeline
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
      )}
      
      {/* Recording Animation CSS */}
      <style jsx>{`
        /* Tắt cuộn ngang toàn bộ */
        body, html {
          overflow-x: hidden !important;
          max-width: 100% !important;
        }
        
        * {
          box-sizing: border-box;
        }
        
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        /* Responsive design for sidebar */
        @media (max-width: 768px) {
          .sidebar-panel {
            width: 280px !important;
          }
          .main-editor {
            width: calc(100% - 280px) !important;
          }
        }
        
        @media (max-width: 640px) {
          .sidebar-panel {
            width: 100% !important;
            position: fixed !important;
            top: 0 !important;
            right: 0 !important;
            z-index: 1000 !important;
            box-shadow: -4px 0 15px rgba(0,0,0,0.2) !important;
          }
          .main-editor {
            width: 100% !important;
          }
        }
        
        /* Custom scrollbar for sidebar */
        .sidebar-content::-webkit-scrollbar {
          width: 6px;
        }
        
        .sidebar-content::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        .sidebar-content::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        .sidebar-content::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
        
        /* Button hover effects */
        .recording-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        .audio-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .export-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,123,255,0.3);
        }
        
        /* Fade in animation for audio items */
        .audio-item {
          animation: fadeIn 0.3s ease-in;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Slide in animation for sidebar */
        .sidebar-panel {
          animation: slideInFromRight 0.3s ease-out;
        }
        
        @keyframes slideInFromRight {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            width: 350px;
            opacity: 1;
          }
        }
        
        /* Mobile slide animation */
        @media (max-width: 640px) {
          .sidebar-panel {
            animation: slideInMobile 0.3s ease-out;
          }
          
          @keyframes slideInMobile {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }
        }
        
        /* Recording button hover effect */
        button[title*="ghi âm"]:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0,123,255,0.4);
        }
        
        /* Background overlay fade in */
        @keyframes overlayFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
