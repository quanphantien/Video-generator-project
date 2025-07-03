import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const logout = async () => {
        try {
            // Đăng xuất khỏi Firebase
            await signOut(auth);
            // Xóa dữ liệu local
            authService.logout();
            setCurrentUser(null);
            setIsAuthenticated(false);
            // Trigger custom event để cập nhật navbar
            window.dispatchEvent(new Event('userLogout'));
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const checkAuthStatus = () => {
        const accessToken = localStorage.getItem('accessToken');
        const user = localStorage.getItem('user');
        
        if (accessToken && user) {
            try {
                const userData = JSON.parse(user);
                setCurrentUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error parsing user data:', error);
                authService.logout();
                setIsAuthenticated(false);
            }
        } else {
            setIsAuthenticated(false);
        }
    };

    useEffect(() => {
        // Kiểm tra auth status ban đầu
        checkAuthStatus();

        // Listen for Firebase auth changes
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User đăng nhập qua Firebase
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    // Nếu chưa có token backend, có thể cần đăng nhập với backend
                    console.log('Firebase user but no backend token');
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
        logout,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};