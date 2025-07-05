import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(null);

    const loginWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const firebaseToken = await user.getIdToken();

            // Thêm log để debug
            const requestData = {
                firebase_token: firebaseToken,
                email: user.email,
                name: user.displayName,
                photo: user.photoURL
            };
            console.log('Sending data to backend:', requestData);

            const response = await fetch('http://127.0.0.1:8000/auth/login/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firebase_token: firebaseToken,
                    email: user.email,
                    name: user.displayName,
                    photo: user.photoURL
                }),
            });

            if (!response.ok) {
                // Log chi tiết lỗi 422
                const errorData = await response.json();
                console.error('Backend error details:', errorData);
                throw new Error(`Google login failed: ${response.status} - ${errorData.detail || 'Unknown error'}`);
            }

            const data = await response.json();

            if (data.access_token) {
                saveToken(data.access_token, data.refresh_token);

                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                    setCurrentUser(data.user);
                }

                setIsAuthenticated(true);
                window.dispatchEvent(new Event('userLogin'));

                return data;
            } else {
                throw new Error('No access token received from backend');
            }
        } catch (error) {
            console.error('Google login error:', error);
            throw error;
        }
    };

    // Token management utilities
    const saveToken = (accessToken, refreshToken = null) => {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }
        setToken(accessToken);
    };

    const clearTokens = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setToken(null);
    };

    const getToken = () => {
        return localStorage.getItem('token') || localStorage.getItem('accessToken');
    };

    const getRefreshToken = () => {
        return localStorage.getItem('refreshToken');
    };

    // Check if token is expired
    const isTokenExpired = (token) => {
        if (!token) return true;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            return payload.exp < currentTime;
        } catch (error) {
            console.error('Error checking token expiration:', error);
            return true;
        }
    };

    // Refresh token function
    const refreshAccessToken = async () => {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            const data = await response.json();
            if (data.access_token) {
                saveToken(data.access_token, data.refresh_token);
                return data.access_token;
            } else {
                throw new Error('No access token in response');
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            logout();
            throw error;
        }
    };

    // Get valid token (refresh if needed )
    const getValidToken = async () => {
        const currentToken = getToken();

        if (!currentToken) {
            return null;
        }

        if (isTokenExpired(currentToken)) {
            try {
                return await refreshAccessToken();
            } catch (error) {
                console.error('Failed to refresh token:', error);
                return null;
            }
        }

        return currentToken;
    };

    // Login function
    const login = async (credentials) => {
        try {
            const response = await fetch('http://127.0.0.1:8000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();

            if (data.access_token) {
                saveToken(data.access_token, data.refresh_token);

                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                    setCurrentUser(data.user);
                }

                setIsAuthenticated(true);
                window.dispatchEvent(new Event('userLogin'));

                return data;
            } else {
                throw new Error('No access token received');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    // Logout function
    const logout = async () => {
        try {
            // Đăng xuất khỏi Firebase nếu có
            if (auth.currentUser) {
                await signOut(auth);
            }

            // Xóa tất cả dữ liệu local
            clearTokens();
            setCurrentUser(null);
            setIsAuthenticated(false);

            // Trigger custom event để cập nhật navbar
            window.dispatchEvent(new Event('userLogout'));
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Check authentication status
    const checkAuthStatus = async () => {
        try {
            const accessToken = getToken();
            const user = localStorage.getItem('user');

            if (accessToken && user) {
                // Check if token is valid
                if (!isTokenExpired(accessToken)) {
                    const userData = JSON.parse(user);
                    setCurrentUser(userData);
                    setIsAuthenticated(true);
                    setToken(accessToken);
                } else {
                    // Try to refresh token
                    try {
                        await refreshAccessToken();
                        const userData = JSON.parse(user);
                        setCurrentUser(userData);
                        setIsAuthenticated(true);
                    } catch (error) {
                        console.error('Failed to refresh token during auth check:', error);
                        logout();
                    }
                }
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            logout();
        }
    };

    // Verify token with backend
    const verifyToken = async () => {
        const token = await getValidToken();
        if (!token) return false;

        try {
            const response = await fetch('http://127.0.0.1:8000/auth/verify', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            return response.ok;
        } catch (error) {
            console.error('Error verifying token:', error);
            return false;
        }
    };

    useEffect(() => {
        checkAuthStatus();

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const accessToken = getToken();
                if (!accessToken) {
                    console.log('Firebase user but no backend token - attempting to sync');
                    try {
                        const firebaseToken = await user.getIdToken();
                        // Sửa endpoint để khớp với loginWithGoogle
                        const response = await fetch('http://127.0.0.1:8000/auth/login/google', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                firebase_token: firebaseToken,
                                email: user.email,
                                name: user.displayName,
                                photo: user.photoURL
                            }),
                        });

                        if (response.ok) {
                            const data = await response.json();
                            if (data.access_token) {
                                saveToken(data.access_token, data.refresh_token);
                                if (data.user) {
                                    localStorage.setItem('user', JSON.stringify(data.user));
                                    setCurrentUser(data.user);
                                }
                                setIsAuthenticated(true);
                            }
                        } else {
                            // Log chi tiết lỗi để debug
                            const errorData = await response.json();
                            console.error('Backend error:', errorData);
                        }
                    } catch (error) {
                        console.error('Error syncing Firebase user with backend:', error);
                    }
                }
            }
            setLoading(false);
        });

        // Listen for custom auth events
        const handleUserLogin = () => {
            checkAuthStatus();
        };

        const handleUserLogout = () => {
            setCurrentUser(null);
            setIsAuthenticated(false);
            setToken(null);
        };

        window.addEventListener('userLogin', handleUserLogin);
        window.addEventListener('userLogout', handleUserLogout);

        return () => {
            unsubscribe();
            window.removeEventListener('userLogin', handleUserLogin);
            window.removeEventListener('userLogout', handleUserLogout);
        };
    }, []);

    const value = {
        currentUser,
        isAuthenticated,
        token,
        loading,
        login,
        loginWithGoogle,
        logout,
        checkAuthStatus,
        getToken,
        getValidToken,
        refreshAccessToken,
        verifyToken,
        isTokenExpired: (token) => isTokenExpired(token),
        saveToken,
        clearTokens
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};