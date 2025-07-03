import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import { useGet, usePost, usePut } from '../../hooks/useApi';
import { authService } from '../../services/authService';

const UserProfile = () => {
    const { currentUser, isAuthenticated } = useAuth();
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch user profile on component mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchUserProfile();
        }
    }, [isAuthenticated]);

    const fetchUserProfile = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await authService.getCurrentUser();
            if (response.code === 'SUCCESS') {
                setUserInfo(response.data);
            }
        } catch (err) {
            setError(err.message || 'Không thể lấy thông tin người dùng');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-600">Vui lòng đăng nhập để xem thông tin cá nhân.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
                <button
                    onClick={fetchUserProfile}
                    className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin cá nhân</h2>
            
            <div className="space-y-4">
                {userInfo ? (
                    <>
                        <div className="flex items-center space-x-4">
                            {userInfo.avatar_url ? (
                                <img
                                    src={userInfo.avatar_url}
                                    alt="Avatar"
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            ) : currentUser?.photoURL ? (
                                <img
                                    src={currentUser.photoURL}
                                    alt="Avatar"
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                                    <span className="text-purple-600 text-xl font-bold">
                                        {(userInfo.username || currentUser?.displayName || 'U')[0].toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    {userInfo.username || currentUser?.displayName || 'Không có tên'}
                                </h3>
                                <p className="text-gray-600">{userInfo.email || currentUser?.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="block text-sm font-medium text-gray-700">ID</label>
                                <p className="mt-1 text-sm text-gray-900">{userInfo.id}</p>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <p className="mt-1 text-sm text-gray-900">{userInfo.email}</p>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="block text-sm font-medium text-gray-700">Tên người dùng</label>
                                <p className="mt-1 text-sm text-gray-900">{userInfo.username}</p>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="block text-sm font-medium text-gray-700">Loại tài khoản</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {currentUser?.uid ? 'Google Account' : 'Local Account'}
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Không có thông tin người dùng</p>
                    </div>
                )}
            </div>

            <div className="mt-6 flex space-x-4">
                <button
                    onClick={fetchUserProfile}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    Làm mới thông tin
                </button>
            </div>
        </div>
    );
};

export default UserProfile;
