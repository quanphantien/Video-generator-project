import React from 'react'
import './Sidebar.css'
import { SidebarData } from './SidebarData'

import { FaHome, FaChartBar, FaProjectDiagram, FaSignOutAlt } from "react-icons/fa";

const Sidebar = () => {
    return (
        <div className="sidebar bg-purple-600 text-white h-auto p-4 shadow-lg">
            <nav className="flex flex-col gap-2">
                {SidebarData.map((item, index) => (
                    <a key={index} href={item.path} className="flex items-center gap-2 text-base hover:bg-purple-700 p-2 rounded-lg transition">
                        {item.icon}
                        <span>{item.title}</span>
                    </a>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
