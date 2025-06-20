// import React, { useState, useRef } from "react";
// import { Rnd } from "react-rnd";
// import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

// export default function VideoEditor() {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration] = useState(60);
//   const [transition, setTransition] = useState("fade");
//   const [timelineItems, setTimelineItems] = useState([]);
//   const [textSettings, setTextSettings] = useState({
//     content: "Văn bản mới",
//     fontSize: 24,
//     color: "#ffffff",
//     fontFamily: "Arial",
//   });
//   const previewRef = useRef(null);
//   const fileImageInputRef = useRef(null);
//   const fileAudioInputRef = useRef(null);

//   const togglePlayPause = () => setIsPlaying((p) => !p);
//   const formatTime = (sec) =>
//     `${Math.floor(sec / 60)}:${Math.floor(sec % 60)
//       .toString()
//       .padStart(2, "0")}`;

//   const handleAddImage = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const src = URL.createObjectURL(file);
//       const newItem = {
//         id: Date.now().toString(),
//         type: "image",
//         src,
//         duration: 5,
//         start: 0,
//         position: { x: 50, y: 50 },
//         size: { width: 200, height: 150 },
//       };
//       setTimelineItems((list) => [...list, newItem]);
//     }
//   };

//   const handleAddAudio = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const src = URL.createObjectURL(file);
//       const newItem = {
//         id: Date.now().toString(),
//         type: "audio",
//         src,
//         duration: 10,
//         start: 0,
//       };
//       setTimelineItems((list) => [...list, newItem]);
//     }
//   };

//   const handleAddText = () => {
//     const { content, fontSize, color, fontFamily } = textSettings;
//     const newItem = {
//       id: Date.now().toString(),
//       type: "text",
//       duration: 5,
//       start: 0,
//       position: { x: 100, y: 100 },
//       size: { width: 200, height: 60 },
//       text: content,
//       fontSize,
//       color,
//       fontFamily,
//     };
//     setTimelineItems((list) => [...list, newItem]);
//   };

//   const updateItem = (id, data) => {
//     setTimelineItems((prev) =>
//       prev.map((it) => (it.id === id ? { ...it, ...data } : it))
//     );
//   };

//   const handleTimelineClick = (e) => {
//     const rect = e.currentTarget.getBoundingClientRect();
//     const pct = (e.clientX - rect.left) / rect.width;
//     setCurrentTime(pct * duration);
//   };

//   return (
//     <main className="p-6 bg-gray-100 min-h-[calc(100vh-80px)]">
//       {/* Progress bar */}
//       <div className="mb-6">
//         <div className="flex justify-between items-center mb-2">
//           {[
//             "Chọn chủ đề",
//             "Tạo kịch bản",
//             "Tạo giọng đọc",
//             "Sinh hình ảnh",
//             "Chỉnh sửa",
//             "Xuất video",
//           ].map((label, index) => (
//             <div key={index} className="flex flex-col items-center w-1/6">
//               <div
//                 className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold ${
//                   index === 4 ? "bg-purple-600" : "bg-purple-300"
//                 }`}
//               >
//                 {index + 1}
//               </div>
//               <span className="text-xs text-center mt-1">{label}</span>
//             </div>
//           ))}
//         </div>
//         <div className="h-2 bg-purple-200 rounded-full w-full"></div>
//       </div>
//       <div className="flex flex-col gap-4">
//         {/* Video Preview + Overlay */}
//         <div className="bg-gray-900 flex justify-center items-center rounded-lg overflow-hidden">
//           <div
//             ref={previewRef}
//             className="relative w-full max-w-4xl aspect-video bg-black"
//           >
//             <img
//               src="/placeholder.svg?height=720&width=1280"
//               alt="Preview"
//               className="w-full h-full object-contain"
//             />

