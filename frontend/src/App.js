import React from "react";
import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Outlet } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Homepage from "./components/a1_Homepage/Homepage";
import Navbar from "./components/a2_NavBar/NavBar";
import Footer from "./components/a3_Footer/Footer";
import Login from "./components/a4_Login/Login";

import Dashboard from "./components/b_Dashboard/Dashboard";
import Sidebar from "./components/b_Sidebar/Sidebar";
import Statistics from "./components/b_Statistics/Statistics";

import VideoCreator from "./components/b0_VideoCreator/VideoCreator";
import AITalkWebsite from "./pages/AITalkWebsite";
import VideoGenerationInterface from "./pages/VideoGenerationInterface";

import CreativeEditorSDKComponent from "./pages/CreativeEdititorSdk";

import VideoEditor from "./components/b4_VideoEdit/VideoEdit";



// SpecialLayout.js
const HomePageLayout = ({ children }) => (
  <>
    <div>{children}</div>
  </>
);
function App() {
  // useEffect(() => {
  //   window.addEventListener('popstate', () => {
  //     window.location.reload();
  //   });

  //   return () => {
  //     window.removeEventListener('popstate', () => {
  //       window.location.reload();
  //     });
  //   };
  // }, []);
  

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <div className="flex flex-1">
          {/* {window.location.pathname !== '/' && window.location.pathname !== '/login' && <Sidebar />} */}
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Homepage />} />

              <Route element={<MainLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
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
        <Footer />
      </div>
    </Router>
  );
}

export default App;