import React from "react";
import { useNavigate } from "react-router-dom";
import "./NavBar.css";
import Logo from "../../assets/logo.svg"; // Import logo if needed

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false); // Add state for login status

  const navigate = useNavigate(); // Add this at the top of the component

  const location = window.location.pathname; // Get current path

  return (
    <nav className="navbar-bg flex justify-between items-center px-6 py-4">

{/* //       <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
//            <img src={Logo} alt="Convease Logo" style={{ height: '40px' }} />
//       <div className="text-black text-2xl">
//         Convease
//       </div> */}

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src={Logo} alt="Convease Logo" style={{ height: '40px' }} />
        <div className="text-black text-2xl">
          Convease
        </div>
      </div>
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