//             {timelineItems.map((item) =>
//               (item.type === "image" || item.type === "text") &&
//               currentTime >= item.start &&
//               currentTime <= item.start + item.duration ? (
//                 <Rnd
//                   key={item.id}
//                   default={{
//                     x: item.position.x,
//                     y: item.position.y,
//                     width: item.size.width,
//                     height: item.size.height,
//                   }}
//                   bounds="parent"
//                   onDragStop={(e, d) =>
//                     updateItem(item.id, { position: { x: d.x, y: d.y } })
//                   }
//                   onResizeStop={(e, dir, ref, delta, pos) =>
//                     updateItem(item.id, {
//                       position: { x: pos.x, y: pos.y },
//                       size: {
//                         width: parseInt(ref.style.width),
//                         height: parseInt(ref.style.height),
//                       },
//                     })
//                   }
//                   style={{
//                     border: "1px dashed white",
//                     zIndex: 10,
//                   }}
//                 >
//                   {item.type === "image" ? (
//                     <img
//                       src={item.src}
//                       alt=""
//                       className="w-full h-full object-contain"
//                     />
//                   ) : (
//                     <div
//                       className="w-full h-full flex items-center justify-center text-center p-1"
//                       style={{
//                         fontSize: item.fontSize,
//                         color: item.color,
//                         fontFamily: item.fontFamily,
//                         background: "rgba(0,0,0,0.3)",
//                       }}
//                     >
//                       {item.text}
//                     </div>
//                   )}
//                 </Rnd>
//               ) : null
//             )}

//             {!isPlaying && (
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <button
//                   className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 h-16 w-16 text-white text-xl"
//                   onClick={togglePlayPause}
//                 >
//                   ▶
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Playback & Timeline Controls */}
//         <div className="bg-white p-4 rounded shadow">
//           <div className="flex justify-between items-center mb-4">
//             <div className="flex gap-2">
//               <button onClick={() => setCurrentTime(0)}>⏮</button>
//               <button onClick={togglePlayPause}>{isPlaying ? "⏸" : "▶"}</button>
//               <button onClick={() => setCurrentTime(duration)}>⏭</button>
//               <span className="ml-2">
//                 {formatTime(currentTime)} / {formatTime(duration)}
//               </span>
//             </div>
//             <div className="flex items-center gap-2">
//               <label>Chuyển cảnh:</label>
//               <select
//                 value={transition}
//                 onChange={(e) => setTransition(e.target.value)}
//                 className="border rounded p-1"
//               >
//                 <option value="fade">Mờ dần</option>
//                 <option value="slide">Trượt</option>
//                 <option value="zoom">Phóng to</option>
//                 <option value="none">Không có</option>
//               </select>
//             </div>
//           </div>

//           <div
//             className="h-2 bg-gray-200 rounded-full mb-4 cursor-pointer relative"
//             onClick={handleTimelineClick}
//           >
//             <div
//               className="absolute top-0 left-0 h-full bg-green-500"
//               style={{ width: `${(currentTime / duration) * 100}%` }}
//             />
//             <div
//               className="absolute h-4 w-4 bg-white border-2 border-green-500 rounded-full"
//               style={{
//                 left: `calc(${(currentTime / duration) * 100}% - 8px)`,
//               }}
//             />
//           </div>

//           <div className="flex gap-2 mb-4">
//             <button
//               onClick={() => fileImageInputRef.current.click()}
//               className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white shadow-sm flex items-center gap-2"
//             >
//               🖼 Thêm hình ảnh
//             </button>
//             <input
//               type="file"
//               accept="image/*"
//               ref={fileImageInputRef}
//               className="hidden"
//               onChange={handleAddImage}
//             />

//             <button
//               onClick={handleAddText}
//               className="px-4 py-2 rounded-md bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm flex items-center gap-2"
//             >
//               ✏️ Thêm văn bản
//             </button>

//             <button
//               onClick={() => fileAudioInputRef.current.click()}
//               className="px-4 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white shadow-sm flex items-center gap-2"
//             >
//               🎵 Thêm nhạc nền
//             </button>
//             <input
//               type="file"
//               accept="audio/*"
//               ref={fileAudioInputRef}
//               className="hidden"
//               onChange={handleAddAudio}
//             />
//           </div>

//           {/* Chỉnh văn bản */}
//           <div className="flex flex-wrap gap-3 items-center mb-4">
//             <input
//               type="text"
//               value={textSettings.content}
//               onChange={(e) =>
//                 setTextSettings((s) => ({ ...s, content: e.target.value }))
//               }
//               placeholder="Nội dung văn bản"
//               className="border border-gray-300 rounded px-3 py-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />

