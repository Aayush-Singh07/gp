import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        {/* Goa Police Logo */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
            <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center relative">
              <div className="text-yellow-400 font-bold text-2xl">GP</div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-green-800 mb-2">
          Goa Police AI Visitor Assistant
        </h1>
        
        {/* Divider */}
        <div className="w-16 h-1 bg-yellow-500 mx-auto mb-6"></div>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="bg-green-700 hover:bg-green-800 text-white font-semibold py-4 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center mx-auto"
        >
          Start Assistant
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Footer */}
        <div className="mt-8 text-sm text-gray-600">
          <div className="flex items-center justify-center space-x-2">
            <span>शांति</span>
            <span>•</span>
            <span>सेवा</span>
            <span>•</span>
            <span>न्याय</span>
          </div>
          <div className="mt-1 text-xs">
            Peace • Service • Justice
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;