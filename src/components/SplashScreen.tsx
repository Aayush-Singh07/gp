import React from 'react';
import { Accessibility } from 'lucide-react';

interface SplashScreenProps {
  onStart: () => void;
  accessibilityMode: boolean;
  onToggleAccessibility: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onStart, 
  accessibilityMode, 
  onToggleAccessibility 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-green-800 to-blue-900 flex items-center justify-center p-4 relative">
      {/* Accessibility Toggle */}
      <button
        onClick={onToggleAccessibility}
        className={`absolute top-4 right-4 p-3 rounded-full transition-colors ${
          accessibilityMode 
            ? 'bg-yellow-500 text-black' 
            : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
        }`}
        title="Toggle Accessibility Mode"
      >
        <Accessibility className="w-6 h-6" />
      </button>

      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center">
        {/* Goa Police Logo */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/d/dd/Emblem_of_Goa_Police.png"  // 🔗 Paste Goa Police logo link here
              alt="Goa Police Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Title in 3 Languages */}
        <div className={`mb-8 ${accessibilityMode ? 'text-xl' : ''}`}>
          <h1 className="text-2xl font-bold text-green-800 mb-2">
            GOA POLICE AI VISITOR ASSISTANT SYSTEM
          </h1>
          <p className="text-green-700 mb-2">गोवा पुलिस एआई विज़िटर सहायक प्रणाली</p>
          <p className="text-green-700">गोवा पोलिस एआई व्हिझिटर सहाय्यक प्रणाली</p>
        </div>

        {/* Divider */}
        <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mb-8"></div>

        {/* Start Button */}
        <button
          onClick={onStart}
          className={`bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white font-bold py-6 px-12 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center mx-auto ${
            accessibilityMode ? 'text-2xl py-8 px-16' : 'text-xl'
          }`}
        >
          <span className="mr-3">शुरू करें • Start • सुरू करा</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Footer */}
        <div className={`mt-8 text-gray-600 ${accessibilityMode ? 'text-lg' : 'text-sm'}`}>
          <div className="flex items-center justify-center space-x-3 mb-2">
            <span className="font-semibold">शांति</span>
            <span>•</span>
            <span className="font-semibold">सेवा</span>
            <span>•</span>
            <span className="font-semibold">न्याय</span>
          </div>
          <div className="text-xs opacity-75">
            Peace • Service • Justice
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