//             <input
//               type="number"
//               value={textSettings.fontSize}
//               onChange={(e) =>
//                 setTextSettings((s) => ({
//                   ...s,
//                   fontSize: parseInt(e.target.value),
//                 }))
//               }
//               placeholder="Cỡ chữ"
//               className="w-24 border border-gray-300 rounded px-3 py-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />

//             <input
//               type="color"
//               value={textSettings.color}
//               onChange={(e) =>
//                 setTextSettings((s) => ({ ...s, color: e.target.value }))
//               }
//               className="w-10 h-10 border rounded cursor-pointer"
//               title="Chọn màu chữ"
//             />

//             <select
//               value={textSettings.fontFamily}
//               onChange={(e) =>
//                 setTextSettings((s) => ({
//                   ...s,
//                   fontFamily: e.target.value,
//                 }))
//               }
//               className="border border-gray-300 rounded px-3 py-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="Arial">Arial</option>
//               <option value="Times New Roman">Times New Roman</option>
//               <option value="Courier New">Courier New</option>
//               <option value="Tahoma">Tahoma</option>
//             </select>
//           </div>
//         </div>
//         {/* Timeline chi tiết hiển thị các mục */}
//         <div className="border rounded-md bg-white">
//           <div className="p-2 border-b bg-gray-50 flex justify-between items-center">
//             <h3 className="font-medium">Timeline</h3>
//           </div>

//           <div className="max-h-[300px] overflow-y-auto">
//             {timelineItems.map((item) => (
//               <div
//                 key={item.id}
//                 className="border-b last:border-b-0 p-3 hover:bg-gray-50"
//               >
//                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//                   <div className="flex items-center space-x-3">
//                     <span className="cursor-grab text-gray-400">↕</span>

//                     {item.type === "image" && (
//                       <img
//                         src={item.src || "/placeholder.svg"}
//                         alt="item"
//                         className="w-16 h-10 object-cover rounded"
//                       />
//                     )}

//                     {item.type === "audio" && (
//                       <div className="w-16 h-10 bg-blue-100 rounded flex items-center justify-center">
//                         🎵
//                       </div>
//                     )}

//                     {item.type === "text" && (
//                       <div className="w-16 h-10 bg-yellow-100 rounded flex items-center justify-center">
//                         ✏️
//                       </div>
//                     )}

//                     <div>
//                       <p className="font-medium">
//                         {item.type === "image"
//                           ? "Hình ảnh"
//                           : item.type === "audio"
//                           ? "Âm thanh"
//                           : "Văn bản"}
//                       </p>
//                       <p className="text-xs text-gray-500">
//                         {formatTime(item.start)} -{" "}
//                         {formatTime(item.start + item.duration)}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex flex-wrap items-center space-x-2">
//                     <label className="text-sm">Bắt đầu:</label>
//                     <input
//                       type="number"
//                       min="0"
//                       max={duration}
//                       value={item.start}
//                       onChange={(e) =>
//                         updateItem(item.id, {
//                           start: parseFloat(e.target.value) || 0,
//                         })
//                       }
//                       className="w-16 border rounded px-1 py-0.5 text-sm"
//                     />
//                     <label className="text-sm">Thời lượng:</label>
//                     <input
//                       type="number"
//                       min="1"
//                       max={duration - item.start}
//                       value={item.duration}
//                       onChange={(e) =>
//                         updateItem(item.id, {
//                           duration: parseFloat(e.target.value) || 1,
//                         })
//                       }
//                       className="w-16 border rounded px-1 py-0.5 text-sm"
//                     />
//                     <button
//                       className="text-red-500"
//                       onClick={() =>
//                         setTimelineItems((list) =>
//                           list.filter((x) => x.id !== item.id)
//                         )
//                       }
//                     >
//                       🗑
//                     </button>
//                   </div>
//                 </div>

