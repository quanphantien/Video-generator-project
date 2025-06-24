import CreativeEditorSDK from '@cesdk/cesdk-js';

import { useEffect, useRef, useState } from 'react';

const config = {
  license: `${process.env.REACT_APP_CREATIVE_EDITOR_SDK_KEY}`,
  userId: 'guides-user',
  // Enable local uploads in Asset Library
  callbacks: { onUpload: 'local' },
  theme: 'light'

};

export default function CreativeEditorSDKComponent() {
  const cesdk_container = useRef(null);
  const [cesdk, setCesdk] = useState(null);
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
      style={{ width: '100vw', height: '100vh' }}
    ></div>
  );
}
