import React, { useEffect } from "react";
import { AuthProvider } from './context/authContext';
import ProtectedRoute from './components/ProtectedRoute';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Homepage from "./components/a1_Homepage/Homepage";
import Footer from "./components/a3_Footer/Footer";
import Login from "./components/a4_Login/Login";
import Register from "./components/a5_Register/Register";
import Dashboard from "./components/b_Dashboard/Dashboard";
import Statistics from "./components/b_Statistics/Statistics";
import VideoCreator from "./components/b0_VideoCreator/VideoCreator";
import AITalkWebsite from "./pages/AITalkWebsite";
import VideoGenerationInterface from "./pages/VideoGenerationInterface";
import CreativeEditorSDKComponent from "./pages/CreativeEdititorSdk";
import VideoEditor from "./components/b4_VideoEdit/VideoEdit";
import ProtectedApiDemo from "./components/ProtectedApiDemo/ProtectedApiDemo";
import ChannelYoutube from './components/ChannelYoutube/ChannelYoutube';

function App() {
  useEffect(() => {
    // Kết nối tới WebSocket server
    const ws = new WebSocket('ws://localhost:3000/ws');

    ws.onopen = () => {
      console.log('Connected to WebSocket');
      ws.send('Hello Server!'); // Gửi tin nhắn tới server
    };

    ws.onmessage = (event) => {
      console.log('Message from server:', event.data); // Nhận tin nhắn từ server
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Đóng kết nối khi component bị unmount
    return () => {
      ws.close();
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <div className="flex flex-1">
            <div className="flex-grow">
              <Routes>
                <Route path="/" element={
                  <>
                    <Homepage />
                    <Footer />
                  </>
                } />
                <Route element={<MainLayout />}>
                  <Route
                    path="/login"
                    element={
                      <ProtectedRoute requireAuth={false}>
                        <Login />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <ProtectedRoute requireAuth={false}>
                        <Register />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/statistics" element={<Statistics />} />
                  <Route path="/create" element={<VideoCreator />} />
                  <Route path="/api-demo" element={
                    <ProtectedRoute requireAuth={true}>
                      <ProtectedApiDemo />
                    </ProtectedRoute>
                  } />
                  <Route path="/edit" element={<VideoEditor />} />
                  <Route path="/text-to-video" element={<VideoGenerationInterface />} />
                  <Route path="/aitalk" element={<AITalkWebsite />} />
                  <Route path="/editor" element={<CreativeEditorSDKComponent />} />
                  <Route path="/channel/youtube" element={<ChannelYoutube />} />
                </Route>
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;