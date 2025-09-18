// HomeScreen.tsx
import React, { useState } from 'react';
import { Info, FileText, AlertTriangle, Languages, Mic, Shield, Settings, Users } from 'lucide-react';
import { Language, translations } from '../types/language';
import AIVoiceInterface from './AIVoiceInterface';

interface HomeScreenProps {
  language: Language;
  onGetInformation: () => void;
  onFileReport: () => void;
  onEmergencyHelp: () => void;
  onTranslationAssistant: () => void;
  onPoliceDashboard: () => void;
  onWomenOfficerSection: () => void;
  onBackToStart: () => void;
  accessibilityMode: boolean;
  onToggleAccessibility: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  language,
  onGetInformation,
  onFileReport,
  onEmergencyHelp,
  onTranslationAssistant,
  onPoliceDashboard,
  onWomenOfficerSection,
  onBackToStart,
  accessibilityMode,
  onToggleAccessibility
}) => {
  const [showAIInterface, setShowAIInterface] = useState(false);
  const t = translations[language];

  const mainOptions = [
    {
      id: 'get-information',
      title: t.getInformation,
      subtitle: t.getInformationSubtitle,
      icon: Info,
      bgColor: 'from-blue-500 to-blue-600',
      onClick: onGetInformation
    },
    {
      id: 'file-report',
      title: t.fileReport,
      subtitle: t.fileReportSubtitle,
      icon: FileText,
      bgColor: 'from-green-500 to-green-600',
      onClick: onFileReport
    },
    {
      id: 'women-officer',
      title: language === 'english' ? 'Women Officer' : 
             language === 'hindi' ? 'महिला अधिकारी' : 'महिला अधिकारी',
      subtitle: language === 'english' ? 'Safe space for women • महिलाओं के लिए सुरक्षित स्थान • महिलांखातीर सुरक्षित जागा' : 
                language === 'hindi' ? 'महिलाओं के लिए सुरक्षित स्थान • Safe space for women • महिलांखातीर सुरक्षित जागा' : 
                'महिलांखातीर सुरक्षित जागा • Safe space for women • महिलाओं के लिए सुरक्षित स्थान',
      icon: Users,
      bgColor: 'from-pink-500 to-pink-600',
      onClick: onWomenOfficerSection
    },
    {
      id: 'translation',
      title: t.translationAssistant,
      subtitle: t.translationAssistantSubtitle,
      icon: Languages,
      bgColor: 'from-purple-500 to-purple-600',
      onClick: onTranslationAssistant
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col">
      {/* Header */}
           {/* Header */}
      <header className="bg-gradient-to-r from-green-700 to-green-800 text-white p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/en/d/dd/Emblem_of_Goa_Police.png"
              alt="Goa Police Logo"
              className="w-12 h-12 mr-3 rounded-full"
            />
            <div>
              <h1 className={`font-bold ${accessibilityMode ? 'text-2xl' : 'text-xl'}`}>
                {t.goaPolice}
              </h1>
              <p className={`text-green-200 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                {t.aiVisitorAssistant}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleAccessibility}
              className="bg-yellow-500 text-green-900 p-3 rounded-full hover:bg-yellow-400 transition-colors"
              title="Toggle Accessibility"
            >
              <Settings className="w-6 h-6" />
            </button>

            <button
              onClick={onPoliceDashboard}
              className="bg-yellow-500 text-green-900 p-3 rounded-full hover:bg-yellow-400 transition-colors"
              title="Police Dashboard"
            >
              <Shield className="w-6 h-6" />
            </button>

            <button
              onClick={onBackToStart}
              className="bg-yellow-500 text-green-900 px-3 py-2 rounded-full hover:bg-yellow-400 transition-colors text-sm font-semibold"
            >
              {language === 'english' ? 'Exit' :
                language === 'hindi' ? 'बाहर' : 'बाहेर'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 max-w-6xl mx-auto p-3 w-full ${accessibilityMode ? 'overflow-y-auto' : ''}`}>
        {/* Main Options Grid */}
        {/* Main Options Grid */}
<section className="bg-white rounded-xl shadow-md p-3 mb-1">
  <div className="grid grid-cols-2 gap-3">
    {mainOptions.map((option) => {
      const IconComponent = option.icon;
      return (
        <button
          key={option.id}
          onClick={option.onClick}
          className={`bg-gradient-to-br ${option.bgColor} p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${accessibilityMode ? 'p-5' : ''}`}
        >
          <div className="flex flex-col items-center text-center text-white">
            <div className="p-2 rounded-full mb-2 bg-white bg-opacity-20">
              <IconComponent className={`text-white ${accessibilityMode ? 'w-8 h-8' : 'w-6 h-6'}`} />
            </div>
            <h3 className={`font-bold mb-1 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
              {option.title}
            </h3>
            <p className={`opacity-90 leading-tight ${accessibilityMode ? 'text-sm' : 'text-xs'}`}>
              {option.subtitle}
            </p>
          </div>
        </button>
      );
    })}
  </div>
</section>


        {/* Mic Section */}
        <section
          id="mic-section"
          className="bg-white rounded-xl shadow-md p-1 mb-0 focus:outline-none"
          tabIndex={0}
        >
          <div className="text-center">
            <h3 className={`font-bold text-gray-800 mb-2 ${accessibilityMode ? 'text-lg' : 'text-sm'}`}>
              {t.aiVoiceAssistant}
            </h3>

            <div className="flex justify-center mb-2">
              <button
                onClick={() => setShowAIInterface(true)}
                className="relative bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110"
                style={{
                  animation: 'pulse 2s infinite',
                  boxShadow: '0 0 20px rgba(251, 191, 36, 0.6)'
                }}
                aria-label={t.tapToSpeak}
              >
                <Mic className={accessibilityMode ? 'w-8 h-8' : 'w-6 h-6'} />
                <div className="absolute inset-0 rounded-full border-2 border-yellow-300 opacity-75 animate-ping"></div>
              </button>
            </div>

            <p className={`text-gray-600 ${accessibilityMode ? 'text-sm' : 'text-xs'}`}>
              {t.tapToSpeak}
            </p>
          </div>
        </section>
      </main>

      {/* AI Voice Interface Modal */}
      {showAIInterface && (
        <AIVoiceInterface
          language={language}
          onClose={() => setShowAIInterface(false)}
          accessibilityMode={accessibilityMode}
        />
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.6);
          }
          50% {
            box-shadow: 0 0 35px rgba(251, 191, 36, 0.8);
          }
        }
      `}</style>
    </div>
  );
};

export default HomeScreen;
