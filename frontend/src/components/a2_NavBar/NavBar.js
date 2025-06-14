import React from "react";
import "./NavBar.css";
import Logo from "../../assets/logo.svg"; // Import logo if needed

const Navbar = () => {
  return (
    <nav className="navbar-bg flex justify-between items-center px-6 py-4">
      <div className="flex items-center">
        <img src={Logo} alt="Convease Logo" style={{ height: '40px' }} />
        <div className="text-white text-2xl ml-3">
          Convease
        </div>
      </div>
      {/* <div>
        <img
          className="avatar rounded-full w-10 h-10"
          src="https://i.pravatar.cc/40" // ảnh avatar mẫu
          alt="User Avatar"
        />
      </div> */}
    </nav>
  );
};

export default Navbar;
