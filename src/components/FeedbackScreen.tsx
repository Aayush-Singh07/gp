import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, CheckCircle } from 'lucide-react';
import { Language, translations } from '../types/language';

interface FeedbackScreenProps {
  language: Language;
  onBackToHome: () => void;
  onBackToStart: () => void;
  accessibilityMode: boolean;
}

const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ 
  language, 
  onBackToHome, 
  onBackToStart, 
  accessibilityMode 
}) => {
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const t = translations[language];

  const handleSubmit = () => {
    // In a real app, this would send feedback to a server
    console.log('Feedback submitted:', { feedback, comment, language });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          
          <h2 className={`font-bold text-gray-800 mb-4 ${accessibilityMode ? 'text-2xl' : 'text-xl'}`}>
            {language === 'english' ? 'Thank You!' : 
             language === 'hindi' ? 'धन्यवाद!' : 
             'देव बरे करूं!'}
          </h2>
          
          <p className={`text-gray-600 mb-6 ${accessibilityMode ? 'text-lg' : ''}`}>
            {language === 'english' ? 'Your feedback helps us improve our services.' : 
             language === 'hindi' ? 'आपकी प्रतिक्रिया हमारी सेवाओं को बेहतर बनाने में मदद करती है।' : 
             'तुमचो अभिप्राय आमच्या सेवा बरे करपाक मदत करता.'}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={onBackToHome}
              className={`w-full bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors ${
                accessibilityMode ? 'py-4 px-6 text-xl' : 'py-3 px-4'
              }`}
            >
              {language === 'english' ? 'Back to Home' : 
               language === 'hindi' ? 'होम पर वापस' : 
               'घरा परत'}
            </button>
            
            <button
              onClick={onBackToStart}
              className={`w-full bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors ${
                accessibilityMode ? 'py-4 px-6 text-xl' : 'py-3 px-4'
              }`}
            >
              {language === 'english' ? 'Exit' : 
               language === 'hindi' ? 'बाहर निकलें' : 
               'बाहेर पडा'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <MessageCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className={`font-bold text-gray-800 mb-2 ${accessibilityMode ? 'text-2xl' : 'text-xl'}`}>
            {language === 'english' ? 'Was this helpful?' : 
             language === 'hindi' ? 'क्या यह सहायक था?' : 
             'हे उपयुक्त आशिल्लें?'}
          </h2>
          <p className={`text-gray-600 ${accessibilityMode ? 'text-lg' : ''}`}>
            {language === 'english' ? 'Your feedback helps us improve' : 
             language === 'hindi' ? 'आपकी प्रतिक्रिया हमें बेहतर बनाने में मदद करती है' : 
             'तुमचो अभिप्राय आमकां बरे करपाक मदत करता'}
          </p>
        </div>

        {/* Feedback Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setFeedback('yes')}
            className={`flex-1 p-6 rounded-xl border-2 transition-all duration-200 ${
              feedback === 'yes'
                ? 'border-green-500 bg-green-50 text-green-800'
                : 'border-gray-200 hover:border-gray-300'
            } ${accessibilityMode ? 'p-8' : ''}`}
          >
            <ThumbsUp className={`mx-auto mb-2 ${accessibilityMode ? 'w-10 h-10' : 'w-8 h-8'} ${
              feedback === 'yes' ? 'text-green-500' : 'text-gray-400'
            }`} />
            <p className={`font-semibold ${accessibilityMode ? 'text-lg' : ''}`}>
              {language === 'english' ? 'Yes' : 
               language === 'hindi' ? 'हाँ' : 
               'हय'}
            </p>
          </button>
          
          <button
            onClick={() => setFeedback('no')}
            className={`flex-1 p-6 rounded-xl border-2 transition-all duration-200 ${
              feedback === 'no'
                ? 'border-red-500 bg-red-50 text-red-800'
                : 'border-gray-200 hover:border-gray-300'
            } ${accessibilityMode ? 'p-8' : ''}`}
          >
            <ThumbsDown className={`mx-auto mb-2 ${accessibilityMode ? 'w-10 h-10' : 'w-8 h-8'} ${
              feedback === 'no' ? 'text-red-500' : 'text-gray-400'
            }`} />
            <p className={`font-semibold ${accessibilityMode ? 'text-lg' : ''}`}>
              {language === 'english' ? 'No' : 
               language === 'hindi' ? 'नहीं' : 
               'ना'}
            </p>
          </button>
        </div>

        {/* Comment Box */}
        <div className="mb-6">
          <label className={`block font-medium text-gray-700 mb-2 ${accessibilityMode ? 'text-lg' : ''}`}>
            {language === 'english' ? 'Additional Comments (Optional)' : 
             language === 'hindi' ? 'अतिरिक्त टिप्पणी (वैकल्पिक)' : 
             'अतिरिक्त टिप्पणी (पर्यायी)'}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={accessibilityMode ? 5 : 3}
            className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              accessibilityMode ? 'p-4 text-lg' : 'p-3'
            }`}
            placeholder={
              language === 'english' ? 'Tell us how we can improve...' : 
              language === 'hindi' ? 'बताएं कि हम कैसे सुधार कर सकते हैं...' : 
              'आमी कशे सुधार करूं शकतात ते सांगा...'
            }
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!feedback}
          className={`w-full bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mb-4 ${
            accessibilityMode ? 'py-4 text-xl' : 'py-3 text-lg'
          }`}
        >
          {language === 'english' ? 'Submit Feedback' : 
           language === 'hindi' ? 'प्रतिक्रिया जमा करें' : 
           'अभिप्राय जमा करा'}
        </button>

        {/* Skip Button */}
        <button
          onClick={onBackToHome}
          className={`w-full bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors ${
            accessibilityMode ? 'py-4 text-xl' : 'py-3'
          }`}
        >
          {language === 'english' ? 'Skip' : 
           language === 'hindi' ? 'छोड़ें' : 
           'सोडा'}
        </button>
      </div>
    </div>
  );
};

export default FeedbackScreen;