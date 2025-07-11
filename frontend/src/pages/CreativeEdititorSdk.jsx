import CreativeEditorSDK from '@cesdk/cesdk-js';
import { useEffect, useRef, useState } from 'react';
import api from '../services/authService';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Mic, MicOff, Play, Pause, Trash2, Plus, ChevronRight, ChevronLeft, Volume2 } from 'lucide-react';



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
  // Get video URL from query params
  const [searchParams] = useSearchParams();
  const encodedVideoUrl = searchParams.get('videoUrl');
  const videoUrl = encodedVideoUrl ? decodeURIComponent(encodedVideoUrl) : null;
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
      }, 3000);
      
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
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toLocaleTimeString();
        
        setRecordedAudios(prev => [...prev, {
          id: Date.now(),
          url: url,
          blob: blob,
          name: `Recording ${timestamp}`,
          timestamp: timestamp
        }]);
        
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
    if (!cesdk || !audioItem) return;

    try {
      const engine = cesdk.engine;
      const page = engine.scene.getCurrentPage();
      
      // Create audio block
      const audioBlock = engine.block.create("audio");
      
      // Convert blob to data URL for the audio source
      const reader = new FileReader();
      reader.onload = () => {
        engine.block.setString(audioBlock, "audio/fileURI", reader.result);
        engine.block.appendChild(page, audioBlock);
        console.log('Audio added to timeline:', audioItem.name);
      };
      reader.readAsDataURL(audioItem.blob);
      
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
const YOUTUBE_CONFIG = {
  clientId: '127011313788-bft68f2ng4iuojmopu64rbdi11i06mdr.apps.googleusercontent.com',
  scope:  'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/userinfo.profile',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
  redirectUri: 'http://localhost:3000/editor', // Thêm redirect_uri khớp với Google Cloud Console
};

// Global variables for Google API
let gapiInitialized = false;
let youtubeAuth = null;

// Initialize Google API
const initializeGoogleAPI = async () => {
  if (gapiInitialized) return;

  try {
    await new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load Google API script'));
      document.head.appendChild(script);
    });

    // Load client and auth2
    await new Promise((resolve, reject) => {
      window.gapi.load('client:auth2', { callback: resolve, onerror: reject });
    });

    // Initialize client with error handling
    await window.gapi.client.init({
      client_id: YOUTUBE_CONFIG.clientId,
      scope: YOUTUBE_CONFIG.scope,
      discoveryDocs: YOUTUBE_CONFIG.discoveryDocs,
      redirect_uri: YOUTUBE_CONFIG.redirectUri, // Thêm redirect_uri
    }).catch((error) => {
      console.error('gapi.client.init failed:', error);
      throw error;
    });

    youtubeAuth = window.gapi.auth2.getAuthInstance();
    if (!youtubeAuth) {
      throw new Error('Failed to initialize YouTube authentication');
    }
    gapiInitialized = true;
    console.log('Google API initialized successfully');
  } catch (error) {
    console.error('Error initializing Google API:', error);
    throw error;
  }
};

// Authenticate with YouTube
const authenticateYouTube = async () => {
  await initializeGoogleAPI();

  if (!youtubeAuth) {
    throw new Error('YouTube authentication not initialized');
  }

  const isSignedIn = youtubeAuth.isSignedIn.get();
  console.log('Is signed in:', isSignedIn);

  if (!isSignedIn) {
    try {
      await youtubeAuth.signIn();
      console.log('Signed in successfully');
    } catch (signInError) {
      console.error('Sign-in failed:', signInError);
      throw signInError;
    }
  }

  const authResponse = youtubeAuth.currentUser.get().getAuthResponse();
  if (!authResponse || !authResponse.access_token) {
    throw new Error('Failed to get access token');
  }

  return authResponse.access_token;
};

const loginGoogleAndGetToken = () =>
  new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: YOUTUBE_CONFIG.clientId,
      scope: YOUTUBE_CONFIG.scope,
      callback: (tokenResponse) => {
        if (tokenResponse?.access_token) {
          resolve(tokenResponse.access_token);
        } else {
          reject('Failed to get token');
        }
      },
    });

    tokenClient.requestAccessToken();
  });


