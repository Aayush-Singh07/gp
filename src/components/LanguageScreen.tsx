import React from 'react';
import { Shield, Globe } from 'lucide-react';
import { Language } from '../types/language';

interface LanguageScreenProps {
  onLanguageSelect: (language: Language) => void;
  accessibilityMode: boolean;
}

const LanguageScreen: React.FC<LanguageScreenProps> = ({ 
  onLanguageSelect, 
  accessibilityMode 
}) => {
  const languages = [
    { code: 'english' as Language, name: 'English', nativeName: 'English' },
    { code: 'hindi' as Language, name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'konkani' as Language, name: 'Konkani', nativeName: 'कोंकणी' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-green-800 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <Globe className="w-12 h-12 text-green-800" />
          </div>
          <h2 className={`font-bold text-green-800 mb-4 ${accessibilityMode ? 'text-2xl' : 'text-xl'}`}>
            Select Your Language
          </h2>
          <p className={`text-gray-600 mb-2 ${accessibilityMode ? 'text-lg' : 'text-sm'}`}>
            अपनी भाषा चुनें
          </p>
          <p className={`text-gray-600 ${accessibilityMode ? 'text-lg' : 'text-sm'}`}>
            तुमची भास निवडा
          </p>
        </div>

        {/* Language Buttons */}
        <div className="space-y-4">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLanguageSelect(lang.code)}
              className={`w-full border-2 border-green-600 text-green-700 font-semibold rounded-xl hover:bg-green-50 transition-all duration-300 transform hover:scale-105 flex items-center justify-between ${
                accessibilityMode ? 'py-6 px-8 text-xl' : 'py-4 px-6'
              }`}
            >
              <span>{lang.name}</span>
              <span className="text-green-600">{lang.nativeName}</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <Shield className="w-4 h-4" />
            <span className={accessibilityMode ? 'text-base' : 'text-sm'}>
              Goa Police
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageScreen;