import React from "react";
import "./NavBar.css";
import Logo from "../../assets/logo.svg"; // Import logo if needed

const Navbar = () => {
  return (
    <nav className="navbar-bg flex justify-between items-center px-6 py-4">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src={Logo} alt="Convease Logo" style={{ height: '40px' }} />
        <div className="text-black text-2xl">
          Convease
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
