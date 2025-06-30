// MainLayout.jsx
import React, { useState } from "react";
import Navbar from "./a2_NavBar/NavBar";
import Sidebar from "./b_Sidebar/Sidebar";
import { Outlet } from "react-router-dom";

export default function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar toggleSidebar={toggleSidebar} /> {/* Truyền toggleSidebar vào Navbar */}

      <div className="md:flex flex-1 relative">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="flex-grow p-4 mt-[64px] ml-0 md:ml-[260px] transition-all">
          <Outlet />
          {children}
        </main>
      </div>
    </div>
  );
}
