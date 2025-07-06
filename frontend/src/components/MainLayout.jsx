// MainLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./a2_NavBar/NavBar";
import Sidebar from "./b_Sidebar/Sidebar";

export default function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const location = useLocation();
  const hideSidebarRoutes = ["/login", "/register"];
  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname);

  // Listen for window resize to detect desktop vs mobile
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Xác định class margin cho main content
  const getMainMarginClass = () => {
    if (shouldHideSidebar) return "ml-0";
    if (isDesktop && isSidebarOpen) return "ml-[260px]";
    return "ml-0"; // Mobile hoặc sidebar đang đóng
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar toggleSidebar={toggleSidebar} />

      <div className="md:flex flex-1 relative">
        {!shouldHideSidebar && (
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        )}

        <main
          className={`flex-grow p-4 mt-[64px] transition-all duration-300 ${getMainMarginClass()}`}
        >
          <Outlet />
          {children}
        </main>
      </div>
    </div>
  );
}