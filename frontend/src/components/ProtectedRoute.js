import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireAuth = true }) => {
    const userData = localStorage.getItem('user');
    const isAuthenticated = !!userData;

    if (requireAuth && !isAuthenticated) {
        // Cần đăng nhập nhưng chưa đăng nhập -> redirect to login
        return <Navigate to="/login" replace />;
    }

    if (!requireAuth && isAuthenticated) {
        // Không cần đăng nhập nhưng đã đăng nhập -> redirect to dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;