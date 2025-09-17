import React, { useState } from 'react';
import SplashScreen from './components/SplashScreen';
import LanguageScreen from './components/LanguageScreen';
import HomeScreen from './components/HomeScreen';
import GetInformation from './components/GetInformation';
import FileReport from './components/FileReport';
import EmergencyHelp from './components/EmergencyHelp';
import TranslationAssistant from './components/TranslationAssistant';
import PoliceDashboard from './components/PoliceDashboard';
import FeedbackScreen from './components/FeedbackScreen';
import { Language } from './types/language';

type Screen = 'splash' | 'language' | 'home' | 'information' | 'report' | 'emergency' | 'translation' | 'police-dashboard' | 'feedback';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [language, setLanguage] = useState<Language>('english');
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  const handleStart = () => {
    setCurrentScreen('language');
  };
  
  const handleLanguageSelect = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
    setCurrentScreen('home');
  };
  
  const handleGetInformation = () => {
    setCurrentScreen('information');
  };
  
  const handleFileReport = () => {
    setCurrentScreen('report');
  };
  
  const handleEmergencyHelp = () => {
    setCurrentScreen('emergency');
  };
  
  const handleTranslationAssistant = () => {
    setCurrentScreen('translation');
  };
  
  const handlePoliceDashboard = () => {
    setCurrentScreen('police-dashboard');
  };
  
  const handleBackToHome = () => {
    setCurrentScreen('home');
  };

  const handleBackToStart = () => {
    setCurrentScreen('splash');
  };

  const handleShowFeedback = () => {
    setCurrentScreen('feedback');
  };

  const toggleAccessibility = () => {
    setAccessibilityMode(!accessibilityMode);
  };

  return (
    <div className={`min-h-screen ${accessibilityMode ? 'text-xl' : ''}`}>
      {currentScreen === 'splash' && (
        <SplashScreen 
          onStart={handleStart}
          accessibilityMode={accessibilityMode}
          onToggleAccessibility={toggleAccessibility}
        />
      )}
      {currentScreen === 'language' && (
        <LanguageScreen 
          onLanguageSelect={handleLanguageSelect}
          accessibilityMode={accessibilityMode}
        />
      )}
      {currentScreen === 'home' && (
        <HomeScreen 
          language={language}
          onGetInformation={handleGetInformation}
          onFileReport={handleFileReport}
          onEmergencyHelp={handleEmergencyHelp}
          onTranslationAssistant={handleTranslationAssistant}
          onPoliceDashboard={handlePoliceDashboard}
          onBackToStart={handleBackToStart}
          onShowFeedback={handleShowFeedback}
          accessibilityMode={accessibilityMode}
          onToggleAccessibility={toggleAccessibility}
        />
      )}
      {currentScreen === 'information' && (
        <GetInformation 
          language={language}
          onBack={handleBackToHome}
          accessibilityMode={accessibilityMode}
        />
      )}
      {currentScreen === 'report' && (
        <FileReport 
          language={language}
          onBack={handleBackToHome}
          onComplete={handleShowFeedback}
          accessibilityMode={accessibilityMode}
        />
      )}
      {currentScreen === 'emergency' && (
        <EmergencyHelp 
          language={language}
          onBack={handleBackToHome}
          onComplete={handleShowFeedback}
          accessibilityMode={accessibilityMode}
        />
      )}
      {currentScreen === 'translation' && (
        <TranslationAssistant 
          language={language}
          onBack={handleBackToHome}
          accessibilityMode={accessibilityMode}
        />
      )}
      {currentScreen === 'police-dashboard' && (
        <PoliceDashboard 
          language={language}
          onBack={handleBackToHome}
          accessibilityMode={accessibilityMode}
        />
      )}
      {currentScreen === 'feedback' && (
        <FeedbackScreen 
          language={language}
          onBackToHome={handleBackToHome}
          onBackToStart={handleBackToStart}
          accessibilityMode={accessibilityMode}
        />
      )}
    </div>
  );
}

export default App;