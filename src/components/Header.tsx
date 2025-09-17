import React from 'react';
import { Language, translations } from '../types/language';

interface HeaderProps {
  language: Language;
  onPoliceDashboard?: () => void;
  onBackToStart?: () => void;
  showPoliceDashboard?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  language, 
  onPoliceDashboard,
  onBackToStart,
  showPoliceDashboard = false
}) => {
  const t = translations[language];

  return (
    <div className="bg-gradient-to-r from-green-700 to-green-800 text-white p-6">
      <div className="flex items-center justify-between mb-4">
        {/* Left - Goa Police Logo */}
        <div className="flex items-center">
          <div className="w-12 h-12 mr-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
            <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center relative">
              <div className="text-yellow-400 font-bold text-sm">GP</div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Center - Title */}
        <div className="text-center flex-1">
          <h1 className="text-xl font-bold">{t.goaPolice.toUpperCase()}</h1>
          <p className="text-green-200 text-sm">{t.aiVisitorAssistant}</p>
        </div>
        
        {/* Right - Action Buttons */}
        <div className="flex items-center space-x-2">
          {onBackToStart && (
            <button
              onClick={onBackToStart}
              className="bg-yellow-500 text-green-900 px-3 py-1 rounded-full text-sm font-semibold hover:bg-yellow-400 transition-colors"
            >
              {language === 'english' ? 'Exit' : 
               language === 'hindi' ? 'बाहर' : 'बाहेर'}
            </button>
          )}
          
          {showPoliceDashboard && onPoliceDashboard && (
            <button
              onClick={onPoliceDashboard}
              className="bg-yellow-500 text-green-900 p-2 rounded-full shadow-lg hover:bg-yellow-400 transition-colors"
              title={language === 'english' ? 'Police Dashboard' : 
                     language === 'hindi' ? 'पुलिस डैशबोर्ड' : 'पोलिस डॅशबोर्ड'}
            >
              <span className="text-sm font-bold">👮</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;