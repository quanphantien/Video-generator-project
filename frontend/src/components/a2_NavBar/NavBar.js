import React from "react";
import { useNavigate } from "react-router-dom";
import "./NavBar.css";
import Logo from "../../assets/logo.svg";
import { FaBars } from "react-icons/fa";

const Navbar = ({ toggleSidebar }) => {
  const [isLoggedIn] = React.useState(false);
  const navigate = useNavigate();
  const location = window.location.pathname;

  return (
    <nav className="navbar-bg flex justify-between items-center px-6 py-4 h-16 shadow-md fixed top-0 left-0 right-0 bg-white z-50">
      <div className="flex items-center gap-4">
        {/* Nút toggle menu chỉ hiển thị trên mobile */}
        <button
          className="md:hidden text-purple-600 text-xl"
          onClick={toggleSidebar}
        >
          <FaBars />
        </button>

        {/* Logo + tên */}
        <img src={Logo} alt="Convease Logo" style={{ height: "40px" }} />
        <div className="text-black text-2xl font-semibold">Convease</div>
      </div>

      {/* Nút login/avatar */}
      <div>
        {isLoggedIn ? (
          <img
            className="avatar rounded-full w-10 h-10"
            src="https://i.pravatar.cc/40"
            alt="User Avatar"
          />
        ) : location !== '/login' && (
          <button
            className="text-white px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
