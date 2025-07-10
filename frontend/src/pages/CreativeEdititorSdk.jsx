import CreativeEditorSDK from '@cesdk/cesdk-js';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

const config = {
  license: `${process.env.REACT_APP_CREATIVE_EDITOR_SDK_KEY}`,
  userId: 'video-creator-user',
  // Enable local uploads in Asset Library
  callbacks: { onUpload: 'local' },
  theme: 'light',
  ui: {
    elements: {
      view: "advanced",
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
          download: false,
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
    },
  }
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
      const audioUrl =null;
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
          0.4 * 5
        );
        engine.block.setInAnimation(video2, zoomAnimation);
        engine.block.setOutAnimation(video2, fadeOutAnimation);

        console.log(engine.block.supportsPlaybackControl(page));
        // engine.block.setMuted(page, true);
        engine.block.appendChild(track, video2);
      }
      const audio = engine.block.create("audio");
      engine.block.appendChild(page, audio);
      engine.block.setString(
        audio,
        "audio/fileURI",
        encodeURI(audioUrl)
        // "https://pub-678b8517ce85460f91e69a5c322f3ea7.r2.dev/audios/6818bd3fc154edd026497deb/Recording.mp3"
      );
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
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Audio Recording Panel */}

      
      {/* Main Editor Container */}
      <div
        ref={cesdk_container}
        style={{ width: '100%', height: '100%' }}
      ></div>
      
      {/* Recording Animation CSS */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}