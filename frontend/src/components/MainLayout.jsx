// MainLayout.jsx
import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./a2_NavBar/NavBar";
import Sidebar from "./b_Sidebar/Sidebar";

export default function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const location = useLocation();
  const hideSidebarRoutes = ["/login", "/register"];
  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar toggleSidebar={toggleSidebar} />

      <div className="md:flex flex-1 relative">
        {!shouldHideSidebar && (
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        )}

        <main
          className={`flex-grow p-4 mt-[64px] transition-all ${
            shouldHideSidebar ? "ml-0" : "ml-0 md:ml-[260px]"
          }`}
        >
          <Outlet />
          {children}
        </main>
      </div>
    </div>
  );
}
