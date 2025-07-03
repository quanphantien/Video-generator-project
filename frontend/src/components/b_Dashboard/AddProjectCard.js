import React from 'react';
import { FaPlus } from 'react-icons/fa';

const AddProjectCard = ({ onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50"
        >
            <div className="h-40 flex items-center justify-center">
                <div className="text-center">
                    <FaPlus className="text-4xl text-gray-400 mb-2 mx-auto" />
                    <p className="text-gray-500 font-medium">Thêm Project Mới</p>
                </div>
            </div>

            <div className="p-4">
                <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                        Tạo một dự án video mới với AI
                    </p>
                    <div className="bg-purple-100 text-purple-600 px-4 py-2 rounded-lg">
                        <span className="text-sm font-medium">Bắt đầu ngay</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddProjectCard;