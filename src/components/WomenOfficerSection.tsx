import React, { useState } from 'react';
import { ArrowLeft, Shield, CheckCircle, Phone } from 'lucide-react';
import { Language, translations } from '../types/language';
import VoiceInput from './VoiceInput';
import { generateReceipt } from '../utils/receiptGenerator';
import { complaintsService } from '../lib/supabase';

interface WomenOfficerSectionProps {
  language: Language;
  onBack: () => void;
  onComplete: () => void;
  accessibilityMode: boolean;
}

interface WomenComplaintData {
  type: string;
  name: string;
  phone: string;
  email: string;
  description: string;
  location: string;
  date: string;
  urgency: 'low' | 'medium' | 'high';
}

const WomenOfficerSection: React.FC<WomenOfficerSectionProps> = ({ 
  language, 
  onBack, 
  onComplete, 
  accessibilityMode 
}) => {
  const [step, setStep] = useState(1);
  const [complaintData, setComplaintData] = useState<WomenComplaintData>({
    type: '',
    name: '',
    phone: '',
    email: '',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    urgency: 'medium'
  });
  const [showReceipt, setShowReceipt] = useState(false);
  const [tokenNumber, setTokenNumber] = useState('');
  const t = translations[language];

  const womenIssues = [
    { 
      id: 'domestic_violence', 
      name: language === 'english' ? 'Domestic Violence' : 
            language === 'hindi' ? 'घरेलू हिंसा' : 'घरगुती हिंसा',
      urgency: 'high' as const
    },
    { 
      id: 'sexual_harassment', 
      name: language === 'english' ? 'Sexual Harassment' : 
            language === 'hindi' ? 'यौन उत्पीड़न' : 'लैंगिक छळवणूक',
      urgency: 'high' as const
    },
    { 
      id: 'stalking', 
      name: language === 'english' ? 'Stalking' : 
            language === 'hindi' ? 'पीछा करना' : 'पाठलाग करप',
      urgency: 'high' as const
    },
    { 
      id: 'dowry_harassment', 
      name: language === 'english' ? 'Dowry Harassment' : 
            language === 'hindi' ? 'दहेज उत्पीड़न' : 'हुंडा छळवणूक',
      urgency: 'high' as const
    },
    { 
      id: 'workplace_harassment', 
      name: language === 'english' ? 'Workplace Harassment' : 
            language === 'hindi' ? 'कार्यक्षेत्र उत्पीड़न' : 'कामाच्या जाग्यार छळवणूक',
      urgency: 'medium' as const
    },
    { 
      id: 'cyber_crime_women', 
      name: language === 'english' ? 'Cyber Crime Against Women' : 
            language === 'hindi' ? 'महिलाओं के खिलाफ साइबर अपराध' : 'महिलांविरुद्ध सायबर गुन्हा',
      urgency: 'medium' as const
    },
    { 
      id: 'eve_teasing', 
      name: language === 'english' ? 'Eve Teasing' : 
            language === 'hindi' ? 'छेड़छाड़' : 'छेडछाड',
      urgency: 'medium' as const
    },
    { 
      id: 'other_women', 
      name: language === 'english' ? 'Other Women Safety Issues' : 
            language === 'hindi' ? 'अन्य महिला सुरक्षा मुद्दे' : 'हेर महिला सुरक्षा मुद्दे',
      urgency: 'medium' as const
    }
  ];

  const handleNext = () => {
    if (step === 1 && complaintData.name && complaintData.type) {
      const token = Math.floor(10 + Math.random() * 90).toString(); // 2-digit token
      setTokenNumber(token);
      saveWomenComplaintToDatabase(token);
      generateReceipt(token, 'women_complaint', complaintData.name, language);
      setStep(2);
    }
  };

  const saveWomenComplaintToDatabase = async (token: string) => {
    try {
      await complaintsService.create({
        type: 'women_complaint',
        token_number: token,
        complainant_name: complaintData.name,
        complainant_phone: complaintData.phone,
        complainant_email: complaintData.email,
        complaint_data: {
          ...complaintData,
          category: 'women_safety',
          priority: complaintData.urgency,
          assigned_to: 'women_officer',
          timestamp: new Date().toISOString()
        },
        status: 'pending'
      });
    } catch (error) {
      console.error('Error saving women complaint:', error);
    }
  };

  const handleInputChange = (field: keyof WomenComplaintData, value: string) => {
    setComplaintData(prev => ({ ...prev, [field]: value }));
  };

  const handleTypeSelect = (type: string, urgency: 'low' | 'medium' | 'high') => {
    setComplaintData(prev => ({ ...prev, type, urgency }));
  };

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <h2 className={`font-bold text-gray-800 mb-4 ${accessibilityMode ? 'text-2xl' : 'text-xl'}`}>
            {language === 'english' ? 'Women Complaint Filed Successfully!' : 
             language === 'hindi' ? 'महिला शिकायत सफलतापूर्वक दर्ज की गई!' : 
             'महिला शिकायत यशस्वीपणान दाखल जाली!'}
          </h2>
          
          <div className="bg-pink-50 p-6 rounded-xl mb-6">
            <p className={`text-gray-600 mb-2 ${accessibilityMode ? 'text-lg' : ''}`}>
              {language === 'english' ? 'Your Token Number:' : 
               language === 'hindi' ? 'आपका टोकन नंबर:' : 
               'तुमचो टोकन नंबर:'}
            </p>
            <p className={`font-bold text-pink-900 ${accessibilityMode ? 'text-3xl' : 'text-2xl'}`}>
              {tokenNumber}
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-xl mb-6">
            <p className={`text-purple-800 font-semibold ${accessibilityMode ? 'text-lg' : 'text-sm'}`}>
              {language === 'english' ? 'A women officer will contact you shortly for assistance' : 
               language === 'hindi' ? 'एक महिला अधिकारी जल्द ही सहायता के लिए आपसे संपर्क करेगी' : 
               'एक महिला अधिकारी लवकरच मदतीखातीर तुमच्याशी संपर्क करतली'}
            </p>
          </div>
          
          {/* Women Helpline Numbers */}
          <div className="bg-gray-50 p-4 rounded-xl mb-6">
            <h3 className={`font-bold text-gray-800 mb-3 ${accessibilityMode ? 'text-lg' : ''}`}>
              {language === 'english' ? 'Women Helpline Numbers' : 
               language === 'hindi' ? 'महिला हेल्पलाइन नंबर' : 
               'महिला हेल्पलायन नंबर'}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Phone className="w-4 h-4 text-pink-500 mr-2" />
                <span className={`text-gray-700 ${accessibilityMode ? 'text-lg' : 'text-sm'}`}>
                  {language === 'english' ? 'Women Helpline: 1091' : 
                   language === 'hindi' ? 'महिला हेल्पलाइन: 1091' : 
                   'महिला हेल्पलायन: 1091'}
                </span>
              </div>
              <div className="flex items-center justify-center">
                <Phone className="w-4 h-4 text-pink-500 mr-2" />
                <span className={`text-gray-700 ${accessibilityMode ? 'text-lg' : 'text-sm'}`}>
                  {language === 'english' ? 'Domestic Violence: 181' : 
                   language === 'hindi' ? 'घरेलू हिंसा: 181' : 
                   'घरगुती हिंसा: 181'}
                </span>
              </div>
              <div className="flex items-center justify-center">
                <Phone className="w-4 h-4 text-pink-500 mr-2" />
                <span className={`text-gray-700 ${accessibilityMode ? 'text-lg' : 'text-sm'}`}>
                  {language === 'english' ? 'Child Helpline: 1098' : 
                   language === 'hindi' ? 'बाल हेल्पलाइन: 1098' : 
                   'बाल हेल्पलायन: 1098'}
                </span>
              </div>
              <div className="flex items-center justify-center">
                <Phone className="w-4 h-4 text-pink-500 mr-2" />
                <span className={`text-gray-700 ${accessibilityMode ? 'text-lg' : 'text-sm'}`}>
                  {language === 'english' ? 'Police: 100' : 
                   language === 'hindi' ? 'पुलिस: 100' : 
                   'पोलिस: 100'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={onComplete}
              className={`w-full bg-pink-600 text-white font-semibold rounded-xl hover:bg-pink-700 transition-colors ${
                accessibilityMode ? 'py-4 px-6 text-xl' : 'py-3 px-4'
              }`}
            >
              {language === 'english' ? 'Continue' : 
               language === 'hindi' ? 'जारी रखें' : 
               'चालू दवरा'}
            </button>
            
            <button
              onClick={onBack}
              className={`w-full bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors ${
                accessibilityMode ? 'py-4 px-6 text-xl' : 'py-3 px-4'
              }`}
            >
              {language === 'english' ? 'Back to Home' : 
               language === 'hindi' ? 'होम पर वापस' : 
               'घरा परत'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-pink-700 text-white p-4">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-4">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center">
            <Shield className="w-8 h-8 mr-3" />
            <div>
              <h1 className={`font-bold ${accessibilityMode ? 'text-xl' : 'text-lg'}`}>
                {language === 'english' ? 'Women Officer Section' : 
                 language === 'hindi' ? 'महिला अधिकारी अनुभाग' : 
                 'महिला अधिकारी विभाग'}
              </h1>
              <p className={`text-pink-200 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                {language === 'english' ? 'Safe Space for Women' : 
                 language === 'hindi' ? 'महिलाओं के लिए सुरक्षित स्थान' : 
                 'महिलांखातीर सुरक्षित जागा'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          {/* Safety Notice */}
          <div className="bg-pink-50 border-l-4 border-pink-500 p-4 rounded-r-xl">
            <div className="flex items-center">
              <Shield className="w-6 h-6 text-pink-500 mr-3" />
              <p className={`text-pink-800 font-semibold ${accessibilityMode ? 'text-lg' : ''}`}>
                {language === 'english' ? 'This section is handled by trained women officers for your comfort and safety' : 
                 language === 'hindi' ? 'यह अनुभाग आपकी सुविधा और सुरक्षा के लिए प्रशिक्षित महिला अधिकारियों द्वारा संभाला जाता है' : 
                 'हो विभाग तुमच्या सुविधा आनी सुरक्षेखातीर प्रशिक्षित महिला अधिकाऱ्यांनी संभाळला जाता'}
              </p>
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className={`block font-medium text-gray-700 mb-2 ${accessibilityMode ? 'text-xl' : 'text-lg'}`}>
              {language === 'english' ? 'Enter Name *' : 
               language === 'hindi' ? 'नाम दर्ज करें *' : 
               'नांव घाला *'}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={complaintData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`flex-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                  accessibilityMode ? 'p-4 text-lg' : 'p-3'
                }`}
                placeholder={language === 'english' ? 'Enter your name' : 
                            language === 'hindi' ? 'अपना नाम दर्ज करें' : 
                            'तुमचे नांव घाला'}
              />
              <VoiceInput
                onTranscript={(text) => handleInputChange('name', text)}
                language={language}
              />
            </div>
          </div>

          {/* Issue Type Selection */}
          <div>
            <label className={`block font-medium text-gray-700 mb-3 ${accessibilityMode ? 'text-xl' : 'text-lg'}`}>
              {language === 'english' ? 'Select Women Safety Issue *' : 
               language === 'hindi' ? 'महिला सुरक्षा मुद्दा चुनें *' : 
               'महिला सुरक्षा मुद्दा निवडा *'}
            </label>
            <div className="grid grid-cols-1 gap-3">
              {womenIssues.map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => handleTypeSelect(issue.id, issue.urgency)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    complaintData.type === issue.id
                      ? 'border-pink-500 bg-pink-50 text-pink-800'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${accessibilityMode ? 'p-6 text-lg' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{issue.name}</span>
                    {issue.urgency === 'high' && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                        {language === 'english' ? 'High Priority' : 
                         language === 'hindi' ? 'उच्च प्राथमिकता' : 
                         'उच्च प्राधान्य'}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleNext}
            disabled={!complaintData.name || !complaintData.type}
            className={`w-full bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${
              accessibilityMode ? 'py-6 text-xl' : 'py-4 text-lg'
            }`}
          >
            {language === 'english' ? 'SUBMIT TO WOMEN OFFICER' : 
             language === 'hindi' ? 'महिला अधिकारी को भेजें' : 
             'महिला अधिकाऱ्यांक पाठवा'}
          </button>

          {/* Women Helpline Numbers */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className={`font-bold text-gray-800 mb-3 ${accessibilityMode ? 'text-lg' : ''}`}>
              {language === 'english' ? 'Women Helpline Numbers' : 
               language === 'hindi' ? 'महिला हेल्पलाइन नंबर' : 
               'महिला हेल्पलायन नंबर'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="text-center">
                <div className="bg-pink-500 text-white p-3 rounded-lg mb-2">
                  <Phone className="w-6 h-6 mx-auto" />
                </div>
                <p className={`font-bold text-pink-600 ${accessibilityMode ? 'text-lg' : ''}`}>1091</p>
                <p className={`text-gray-600 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                  {language === 'english' ? 'Women Helpline' : language === 'hindi' ? 'महिला हेल्पलाइन' : 'महिला हेल्पलायन'}
                </p>
              </div>
              <div className="text-center">
                <div className="bg-red-500 text-white p-3 rounded-lg mb-2">
                  <Phone className="w-6 h-6 mx-auto" />
                </div>
                <p className={`font-bold text-red-600 ${accessibilityMode ? 'text-lg' : ''}`}>181</p>
                <p className={`text-gray-600 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                  {language === 'english' ? 'Domestic Violence' : language === 'hindi' ? 'घरेलू हिंसा' : 'घरगुती हिंसा'}
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-500 text-white p-3 rounded-lg mb-2">
                  <Phone className="w-6 h-6 mx-auto" />
                </div>
                <p className={`font-bold text-blue-600 ${accessibilityMode ? 'text-lg' : ''}`}>1098</p>
                <p className={`text-gray-600 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                  {language === 'english' ? 'Child Helpline' : language === 'hindi' ? 'बाल हेल्पलाइन' : 'बाल हेल्पलायन'}
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-500 text-white p-3 rounded-lg mb-2">
                  <Phone className="w-6 h-6 mx-auto" />
                </div>
                <p className={`font-bold text-green-600 ${accessibilityMode ? 'text-lg' : ''}`}>100</p>
                <p className={`text-gray-600 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                  {language === 'english' ? 'Police' : language === 'hindi' ? 'पुलिस' : 'पोलिस'}
                </p>
              </div>
            </div>
          </div>

          {/* Confidentiality Notice */}
          <div className="bg-purple-50 p-4 rounded-xl">
            <p className={`text-purple-800 text-center ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
              {language === 'english' ? '🔒 All information shared here is strictly confidential and will be handled with utmost care by our trained women officers.' : 
               language === 'hindi' ? '🔒 यहाँ साझा की गई सभी जानकारी पूर्णतः गोपनीय है और हमारी प्रशिक्षित महिला अधिकारियों द्वारा अत्यधिक सावधानी से संभाली जाएगी।' : 
               '🔒 हांगा वांटल्ली सगळी माहिती पूर्णपणान गुप्त आसा आनी आमच्या प्रशिक्षित महिला अधिकाऱ्यांनी अत्यंत काळजीन संभाळली जातली.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WomenOfficerSection;