// Sidebar.js
import React, { useState } from 'react';
import './Sidebar.css';
import { SidebarData } from './SidebarData';
import { useLocation } from "react-router-dom";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  return (
    <div className={`sidebar-container ${isOpen ? 'open' : ''}`}>
      <nav className="sidebar">
        {SidebarData.map((item, index) => (
          <a
            key={index}
            href={item.path}
            className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={toggleSidebar} // auto close on click (mobile UX)
          >
            {item.icon}
            <span>{item.title}</span>
          </a>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
