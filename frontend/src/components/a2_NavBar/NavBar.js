import React from "react";
import "./NavBar.css";

const Navbar = () => {
  return (
    <nav className="navbar-bg flex justify-between items-center px-6 py-4">
      <div className="text-white font-bold text-xl">
        TrendyWeb
      </div>
      <div>
        <img
          className="avatar rounded-full w-10 h-10"
          src="https://i.pravatar.cc/40" // ảnh avatar mẫu
          alt="User Avatar"
        />
      </div>
    </nav>
  );
};

export default Navbar;
