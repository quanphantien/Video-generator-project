import React from 'react';
import { Link } from 'react-router-dom';
// import { auth } from '../../firebase-config'; // You'll need to set up Firebase config
// import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        // const provider = new GoogleAuthProvider();
        try {
            // await signInWithPopup(auth, provider);
            navigate('/dashboard'); // Redirect after successful login
        } catch (error) {
            console.error('Error signing in with Google:', error);
        }
    };

    return (
        <div className="h-[600px] flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-purple-600 mb-6">Đăng nhập</h2>
                <button
                    onClick={async () => {
                        await handleGoogleLogin();
                        window.location.reload();
                        setTimeout(() => {
                            navigate('/dashboard');
                        }, 100);
                    }}
                    className="w-full flex items-center justify-center bg-white border border-gray-300 rounded-lg px-6 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 mb-4"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="w-6 h-6 mr-2" />
                    Đăng nhập với Google
                </button>
            </div>
        </div>
    );
};

export default Login;