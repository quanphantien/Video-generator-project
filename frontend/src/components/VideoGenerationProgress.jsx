import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const VideoGenerationProgress = ({ 
  isGenerating, 
  progress, 
  currentStep = '',
  totalSteps = 0,
  completedSteps = 0,
  error = null 
}) => {
  if (!isGenerating && !error) return null;

  const steps = [
    'Phân tích script',
    'Tạo audio (TTS)',
    'Tạo hình ảnh',
    'Tạo video cuối cùng'
  ];

  const getStepStatus = (stepIndex) => {
    if (error) return 'error';
    if (completedSteps > stepIndex) return 'completed';
    if (completedSteps === stepIndex) return 'current';
    return 'pending';
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'current':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-300" />;
    }
  };

  return (
    <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">
          {error ? 'Lỗi tạo video' : 'Đang tạo video...'}
        </h3>
        {!error && (
          <span className="text-xs text-gray-500">
            {completedSteps}/{steps.length} bước
          </span>
        )}
      </div>

      {/* Progress bar */}
      {!error && (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps / steps.length) * 100}%` }}
          ></div>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          return (
            <div key={index} className="flex items-center gap-3">
              {getStepIcon(status)}
              <span className={`text-sm ${
                status === 'completed' ? 'text-green-700' :
                status === 'current' ? 'text-blue-700 font-medium' :
                status === 'error' ? 'text-red-700' :
                'text-gray-500'
              }`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {/* Current progress text */}
      {(progress || error) && (
        <div className={`mt-3 p-2 rounded text-sm ${
          error ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
        }`}>
          {error || progress}
        </div>
      )}
    </div>
  );
};

export default VideoGenerationProgress;
