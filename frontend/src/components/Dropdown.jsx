import React, { useState } from 'react';
import axios from 'axios';
const Dropdown = () => {
  const options = ['Youtube', 'Tiktok', 'Google'];
  const [selected, setSelected] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (option) => {
    setLoading(true);
    if(option=== 'Youtube') {
      const response = await axios.get(`${process.env.REACT_APP_CONVEASE_API_BASE_URL}go-trends/youtube-trending`);}
        // setSelected(response);}
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left w-64">
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex justify-between w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {selected || 'Select an option'}
          <svg
            className="w-5 h-5 ml-2 -mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.939l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0l-4.25-4.25a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute mt-2 w-full rounded-md bg-white shadow-lg z-10">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
