import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const Dropdown = ({ 
  options = [], 
  placeholder = "Chọn một tùy chọn...", 
  onSelect = () => {},
  defaultValue = null,
  disabled = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(defaultValue);
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (option) => {
    if(option.onClick) {
      option.onClick();
    }
    setIsOpen(false);
    onSelect(option);
  };

  return (
    <div className={`relative inline-block w-full ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm
          hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-200 ease-in-out
          ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'cursor-pointer'}
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-500' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption ? (
              React.isValidElement(selectedOption.label) ? selectedOption.label : selectedOption.label
            ) : placeholder}
          </span>
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="py-1 max-h-60 overflow-auto">
            {options.length === 0 ? (
              <div className="px-4 py-2 text-gray-500 text-sm">
                Không có tùy chọn nào
              </div>
            ) : (
              options.map((option, index) => (
                <button
                  key={option.value || index}
                  type="button"
                  onClick={(() => handleSelect(option))}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors duration-150 text-gray-900"
                >
                  {React.isValidElement(option.label) ? option.label : option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default Dropdown;