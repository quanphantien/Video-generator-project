import React from 'react';
import NumberInput from './NumberInput';
import LanguageSelect from './LanguageSelect';

const ScriptGenerationForm = ({
  topicInput,
  setTopicInput,
  language,
  setLanguage,
  numScenes,
  setNumScenes,
  onSubmit,
  isProcessing = false,
  className = ""
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (topicInput.trim() && onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Topic Input */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Chủ đề video
          <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
          placeholder="Mô tả chủ đề hoặc nội dung video bạn muốn tạo..."
          className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          disabled={isProcessing}
          required
        />
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 gap-4">
        <LanguageSelect
          label="Ngôn ngữ kịch bản"
          value={language}
          onChange={setLanguage}
          disabled={isProcessing}
          required
        />
        <NumberInput
          label="Số lượng scenes"
          value={numScenes}
          onChange={setNumScenes}
          min={1}
          max={20}
          placeholder="Nhập số scenes..."
          disabled={isProcessing}
          required
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!topicInput.trim() || isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Đang tạo kịch bản...
          </>
        ) : (
          "Tạo kịch bản"
        )}
      </button>

      {/* Validation Info */}
      {!topicInput.trim() && (
        <p className="text-xs text-gray-500 text-center">
          Vui lòng nhập chủ đề để tạo kịch bản
        </p>
      )}
    </div>
  );
};

export default ScriptGenerationForm;
