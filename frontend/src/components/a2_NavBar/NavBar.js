// import React from "react";
// import { useNavigate } from "react-router-dom";
// import "./NavBar.css";
// import Logo from "../../assets/logo.svg"; // Import logo if needed

// const Navbar = () => {
//   const [isLoggedIn, setIsLoggedIn] = React.useState(false); // Add state for login status

//   const navigate = useNavigate(); // Add this at the top of the component

//   const location = window.location.pathname; // Get current path

//   return (
//     <nav className="navbar-bg flex justify-between items-center px-6 py-4">

// {/* //       <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
// //            <img src={Logo} alt="Convease Logo" style={{ height: '40px' }} />
// //       <div className="text-black text-2xl">
// //         Convease
// //       </div> */}

//       <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//         <img src={Logo} alt="Convease Logo" style={{ height: '40px' }} />
//         <div className="text-black text-2xl">
//           Convease
//         </div>
//       </div>
//       <div>
//         {isLoggedIn ? (
//           <img
//             className="avatar rounded-full w-10 h-10"
//             src="https://i.pravatar.cc/40"
//             alt="User Avatar"
//           />
//         ) : location !== '/login' && (
//           <button
//             className="text-white px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700"
//             onClick={() => navigate('/login')}
//           >
//             Login
//           </button>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NavBar.css";
import Logo from "../../assets/logo.svg";
import { FaBars } from "react-icons/fa";
import { useAuth } from "../../context/authContext";

const Navbar = ({ toggleSidebar }) => {
  const [user, setUser] = useState(null);
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = window.location.pathname;

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const checkUserLogin = () => {
      const userData = localStorage.getItem("user");
      const accessToken = localStorage.getItem("accessToken");

      if (userData && accessToken) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error("Error parsing user data:", error);
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      } else {
        setUser(null);
      }
    };

    checkUserLogin();

    // Lắng nghe sự thay đổi trong localStorage
    const handleUserLogin = () => {
      checkUserLogin();
    };

    const handleUserLogout = () => {
      setUser(null);
    };

    window.addEventListener("userLogin", handleUserLogin);
    window.addEventListener("userLogout", handleUserLogout);

    return () => {
      window.removeEventListener("userLogin", handleUserLogin);
      window.removeEventListener("userLogout", handleUserLogout);
    };
  }, []);

  // Hàm đăng xuất
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback logout
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      navigate("/");
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <nav className="navbar-bg flex justify-between items-center px-6 py-4 h-16 shadow-md fixed top-0 left-0 right-0 bg-white z-50">
      <div className="flex items-center gap-4">
        <button
          className="text-purple-600 text-xl mr-2"
          onClick={toggleSidebar}
          title="Ẩn/hiện menu"
        >
          <FaBars />
        </button>

        {/* Logo + tên */}
        <img src={Logo} alt="Convease Logo" style={{ height: "40px" }} />
        <div className="text-black text-2xl font-semibold">Convease</div>
      </div>

      {/* Nút login/avatar */}
      <div>
        {user ? (
          // Hiển thị avatar và dropdown menu khi đã đăng nhập
          <div className="relative group">
            {user.photoURL ? (
              // ✅ Có ảnh -> dùng ảnh thật
              <img
                className="avatar rounded-full w-10 h-10 cursor-pointer border-2 border-gray-300 hover:border-blue-500"
                src={user.photoURL}
                alt="User Avatar"
                title={user.displayName || user.email}
              />
            ) : (
              // ❌ Không có ảnh -> dùng chữ cái đầu
              <div
                className="avatar rounded-full w-10 h-10 bg-purple-600 text-white flex items-center justify-center font-semibold cursor-pointer"
                title={user.displayName || user.email}
              >
                {getInitials(user.displayName || user.email)}
              </div>
            )}

            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-1">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <div className="font-medium truncate">{user.displayName}</div>
                  <div className="text-xs text-gray-500 truncate break-all">
                    {user.email}
                  </div>
                </div>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        ) : (
          location !== "/login" &&
          location !== "/register" && (
            // Hiển thị nút login khi chưa đăng nhập và nút register
            <div className="flex space-x-2">
              {location !== "/login" && location !== "/register" && (
                <>
                  <button
                    className="text-purple-600 border border-purple-600 px-4 py-2 rounded-md hover:bg-purple-50"
                    onClick={() => navigate("/register")}
                  >
                    Đăng ký
                  </button>
                  <button
                    className="text-white px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700"
                    onClick={() => navigate("/login")}
                  >
                    Đăng nhập
                  </button>
                </>
              )}
            </div>
          )
        )}
      </div>
    </nav>
  );
};

export default Navbar;
