import React from "react";
import { useEffect } from "react";
import { AuthProvider } from './context/authContext';
import ProtectedRoute from './components/ProtectedRoute';
import { BrowserRouter as Router, Route, Routes, Outlet } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Homepage from "./components/a1_Homepage/Homepage";
import Footer from "./components/a3_Footer/Footer";
import Login from "./components/a4_Login/Login";
import Dashboard from "./components/b_Dashboard/Dashboard";
import Statistics from "./components/b_Statistics/Statistics";
import VideoCreator from "./components/b0_VideoCreator/VideoCreator";
import AITalkWebsite from "./pages/AITalkWebsite";
import VideoGenerationInterface from "./pages/VideoGenerationInterface";
import CreativeEditorSDKComponent from "./pages/CreativeEdititorSdk";
import VideoEditor from "./components/b4_VideoEdit/VideoEdit";

// // SpecialLayout.js
// const HomePageLayout = ({ children }) => (
//   <>
//     <div>{children}</div>
//   </>
// );

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <div className="flex flex-1">
            {/* {window.location.pathname !== '/' && window.location.pathname !== '/login' && <Sidebar />} */}
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
                    path="/dashboard"
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/statistics" element={<Statistics />} />
                  <Route path="/create" element={<VideoCreator />} />

                  <Route path="/edit" element={<VideoEditor />} />
                  {/* Other routes */}
                  <Route path="/text-to-video" element={<VideoGenerationInterface />} />
                  <Route path="/aitalk" element={<AITalkWebsite />} />
                  <Route path="/editor" element={<CreativeEditorSDKComponent />} />
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