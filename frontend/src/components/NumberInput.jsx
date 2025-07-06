import React from 'react';

const NumberInput = ({ 
  label = "Số lượng", 
  value, 
  onChange, 
  min = 1, 
  max = 50, 
  placeholder = "Nhập số...",
  className = "",
  disabled = false,
  required = false
}) => {
  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    
    // Cho phép nhập rỗng để user có thể xóa hết
    if (inputValue === '') {
      onChange('');
      return;
    }

    // Chỉ cho phép số
    const numericValue = parseInt(inputValue, 10);
    
    if (!isNaN(numericValue)) {
      // Kiểm tra min/max
      if (numericValue >= min && numericValue <= max) {
        onChange(numericValue);
      } else if (numericValue < min) {
        onChange(min);
      } else if (numericValue > max) {
        onChange(max);
      }
    }
  };

  const handleBlur = () => {
    // Nếu để trống, set về min value
    if (value === '' || value < min) {
      onChange(min);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${disabled ? 'text-gray-500' : 'text-gray-900'}
          `}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
          {min}-{max}
        </div>
      </div>
      {(min || max) && (
        <div className="text-xs text-gray-500 mt-1">
          Giá trị từ {min} đến {max}
        </div>
      )}
    </div>
  );
};

export default NumberInput;
