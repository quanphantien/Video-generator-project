import React, { useState } from 'react';
// import TopicSelect from './steps/TopicSelect';
import {STEPS} from '../constants/steps';
import Trending from '../b1_Trending/Trending';
import ScriptGen from '../b2_ScriptGen/ScriptGen';
import VoiceGen from '../b3_VoiceGen/VoiceGen';
// import ImageGen from './steps/ImageGen';
// import VideoEdit from './steps/VideoEdit';
// import VideoExport from './steps/VideoExport';

const VideoCreator = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [videoData, setVideoData] = useState({
        topic: '',
        script: '',
        voiceSettings: {},
        images: [],
        editingConfig: {},
        exportSettings: {}
    });

    const handleNext = () => {
        setCurrentStep(prevStep => prevStep + 1);
    };

    const handleBack = () => {
        setCurrentStep(prevStep => prevStep - 1);
    };

    const updateVideoData = (key, value) => {
        setVideoData(prev => ({
            ...prev,
            [key]: value
        }));
      };

    const nextStep = () => {
        setCurrentStep(prev => Math.min(prev + 1, 6));
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Trending
                        data={videoData}
                        onUpdate={(value) => updateVideoData('topic', value)}
                        onNext={handleNext}
                    />
                );
            case 2:
                return (
                    <ScriptGen
                        data={videoData}
                        onUpdate={(value) => updateVideoData('script', value)}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                );
            case 3:
                return (
                    <VoiceGen
                        data={videoData}
                        onUpdate={(value) => updateVideoData('voiceSettings', value)}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                );
            // case 4:
            //     return (
            //         <ImageGen
            //             data={videoData}
            //             onUpdate={(value) => updateVideoData('images', value)}
            //             onNext={nextStep}
            //             onBack={prevStep}
            //         />
            //     );
            // case 5:
            //     return (
            //         <VideoEdit
            //             data={videoData}
            //             onUpdate={(value) => updateVideoData('editingConfig', value)}
            //             onNext={nextStep}
            //             onBack={prevStep}
            //         />
            //     );
            // case 6:
            //     return (
            //         <VideoExport
            //             data={videoData}
            //             onUpdate={(value) => updateVideoData('exportSettings', value)}
            //             onBack={prevStep}
            //         />
            //     );
            default:
                return null;
        }
    };

    return (
        <div className=" bg-gray-50 p-6">
            {/* Progress bar */}
            <div className="max-w-4xl mx-auto mb-2">
                <div className="flex justify-between mb-4">
                    {['Chọn chủ đề', 'Tạo kịch bản', 'Tạo giọng đọc', 'Sinh hình ảnh', 'Chỉnh sửa', 'Xuất video'].map(
                        (label, index) => (
                            <div
                                key={index}
                                className={`flex flex-col items-center ${index + 1 <= currentStep ? 'text-purple-600' : 'text-gray-400'
                                    }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${index + 1 <= currentStep ? 'bg-purple-600 text-white' : 'bg-gray-200'
                                        }`}
                                >
                                    {index + 1}
                                </div>
                                <span className="text-xs">{label}</span>
                            </div>
                        )
                    )}
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                    <div
                        className="h-full bg-purple-600 rounded-full transition-all duration-300"
                        style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
                    />
                </div>
            </div>

            {/* Current step content */}
            <div className=" mx-auto">
                {renderStep()}
            </div>
        </div>
    );
};

export default VideoCreator;