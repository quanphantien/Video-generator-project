import React from 'react';

const VideoNameInput = ({ 
  label = "Tên video", 
  value, 
  onChange, 
  placeholder = "Nhập tên video...",
  className = "",
  disabled = false,
  required = false
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${disabled ? 'text-gray-500' : 'text-gray-900'}
        `}
      />
    </div>
  );
};

export default VideoNameInput;