//                 {item.type === "text" && (
//                   <div className="mt-3 p-3 bg-gray-50 rounded-md shadow-sm">
//                     <div className="flex flex-wrap items-center gap-3">
//                       {/* Nội dung */}
//                       <div className="flex items-center gap-1">
//                         <label className="text-sm text-gray-600">
//                           Nội dung:
//                         </label>
//                         <input
//                           type="text"
//                           value={item.text}
//                           onChange={(e) =>
//                             updateItem(item.id, { text: e.target.value })
//                           }
//                           className="min-w-[200px] border border-gray-300 rounded px-3 py-1 text-sm shadow-sm"
//                           placeholder="Văn bản"
//                         />
//                       </div>

//                       {/* Cỡ chữ */}
//                       <div className="flex items-center gap-1">
//                         <label className="text-sm text-gray-600">Cỡ:</label>
//                         <input
//                           type="number"
//                           value={item.fontSize}
//                           onChange={(e) =>
//                             updateItem(item.id, {
//                               fontSize: parseInt(e.target.value),
//                             })
//                           }
//                           className="w-16 border border-gray-300 rounded px-2 py-1 text-sm shadow-sm"
//                         />
//                       </div>

//                       {/* Màu chữ */}
//                       <div className="flex items-center gap-1">
//                         <label className="text-sm text-gray-600">Màu:</label>
//                         <input
//                           type="color"
//                           value={item.color}
//                           onChange={(e) =>
//                             updateItem(item.id, { color: e.target.value })
//                           }
//                           className="w-10 h-10 border rounded cursor-pointer"
//                           title="Chọn màu"
//                         />
//                       </div>

//                       {/* Font chữ */}
//                       <div className="flex items-center gap-1">
//                         <label className="text-sm text-gray-600">Font:</label>
//                         <select
//                           value={item.fontFamily}
//                           onChange={(e) =>
//                             updateItem(item.id, { fontFamily: e.target.value })
//                           }
//                           className="border border-gray-300 rounded px-2 py-1 text-sm shadow-sm"
//                         >
//                           <option value="Arial">Arial</option>
//                           <option value="Times New Roman">
//                             Times New Roman
//                           </option>
//                           <option value="Courier New">Courier New</option>
//                           <option value="Tahoma">Tahoma</option>
//                         </select>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//         <div className="flex justify-end space-x-3 mt-4">
//           <button className="bg-gray-400 text-white px-4 py-2 rounded shadow flex items-center gap-2">
//             <FaArrowLeft /> Quay lại
//           </button>
//           <button className="bg-green-500 text-white px-4 py-2 rounded shadow flex items-center gap-2">
//             Tiếp theo <FaArrowRight />
//           </button>
//         </div>
//       </div>
//     </main>
//   );
// }







