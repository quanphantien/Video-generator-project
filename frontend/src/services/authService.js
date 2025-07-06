import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_CONVEASE_API_BASE_URL || 'http://127.0.0.1:8000';

// Tạo axios instance với interceptor
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor để thêm token vào headerr
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý token hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          // Tạo một axios instance riêng cho refresh token để tránh circular dependency
          // Không dùng api instance vì nó có interceptor, sẽ gây vòng lặp vô tận
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // Retry request gốc với token mới
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token cũng hết hạn, đăng xuất
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  // Đăng ký với email/password
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đăng nhập với email/password
  login: async (username, password) => {
    try {
      const formData = new FormData();
      formData.append('grant_type', 'password');
      formData.append('username', username);
      formData.append('password', password);
      formData.append('scope', '');
      formData.append('client_id', 'string');
      formData.append('client_secret', 'string');
      
      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đăng nhập với Google
  loginWithGoogle: async (idToken, userInfo = {}) => {
    try {
      const response = await api.post('/auth/login/google', {
        firebase_token: idToken,
        email: userInfo.email,
        name: userInfo.name,
        photo: userInfo.photo
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('/auth/refresh', {
        refresh_token: refreshToken
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

export default api;



















// import axios from 'axios';
// import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
// import { auth } from '../firebase-config';

// const API_BASE_URL = process.env.REACT_APP_CONVEASE_API_BASE_URL || 'http://127.0.0.1:8000';

// // Tạo axios instance với interceptor
// const api = axios.create({
//   baseURL: API_BASE_URL,
// });

// // Request interceptor để thêm token vào header
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('accessToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor để xử lý token hết hạn
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       const refreshToken = localStorage.getItem('refreshToken');
//       if (refreshToken) {
//         try {
//           const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
//             refresh_token: refreshToken
//           });

//           const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
//           localStorage.setItem('accessToken', accessToken);
//           localStorage.setItem('refreshToken', newRefreshToken);

//           originalRequest.headers.Authorization = `Bearer ${accessToken}`;
//           return api(originalRequest);
//         } catch (refreshError) {
//           localStorage.removeItem('accessToken');
//           localStorage.removeItem('refreshToken');
//           localStorage.removeItem('user');
//           localStorage.removeItem('googleAccessToken');
//           localStorage.removeItem('currentUser');
//           window.location.href = '/login';
//           return Promise.reject(refreshError);
//         }
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export const authService = {
//   // Đăng ký với email/password
//   register: async (userData) => {
//     try {
//       const response = await api.post('/auth/register', userData);
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Đăng nhập với email/password
//   login: async (username, password) => {
//     try {
//       const formData = new FormData();
//       formData.append('grant_type', 'password');
//       formData.append('username', username);
//       formData.append('password', password);
//       formData.append('scope', '');
//       formData.append('client_id', 'string');
//       formData.append('client_secret', 'string');

//       const response = await api.post('/auth/login', formData, {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         }
//       });
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Đăng nhập với Google - Updated method
//   loginWithGoogle: async () => {
//     // Clear any existing tokens
//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("refreshToken");

//     const provider = new GoogleAuthProvider();

//     // Add required scopes for YouTube functionality
//     provider.addScope("https://www.googleapis.com/auth/youtube.readonly");
//     provider.addScope("https://www.googleapis.com/auth/youtube.upload");
//     provider.addScope("https://www.googleapis.com/auth/yt-analytics.readonly");
//     provider.addScope("email");
//     provider.addScope("profile");

//     try {
//       console.log('Starting Google login...');
//       const result = await signInWithPopup(auth, provider);
//       const user = result.user;
//       const credential = GoogleAuthProvider.credentialFromResult(result);
//       const googleAccessToken = credential?.accessToken;

//       if (!googleAccessToken) {
//         throw new Error("Failed to obtain Google access token");
//       }

//       console.log('Google login successful, user:', user);

//       const userData = {
//         firebase_uid: user.uid,
//         username: user.displayName || user.email?.split('@')[0] || "None",
//         email: user.email,
//         photoURL: user.photoURL || "",
//         google_access_token: googleAccessToken
//       };

//       console.log('Sending user data to backend:', userData);

//       // Send user data to backend
//       const response = await api.post('/auth/login/google', userData);

//       console.log('Backend response:', response.data);

//       if (response.data.code === 200) {
//         const backendData = response.data.data;

//         // Store backend tokens
//         if (backendData.accessToken) {
//           localStorage.setItem('accessToken', backendData.accessToken);
//         }
//         if (backendData.refreshToken) {
//           localStorage.setItem('refreshToken', backendData.refreshToken);
//         }

//         // Store Google access token for YouTube API
//         localStorage.setItem("googleAccessToken", googleAccessToken);

//         // Store user info
//         const userInfo = {
//           id: backendData.user?.id || user.uid,
//           user_id: backendData.user?.user_id || user.uid,
//           firebase_uid: user.uid,
//           username: user.displayName || backendData.user?.username || userData.username,
//           email: user.email || backendData.user?.email,
//           photoURL: user.photoURL || backendData.user?.photoURL || "",
//           avatar_url: user.photoURL || backendData.user?.avatar_url || ""
//         };

//         localStorage.setItem("user", JSON.stringify(userInfo));
//         localStorage.setItem("currentUser", JSON.stringify(userInfo));

//         // Return combined data
//         return {
//           code: 200,
//           data: {
//             accessToken: backendData.accessToken,
//             refreshToken: backendData.refreshToken,
//             user: userInfo,
//             googleAccessToken
//           }
//         };
//       } else {
//         throw new Error(response.data.message || "Backend authentication failed");
//       }
//     } catch (error) {
//       console.error('Google login error:', error);

//       // Clean up on error
//       localStorage.removeItem("accessToken");
//       localStorage.removeItem("refreshToken");
//       localStorage.removeItem("googleAccessToken");
//       localStorage.removeItem("user");
//       localStorage.removeItem("currentUser");

//       throw error;
//     }
//   },

//   // Alternative method using idToken (if your backend prefers this approach)
//   loginWithGoogleIdToken: async (idToken) => {
//     try {
//       const response = await api.post('/auth/login/google', null, {
//         params: { token: idToken }
//       });
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Lấy thông tin user hiện tại
//   getCurrentUser: async () => {
//     try {
//       const response = await api.get('/auth/me');
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Refresh token
//   refreshToken: async (refreshToken) => {
//     try {
//       const response = await api.post('/auth/refresh', {
//         refresh_token: refreshToken
//       });
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Đăng xuất
//   logout: () => {
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//     localStorage.removeItem('user');
//     localStorage.removeItem('googleAccessToken');
//     localStorage.removeItem('currentUser');
//   }
// };

// // Export individual Google sign-in function for compatibility
// export const signInWithGoogle = authService.loginWithGoogle;

// export default api;



























// import axios from 'axios';
// import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
// import { auth } from '../firebase-config';

// const API_BASE_URL = process.env.REACT_APP_CONVEASE_API_BASE_URL || 'http://127.0.0.1:8000';

// // Tạo axios instance với interceptor
// const api = axios.create({
//   baseURL: API_BASE_URL,
// });

// // Request interceptor để thêm token vào header
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('accessToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor để xử lý token hết hạn
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       const refreshToken = localStorage.getItem('refreshToken');
//       if (refreshToken) {
//         try {
//           const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
//             refresh_token: refreshToken
//           });

//           const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
//           localStorage.setItem('accessToken', accessToken);
//           localStorage.setItem('refreshToken', newRefreshToken);

//           originalRequest.headers.Authorization = `Bearer ${accessToken}`;
//           return api(originalRequest);
//         } catch (refreshError) {
//           localStorage.removeItem('accessToken');
//           localStorage.removeItem('refreshToken');
//           localStorage.removeItem('user');
//           localStorage.removeItem('googleAccessToken');
//           localStorage.removeItem('currentUser');
//           window.location.href = '/login';
//           return Promise.reject(refreshError);
//         }
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export const authService = {
//   // Đăng ký với email/password
//   register: async (userData) => {
//     try {
//       const response = await api.post('/auth/register', userData);
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Đăng nhập với email/password
//   login: async (username, password) => {
//     try {
//       const formData = new FormData();
//       formData.append('grant_type', 'password');
//       formData.append('username', username);
//       formData.append('password', password);
//       formData.append('scope', '');
//       formData.append('client_id', 'string');
//       formData.append('client_secret', 'string');

//       const response = await api.post('/auth/login', formData, {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         }
//       });
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Đăng nhập với Google - Updated method
//   loginWithGoogle: async () => {
//     // Clear any existing tokens
//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("refreshToken");

//     const provider = new GoogleAuthProvider();

//     // Add required scopes for YouTube functionality
//     provider.addScope("https://www.googleapis.com/auth/youtube.readonly");
//     provider.addScope("https://www.googleapis.com/auth/youtube.upload");
//     provider.addScope("https://www.googleapis.com/auth/yt-analytics.readonly");
//     provider.addScope("email");
//     provider.addScope("profile");

//     try {
//       console.log('Starting Google login...');
//       const result = await signInWithPopup(auth, provider);
//       const user = result.user;
//       const credential = GoogleAuthProvider.credentialFromResult(result);
//       const googleAccessToken = credential?.accessToken;

//       if (!googleAccessToken) {
//         throw new Error("Failed to obtain Google access token");
//       }

//       console.log('Google login successful, user:', user);

//       // Lấy ID Token từ Firebase
//       const idToken = await user.getIdToken();
//       console.log('Got ID token');

//       // Method 1: Gửi ID Token qua query params (clean request)
//       try {
//         console.log('Trying method 1: ID Token via query params');
//         const response = await api.post('/auth/login/google', {}, {
//           params: { token: idToken }
//         });

//         console.log('Method 1 successful, backend response:', response.data);

//         if (response.data.code === 200) {
//           const backendData = response.data.data;

//           // Store backend tokens
//           if (backendData.accessToken) {
//             localStorage.setItem('accessToken', backendData.accessToken);
//           }
//           if (backendData.refreshToken) {
//             localStorage.setItem('refreshToken', backendData.refreshToken);
//           }

//           // Store Google access token for YouTube API
//           localStorage.setItem("googleAccessToken", googleAccessToken);

//           // Store user info
//           const userInfo = {
//             id: backendData.user?.id || user.uid,
//             user_id: backendData.user?.user_id || user.uid,
//             firebase_uid: user.uid,
//             username: user.displayName || backendData.user?.username || user.email?.split('@')[0],
//             email: user.email || backendData.user?.email,
//             photoURL: user.photoURL || backendData.user?.photoURL || "",
//             avatar_url: user.photoURL || backendData.user?.avatar_url || ""
//           };

//           localStorage.setItem("user", JSON.stringify(userInfo));
//           localStorage.setItem("currentUser", JSON.stringify(userInfo));

//           return {
//             code: 200,
//             data: {
//               accessToken: backendData.accessToken,
//               refreshToken: backendData.refreshToken,
//               user: userInfo,
//               googleAccessToken
//             }
//           };
//         }
//       } catch (error1) {
//         console.log('Method 1 failed:', error1.response?.data);
//         console.log('Method 1 status:', error1.response?.status);

//         // Method 2: Gửi user data dạng JSON (không có query params)
//         const userData = {
//           firebase_uid: user.uid,
//           username: user.displayName || user.email?.split('@')[0] || "None",
//           email: user.email,
//           photoURL: user.photoURL || "",
//           google_access_token: googleAccessToken,
//           id_token: idToken
//         };

//         console.log('Trying method 2: User data JSON (no query params):', userData);

//         try {
//           const response = await api.post('/auth/login/google', userData, {
//             headers: {
//               'Content-Type': 'application/json',
//             }
//           });

//           console.log('Method 2 successful, backend response:', response.data);

//           if (response.data.code === 200) {
//             const backendData = response.data.data;

//             // Store backend tokens
//             if (backendData.accessToken) {
//               localStorage.setItem('accessToken', backendData.accessToken);
//             }
//             if (backendData.refreshToken) {
//               localStorage.setItem('refreshToken', backendData.refreshToken);
//             }

//             // Store Google access token for YouTube API
//             localStorage.setItem("googleAccessToken", googleAccessToken);

//             // Store user info
//             const userInfo = {
//               id: backendData.user?.id || user.uid,
//               user_id: backendData.user?.user_id || user.uid,
//               firebase_uid: user.uid,
//               username: user.displayName || backendData.user?.username || userData.username,
//               email: user.email || backendData.user?.email,
//               photoURL: user.photoURL || backendData.user?.photoURL || "",
//               avatar_url: user.photoURL || backendData.user?.avatar_url || ""
//             };

//             localStorage.setItem("user", JSON.stringify(userInfo));
//             localStorage.setItem("currentUser", JSON.stringify(userInfo));

//             return {
//               code: 200,
//               data: {
//                 accessToken: backendData.accessToken,
//                 refreshToken: backendData.refreshToken,
//                 user: userInfo,
//                 googleAccessToken
//               }
//             };
//           }
//         } catch (error2) {
//           console.log('Method 2 failed:', error2.response?.data);
//           console.log('Method 2 status:', error2.response?.status);

//           // Method 3: Gửi ID Token trong body
//           const tokenData = {
//             token: idToken,
//             firebase_uid: user.uid,
//             email: user.email,
//             username: user.displayName || user.email?.split('@')[0] || "None",
//             photoURL: user.photoURL || ""
//           };

//           console.log('Trying method 3: ID Token in body:', tokenData);

//           try {
//             const response = await api.post('/auth/login/google', tokenData, {
//               headers: {
//                 'Content-Type': 'application/json',
//               }
//             });

//             console.log('Method 3 successful, backend response:', response.data);

//             if (response.data.code === 200) {
//               const backendData = response.data.data;

//               // Store backend tokens
//               if (backendData.accessToken) {
//                 localStorage.setItem('accessToken', backendData.accessToken);
//               }
//               if (backendData.refreshToken) {
//                 localStorage.setItem('refreshToken', backendData.refreshToken);
//               }

//               // Store Google access token for YouTube API
//               localStorage.setItem("googleAccessToken", googleAccessToken);

//               // Store user info
//               const userInfo = {
//                 id: backendData.user?.id || user.uid,
//                 user_id: backendData.user?.user_id || user.uid,
//                 firebase_uid: user.uid,
//                 username: user.displayName || backendData.user?.username || tokenData.username,
//                 email: user.email || backendData.user?.email,
//                 photoURL: user.photoURL || backendData.user?.photoURL || "",
//                 avatar_url: user.photoURL || backendData.user?.avatar_url || ""
//               };

//               localStorage.setItem("user", JSON.stringify(userInfo));
//               localStorage.setItem("currentUser", JSON.stringify(userInfo));

//               return {
//                 code: 200,
//                 data: {
//                   accessToken: backendData.accessToken,
//                   refreshToken: backendData.refreshToken,
//                   user: userInfo,
//                   googleAccessToken
//                 }
//               };
//             }
//           } catch (error3) {
//             console.log('Method 3 failed:', error3.response?.data);
//             console.log('Method 3 status:', error3.response?.status);

//             // Method 4: Gửi dạng FormData
//             const formData = new FormData();
//             formData.append('token', idToken);
//             formData.append('firebase_uid', user.uid);
//             formData.append('username', user.displayName || user.email?.split('@')[0] || "None");
//             formData.append('email', user.email || '');
//             formData.append('photoURL', user.photoURL || '');
//             formData.append('google_access_token', googleAccessToken);

//             console.log('Trying method 4: FormData');

//             const response = await api.post('/auth/login/google', formData, {
//               headers: {
//                 'Content-Type': 'multipart/form-data',
//               }
//             });

//             console.log('Method 4 successful, backend response:', response.data);

//             if (response.data.code === 200) {
//               const backendData = response.data.data;

//               // Store backend tokens
//               if (backendData.accessToken) {
//                 localStorage.setItem('accessToken', backendData.accessToken);
//               }
//               if (backendData.refreshToken) {
//                 localStorage.setItem('refreshToken', backendData.refreshToken);
//               }

//               // Store Google access token for YouTube API
//               localStorage.setItem("googleAccessToken", googleAccessToken);

//               // Store user info
//               const userInfo = {
//                 id: backendData.user?.id || user.uid,
//                 user_id: backendData.user?.user_id || user.uid,
//                 firebase_uid: user.uid,
//                 username: user.displayName || backendData.user?.username || tokenData.username,
//                 email: user.email || backendData.user?.email,
//                 photoURL: user.photoURL || backendData.user?.photoURL || "",
//                 avatar_url: user.photoURL || backendData.user?.avatar_url || ""
//               };

//               localStorage.setItem("user", JSON.stringify(userInfo));
//               localStorage.setItem("currentUser", JSON.stringify(userInfo));

//               return {
//                 code: 200,
//                 data: {
//                   accessToken: backendData.accessToken,
//                   refreshToken: backendData.refreshToken,
//                   user: userInfo,
//                   googleAccessToken
//                 }
//               };
//             }
//           }
//         }
//       }

//       throw new Error("All authentication methods failed");

//     } catch (error) {
//       console.error('Google login error:', error);

//       // Clean up on error
//       localStorage.removeItem("accessToken");
//       localStorage.removeItem("refreshToken");
//       localStorage.removeItem("googleAccessToken");
//       localStorage.removeItem("user");
//       localStorage.removeItem("currentUser");

//       // Preserve Firebase auth errors
//       if (error.code && error.code.startsWith('auth/')) {
//         throw error;
//       }

//       throw new Error(error.response?.data?.message || error.message || 'Google login failed');
//     }
//   },

//   // Lấy thông tin user hiện tại
//   getCurrentUser: async () => {
//     try {
//       const response = await api.get('/auth/me');
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Refresh token
//   refreshToken: async (refreshToken) => {
//     try {
//       const response = await api.post('/auth/refresh', {
//         refresh_token: refreshToken
//       });
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Đăng xuất
//   logout: () => {
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//     localStorage.removeItem('user');
//     localStorage.removeItem('googleAccessToken');
//     localStorage.removeItem('currentUser');
//   }
// };

// // Export individual Google sign-in function for compatibility
// export const signInWithGoogle = authService.loginWithGoogle;

// export default api;