const uploadToYouTube = async (videoUrl, title, description, tags = []) => {
  try {
    // Get access token
    const accessToken = await loginGoogleAndGetToken();
    console.log('Access token obtained:', accessToken);
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.statusText}`);
    }
    const videoBlob = await response.blob();
    const metadata = {
      snippet: {
        title: title || `Video - ${new Date().toISOString()}`,
        description: description || 'Video uploaded from editor',
        tags: tags,
        categoryId: '22', // People & Blogs
      },
      status: {
        privacyStatus: 'public', // public, private, unlisted
        selfDeclaredMadeForKids: false,
      },
    };
    const videoId = await resumableUpload(videoBlob, metadata, accessToken);
    console.log('Video uploaded to YouTube, ID:', videoId);

    return videoId;
  } catch (error) {
    console.error('YouTube upload error:', error);
    throw error;
  }
};

// Resumable upload implementation (unchanged, assumed correct)
const resumableUpload = async (videoBlob, metadata, accessToken) => {
  const CHUNK_SIZE = 256 * 1024; // 256KB chunks

  // Step 1: Initialize upload session
  const initResponse = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Upload-Content-Type': 'video/mp4',
      'X-Upload-Content-Length': videoBlob.size,
    },
    body: JSON.stringify(metadata),
  });

  if (!initResponse.ok) {
    throw new Error(`Failed to initialize upload: ${initResponse.statusText}`);
  }

  const uploadUrl = initResponse.headers.get('Location');

  // Step 2: Upload video in chunks
  let uploadedBytes = 0;
  const totalBytes = videoBlob.size;

  while (uploadedBytes < totalBytes) {
    const chunk = videoBlob.slice(uploadedBytes, uploadedBytes + CHUNK_SIZE);
    const chunkEnd = Math.min(uploadedBytes + CHUNK_SIZE, totalBytes);

    const chunkResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Range': `bytes ${uploadedBytes}-${chunkEnd - 1}/${totalBytes}`,
        'Content-Length': chunk.size,
      },
      body: chunk,
    });

    if (chunkResponse.status === 200 || chunkResponse.status === 201) {
      const result = await chunkResponse.json();
      return result.id;
    } else if (chunkResponse.status === 308) {
      const range = chunkResponse.headers.get('Range');
      if (range) {
        uploadedBytes = parseInt(range.split('-')[1]) + 1;
      } else {
        uploadedBytes = chunkEnd;
      }
    } else {
      throw new Error(`Upload failed: ${chunkResponse.statusText}`);
    }
  }
};

// Upload to Cloudinary (unchanged, assumed correct)
const uploadToCloudinary = async (blob) => {
  const formData = new FormData();
  formData.append('file', blob, `video-${Date.now()}.mp4`);
  formData.append('upload_preset', 'video_preset'); // Tạo preset trong Cloudinary dashboard
  formData.append('resource_type', 'video');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/deb1zkv9x/video/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary upload failed: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return data.secure_url;
};

const sendToBackend = async (data) => {
  const response = await api.post('/video/video-youtube', data);
  return response.data;
};


const exportVideo = async () => {
  try {
    // Kiểm tra xem scene đã sẵn sàng chưa
    const scene = cesdk.engine.scene.get();
    if (!scene) {
      throw new Error('Scene chưa sẵn sàng');
    }

    // Export scene ra video
    const blob = await cesdk.export(scene, 'video/mp4');

    // Kiểm tra kết quả
    console.log('🎉 Blob đã tạo:', blob);
    return blob;
  } catch (err) {
    console.error('❌ Lỗi xuất video:', err.message);
    alert('Lỗi khi xuất video: ' + err.message);
  }
};

// Main save video function (unchanged, assumed correct)
const saveVideoToYoutube = async (blob , title) => {
  try {
    const cloudinaryUrl = await uploadToCloudinary(blob);
    const youtubeVideoId = await uploadToYouTube(
      cloudinaryUrl,
      title || `Video - ${new Date().toISOString()}`,
      title,
      ['video', 'editor', 'awesome']
    );

    console.log('✅ YouTube Video ID:', youtubeVideoId);

    console.log('💾 Saving to database...');
    await sendToBackend({
      title: title || `Video - ${new Date().toISOString()}`,
      url: cloudinaryUrl,
      youtube_id: youtubeVideoId,
    });

    console.log('🎉 Video uploaded successfully!');
    alert(`Video uploaded successfully!\nCloudinary: ${cloudinaryUrl}\nYouTube: https://www.youtube.com/watch?v=${youtubeVideoId}`);
    return `https://www.youtube.com/watch?v=${youtubeVideoId}`
  } 
  catch (error) {
    console.error('❌ Upload failed:', error);
    alert(`Failed to upload video: ${error.message}`);
  } finally {
    setIsExporting(false);
  }
};
  useEffect(() => {
    if (!cesdk_container.current) return;
    initializeGoogleAPI().catch(console.error);
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

        // Create a custom video scene with specific dimensions and duration
        // const scene = await instance.createVideoScene({
        //   duration: 30, // 30 seconds
        //   framerate: 30, // 30 fps
        //   width: 1920,   // Full HD width
        //   height: 1080   // Full HD height
        // });

        await instance.createVideoScene();
        // Set default video timeline

      var videoUrls = [
        videoUrl,
        // "https://videos.pexels.com/video-files/25935014/11922020_720_1280_15fps.mp4",
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

      // engine.block.setDuration(page, 20);

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
        // if (url.endsWith("mp4")) {
        //   engine.block.setMuted(video2, true);
        // }
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
        // engine.block.setMuted(page, true);
        engine.block.appendChild(track, video2);
      }

      console.log("Audio URL", audioUrl);
      // const backgroundAudio = engine.block.create("audio");
      // engine.block.appendChild(page, backgroundAudio);
      // engine.block.setString(
      //   backgroundAudio,
      //   "audio/fileURI",
      //   "https://cdn.img.ly/assets/demo/v1/ly.img.audio/audios/far_from_home.m4a"
      // );
      // engine.block.setVolume(backgroundAudio, 0.3); 

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
        🎙️
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
            🎙️ Ghi âm
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
              ✕
            </button>
          </h3>
         

      <div>
  
    </div>
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
                🔴 Bắt đầu ghi âm
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
                ⏹️ Dừng ghi âm
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
              🎤 Đang ghi âm...
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
            🎵 Audio đã ghi ({recordedAudios.length})
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
                    backgroundColor: '#f8f9fa',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#333'
                    }}>
                      {audio.name}
                    </span>
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
                      🗑️
                    </button>
                  </div>
                  
                  <div style={{
                    fontSize: '11px',
                    color: '#6c757d',
                    marginBottom: '8px'
                  }}>
                    {audio.timestamp}
                  </div>
                  
                  <audio
                    controls
                    style={{
                      width: '100%',
                      height: '30px',
                      marginBottom: '8px'
                    }}
                  >
                    <source src={audio.url} type="audio/wav" />
                  </audio>
                  
                  <button
                    onClick={() => addAudioToTimeline(audio)}
                    style={{
                      width: '100%',
                      padding: '6px 12px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
                  >
                    ➕ Thêm vào Timeline
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
