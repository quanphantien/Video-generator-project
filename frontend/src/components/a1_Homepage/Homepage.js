import React from 'react';
import { Link } from 'react-router-dom';
import { FaVideo, FaMagic, FaRobot, FaShare } from 'react-icons/fa';

const Homepage = () => {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-500 text-white py-20">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-5xl font-bold mb-4">Tạo Video AI Chuyên Nghiệp</h1>
                    <p className="text-xl mb-8">Biến ý tưởng của bạn thành video chất lượng cao chỉ trong vài phút</p>
                    <Link
                        to="/login"
                        className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
                    >
                        Bắt đầu ngay
                    </Link>
                </div>
            </div>

            {/* Features Section */}
            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard
                        icon={<FaVideo />}
                        title="Tự động tạo video"
                        description="Chuyển đổi văn bản thành video với AI"
                    />
                    <FeatureCard
                        icon={<FaMagic />}
                        title="Hiệu ứng chuyên nghiệp"
                        description="Thêm hiệu ứng, chuyển cảnh tự động"
                    />
                    <FeatureCard
                        icon={<FaRobot />}
                        title="Giọng đọc AI"
                        description="Đa dạng giọng đọc tự nhiên"
                    />
                    <FeatureCard
                        icon={<FaShare />}
                        title="Xuất video đa nền tảng"
                        description="Tối ưu cho mọi mạng xã hội"
                    />
                </div>
            </div>

            {/* How It Works Section */}
            <div className="bg-gray-50 py-16">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12">Cách hoạt động</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <StepCard
                            number="1"
                            title="Nhập nội dung"
                            description="Nhập hoặc tải lên nội dung văn bản của bạn"
                        />
                        <StepCard
                            number="2"
                            title="Tùy chỉnh"
                            description="Chọn template, giọng đọc và hiệu ứng"
                        />
                        <StepCard
                            number="3"
                            title="Xuất video"
                            description="Tải xuống video chất lượng cao"
                        />
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-purple-600 text-white py-16">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-4">Sẵn sàng tạo video đầu tiên?</h2>
                    <p className="mb-8">Đăng ký ngay hôm nay và nhận 3 video miễn phí</p>
                    <Link
                        to="/register"
                        className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
                    >
                        Đăng ký miễn phí
                    </Link>
                </div>
            </div>
        </div>
    );
};

// Component phụ
const FeatureCard = ({ icon, title, description }) => (
    <div className="text-center p-6 border rounded-lg hover:shadow-lg transition">
        <div className="text-4xl text-purple-600 mb-4 flex justify-center">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

const StepCard = ({ number, title, description }) => (
    <div className="text-center">
        <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
            {number}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

export default Homepage;