import React, { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const VideoEditor = () => {
  const [loaded, setLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const ffmpegRef = useRef(new FFmpeg());

  const load = async () => {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    const ffmpeg = ffmpegRef.current;

    ffmpeg.on('log', ({ message }) => {
      console.log(message);
    });

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    setLoaded(true);
  };

  useEffect(() => {
    load();
  }, []);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const createVideo = async () => {
    if (!loaded || uploadedFiles.length === 0) return;

    setProcessing(true);
    const ffmpeg = ffmpegRef.current;

    try {
      // Write uploaded files to FFmpeg filesystem
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        await ffmpeg.writeFile(`input${i}.${file.name.split('.').pop()}`, await fetchFile(file));
      }

      // Simple video creation command (adjust based on your needs)
      // This example creates a slideshow from images
      if (uploadedFiles.every(file => file.type.startsWith('image/'))) {
        await ffmpeg.exec([
          '-framerate', '1/2',
          '-i', 'input%d.jpg',
          '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2',
          '-c:v', 'libx264',
          '-pix_fmt', 'yuv420p',
          'output.mp4'
        ]);
      }

      // Read the output video
      const data = await ffmpeg.readFile('output.mp4');
      const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);

    } catch (error) {
      console.error('Error creating video:', error);
    } finally {
      setProcessing(false);
    }
  };

  const downloadVideo = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = 'generated-video.mp4';
      a.click();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-purple-600 mb-6">Simple Video Creator</h1>

        {!loaded && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading FFmpeg...</p>
          </div>
        )}

        {loaded && (
          <>
            {/* File Upload Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Upload Resources</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-gray-600">
                    <p className="text-lg mb-2">Click to upload files</p>
                    <p className="text-sm">Support images, videos, and audio files</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Uploaded Files Display */}
            {uploadedFiles.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Uploaded Files ({uploadedFiles.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="border rounded-lg p-4 text-center">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Create Video Button */}
            <div className="text-center mb-8">
              <button
                onClick={createVideo}
                disabled={processing || uploadedFiles.length === 0}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {processing ? 'Creating Video...' : 'Create Video'}
              </button>
            </div>

            {/* Video Preview and Download */}
            {videoUrl && (
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Generated Video</h3>
                <video
                  src={videoUrl}
                  controls
                  className="max-w-full h-auto mx-auto mb-4"
                />
                <button
                  onClick={downloadVideo}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
                >
                  Download Video
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VideoEditor;








// import React, { useEffect, useRef, useState } from 'react';
// import CreativeEditorSDK from '@cesdk/cesdk-js';

// const VideoEditor = () => {
//   const cesdk = useRef(null);
//   const container = useRef(null);
//   const [uploadedFiles, setUploadedFiles] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const config = {
//       license: 'qH1oMQkBOCKRAti40sz_W-VlMJ8sZjCKYnIX98dqxzR6nl4JqTV2aerOWEPnGc9c', // You'll need to get this from IMG.LY
//       userId: 'user-' + Math.random().toString(36).substr(2, 9),
//       baseURL: 'https://cdn.img.ly/packages/imgly/cesdk-js/1.17.0/assets',
//     };

//     if (container.current) {
//       CreativeEditorSDK.create(container.current, config).then((instance) => {
//         cesdk.current = instance;
//         setIsLoading(false);
//       });
//     }

//     return () => {
//       if (cesdk.current) {
//         cesdk.current.dispose();
//       }
//     };
//   }, []);

//   const handleFileUpload = (event) => {
//     const files = Array.from(event.target.files);
//     setUploadedFiles(prev => [...prev, ...files]);

//     // Add files to the editor
//     files.forEach(file => {
//       const url = URL.createObjectURL(file);
//       if (cesdk.current && file.type.startsWith('image/')) {
//         // Add image to editor
//         cesdk.current.engine.asset.addLocalSource(url);
//       }
//     });
//   };

//   const handleExport = async () => {
//     if (cesdk.current) {
//       try {
//         const blob = await cesdk.current.export();
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = 'video-' + Date.now() + '.mp4';
//         a.click();
//         URL.revokeObjectURL(url);
//       } catch (error) {
//         console.error('Export failed:', error);
//         alert('Export failed. Please try again.');
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Header */}
//       <div className="bg-white shadow-sm p-4">
//         <div className="flex justify-between items-center max-w-7xl mx-auto">
//           <h1 className="text-2xl font-bold text-purple-600">Video Editor</h1>
//           <div className="flex gap-4">
//             <label className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition">
//               Upload Files
//               <input
//                 type="file"
//                 multiple
//                 accept="image/*,video/*,audio/*"
//                 onChange={handleFileUpload}
//                 className="hidden"
//               />
//             </label>
//             <button
//               onClick={handleExport}
//               className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
//               disabled={isLoading}
//             >
//               Export Video
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Upload Status */}
//       {uploadedFiles.length > 0 && (
//         <div className="bg-white border-b p-4">
//           <div className="max-w-7xl mx-auto">
//             <h3 className="font-semibold mb-2">Uploaded Files ({uploadedFiles.length})</h3>
//             <div className="flex gap-2 flex-wrap">
//               {uploadedFiles.map((file, index) => (
//                 <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
//                   {file.name}
//                 </span>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Editor Container */}
//       <div className="flex-1">
//         {isLoading && (
//           <div className="flex items-center justify-center h-96">
//             <div className="text-center">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
//               <p>Loading Editor...</p>
//             </div>
//           </div>
//         )}
//         <div
//           ref={container}
//           className="w-full h-screen"
//           style={{ display: isLoading ? 'none' : 'block' }}
//         />
//       </div>
//     </div>
//   );
// };

// export default VideoEditor;