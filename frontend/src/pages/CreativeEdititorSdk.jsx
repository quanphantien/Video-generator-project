import CreativeEditorSDK from '@cesdk/cesdk-js';

import { useEffect, useRef, useState } from 'react';

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

        setCesdk(instance);
      }
    );
    const cleanup = () => {
      cleanedUp = true;
      instance?.dispose();
      setCesdk(null);
    };
    return cleanup;
  }, [cesdk_container]);
  return (
    <div
      ref={cesdk_container}
      style={{ width: '100%', height: '100vh' }}
    ></div>
  );
}
