import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase-config';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/authContext';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { loginWithGoogle } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Xóa lỗi khi user bắt đầu  nhập
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Tên người dùng hoặc email không được để trống';
        }

        if (!formData.password) {
            newErrors.password = 'Mật khẩu không được để trống';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const response = await authService.login(formData.username, formData.password);
            if (response.code === 200) {
                // Lưu token vào localStorage
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                
                // Lấy thông tin user
                try {
                    const userResponse = await authService.getCurrentUser();
                    console.log('User response:', userResponse);
                    if (userResponse.code === 200) {
                        localStorage.setItem('user', JSON.stringify({
                            id: userResponse.data.id,
                            email: userResponse.data.email,
                            username: userResponse.data.username,
                            avatar_url: userResponse.data.avatar_url
                        }));
                    }
                } catch (userError) {
                    console.warn('Could not fetch user info:', userError);
                }

                // Trigger custom event để cập nhật navbar
                window.dispatchEvent(new Event('userLogin'));

                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Login error:', error);
            if (error.error && Array.isArray(error.error)) {
                // Hiển thị lỗi từ server
                const serverErrors = {};
                error.error.forEach(err => {
                    if (err.field) {
                        serverErrors[err.field] = err.message;
                    }
                });
                setErrors(serverErrors);
            } else {
                setErrors({
                    general: error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();

            // Debug: Log token để kiểm tra
            console.log('Firebase token:', idToken);
            console.log('Token length:', idToken.length);
            
            const response = await authService.loginWithGoogle(idToken);
            
            if (response.code === 200) {
                // Lưu token vào localStorage
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                
                // Lưu thông tin user từ Firebase
                localStorage.setItem('user', JSON.stringify({
                    uid: result.user.uid,
                    email: result.user.email,
                    displayName: result.user.displayName,
                    photoURL: result.user.photoURL
                }));

                // Trigger custom event để cập nhật navbar
                window.dispatchEvent(new Event('userLogin'));

                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Error signing in with Google:', error);
            alert('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Đăng nhập
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Hoặc{' '}
                        <Link
                            to="/register"
                            className="font-medium text-purple-600 hover:text-purple-500"
                        >
                            tạo tài khoản mới
                        </Link>
                    </p>
                </div>
                
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {errors.general && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                                {errors.general}
                            </div>
                        )}

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Tên người dùng hoặc Email
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                                    errors.username ? 'border-red-300' : 'border-gray-300'
                                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm`}
                                placeholder="Nhập tên người dùng hoặc email"
                            />
                            {errors.username && (
                                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Mật khẩu
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                                    errors.password ? 'border-red-300' : 'border-gray-300'
                                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm`}
                                placeholder="Nhập mật khẩu"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                                    loading 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                                }`}
                            >
                                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </button>
                        </div>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Hoặc</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                >
                                    <img 
                                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                                        alt="Google logo" 
                                        className="w-5 h-5 mr-2" 
                                    />
                                    Đăng nhập với Google
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;