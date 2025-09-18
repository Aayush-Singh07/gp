import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, CheckCircle, Phone } from 'lucide-react';
import { Language, translations } from '../types/language';
import VoiceInput from './VoiceInput';
import { generateReceipt } from '../utils/receiptGenerator';
import { complaintsService } from '../lib/supabase';

interface EmergencyHelpProps {
  language: Language;
  onBack: () => void;
  onComplete: () => void;
  accessibilityMode: boolean;
}

const EmergencyHelp: React.FC<EmergencyHelpProps> = ({ 
  language, 
  onBack, 
  onComplete, 
  accessibilityMode 
}) => {
  const [name, setName] = useState('');
  const [emergencyType, setEmergencyType] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [tokenNumber, setTokenNumber] = useState('');
  const t = translations[language];

  const emergencyTypes = [
    { id: 'medical', name: t.medicalEmergency, color: 'from-red-500 to-red-600' },
    { id: 'fire', name: t.fireEmergency, color: 'from-orange-500 to-orange-600' },
    { id: 'accident', name: t.accidentEmergency, color: 'from-yellow-500 to-yellow-600' },
    { id: 'crime', name: t.crimeInProgress, color: 'from-purple-500 to-purple-600' },
    { id: 'domestic', name: t.domesticViolence, color: 'from-pink-500 to-pink-600' },
    { id: 'kidnapping', name: t.kidnapping, color: 'from-indigo-500 to-indigo-600' },
    { id: 'robbery', name: t.robbery, color: 'from-gray-500 to-gray-600' },
    { id: 'other', name: t.others, color: 'from-blue-500 to-blue-600' }
  ];

  const handleEmergencySubmit = async () => {
    if (!name || !emergencyType) {
      alert(language === 'english' ? 'Please fill all fields' : 
            language === 'hindi' ? 'कृपया सभी फ़ील्ड भरें' : 
            'कृपया सगळे फील्ड भरा');
      return;
    }

    const token = 'SOS' + Math.random().toString().substr(2, 8).toUpperCase();
    setTokenNumber(token);

    try {
      // Save to database
      await complaintsService.create({
        type: 'sos',
        token_number: token,
        complainant_name: name,
        complainant_phone: '', // Not collected in emergency
        complaint_data: {
          emergencyType: emergencyType,
          timestamp: new Date().toISOString(),
          priority: 'HIGH'
        },
        status: 'pending'
      });

      // Generate receipt in user's language
      generateReceipt(token, 'sos', name, language);
      setShowReceipt(true);
    } catch (error) {
      console.error('Error saving emergency report:', error);
    }
  };

  if (showReceipt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <h2 className={`font-bold text-gray-800 mb-4 ${accessibilityMode ? 'text-2xl' : 'text-xl'}`}>
            {t.sosTicketGenerated}
          </h2>
          
          <div className="bg-red-50 p-6 rounded-xl mb-6">
            <p className={`text-gray-600 mb-2 ${accessibilityMode ? 'text-lg' : ''}`}>
              {t.yourSosTicketId}
            </p>
            <p className={`font-bold text-red-900 ${accessibilityMode ? 'text-3xl' : 'text-2xl'}`}>
              {tokenNumber}
            </p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-xl mb-6">
            <p className={`text-yellow-800 font-semibold ${accessibilityMode ? 'text-lg' : 'text-sm'}`}>
              {t.officerWillAssist}
            </p>
          </div>
          
          {/* Emergency Contacts */}
          <div className="bg-gray-50 p-4 rounded-xl mb-6">
            <h3 className={`font-bold text-gray-800 mb-3 ${accessibilityMode ? 'text-lg' : ''}`}>
              {language === 'english' ? 'Emergency Contacts' : 
               language === 'hindi' ? 'आपातकालीन संपर्क' : 
               'तातकाळीन संपर्क'}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Phone className="w-4 h-4 text-red-500 mr-2" />
                <span className={`text-gray-700 ${accessibilityMode ? 'text-lg' : 'text-sm'}`}>
                  {language === 'english' ? 'Police: 100' : 
                   language === 'hindi' ? 'पुलिस: 100' : 
                   'पोलिस: 100'}
                </span>
              </div>
              <div className="flex items-center justify-center">
                <Phone className="w-4 h-4 text-red-500 mr-2" />
                <span className={`text-gray-700 ${accessibilityMode ? 'text-lg' : 'text-sm'}`}>
                  {language === 'english' ? 'Ambulance: 108' : 
                   language === 'hindi' ? 'एम्बुलेंस: 108' : 
                   'रुग्णवाहिका: 108'}
                </span>
              </div>
              <div className="flex items-center justify-center">
                <Phone className="w-4 h-4 text-red-500 mr-2" />
                <span className={`text-gray-700 ${accessibilityMode ? 'text-lg' : 'text-sm'}`}>
                  {language === 'english' ? 'Fire: 101' : 
                   language === 'hindi' ? 'अग्निशमन: 101' : 
                   'अग्निशमन: 101'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={onComplete}
              className={`w-full bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors ${
                accessibilityMode ? 'py-4 px-6 text-xl' : 'py-3 px-4'
              }`}
            >
              {t.ok}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-4">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 mr-3" />
            <div>
              <h1 className={`font-bold ${accessibilityMode ? 'text-xl' : 'text-lg'}`}>
                {t.emergencyHelp}
              </h1>
              <p className={`text-red-200 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                {language === 'english' ? 'Immediate Assistance' : 
                 language === 'hindi' ? 'तत्काल सहायता' : 
                 'ताबडतोब मदत'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          {/* Emergency Notice */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <p className={`text-red-800 font-semibold ${accessibilityMode ? 'text-lg' : ''}`}>
                {language === 'english' ? 'This is for emergency situations requiring immediate police assistance' : 
                 language === 'hindi' ? 'यह तत्काल पुलिस सहायता की आवश्यकता वाली आपातकालीन स्थितियों के लिए है' : 
                 'हे ताबडतोब पोलिस मदतीची गरज आशिल्ल्या तातकाळीन परिस्थितींखातीर आसा'}
              </p>
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className={`block font-medium text-gray-700 mb-2 ${accessibilityMode ? 'text-xl' : 'text-lg'}`}>
              {t.enterName} *
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`flex-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  accessibilityMode ? 'p-4 text-lg' : 'p-3'
                }`}
                placeholder={t.enterName}
              />
              <VoiceInput
                onTranscript={(text) => setName(text)}
                language={language}
              />
            </div>
          </div>

          {/* Emergency Type Selection */}
          <div>
            <label className={`block font-medium text-gray-700 mb-3 ${accessibilityMode ? 'text-xl' : 'text-lg'}`}>
              {t.selectEmergencyIssue} *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {emergencyTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setEmergencyType(type.id)}
                  className={`bg-gradient-to-br ${type.color} p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-white text-left ${
                    emergencyType === type.id ? 'ring-4 ring-yellow-300' : ''
                  } ${accessibilityMode ? 'p-6 text-lg' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{type.name}</span>
                    {emergencyType === type.id && (
                      <CheckCircle className="w-6 h-6" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleEmergencySubmit}
            disabled={!name || !emergencyType}
            className={`w-full bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${
              accessibilityMode ? 'py-6 text-xl' : 'py-4 text-lg'
            }`}
          >
            {language === 'english' ? 'SEND EMERGENCY ALERT' : 
             language === 'hindi' ? 'आपातकालीन अलर्ट भेजें' : 
             'तातकाळीन अलर्ट पाठवा'}
          </button>

          {/* Emergency Contacts */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className={`font-bold text-gray-800 mb-3 ${accessibilityMode ? 'text-lg' : ''}`}>
              {language === 'english' ? 'Direct Emergency Numbers' : 
               language === 'hindi' ? 'प्रत्यक्ष आपातकालीन नंबर' : 
               'थेट तातकाळीन नंबर'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="text-center">
                <div className="bg-red-500 text-white p-3 rounded-lg mb-2">
                  <Phone className="w-6 h-6 mx-auto" />
                </div>
                <p className={`font-bold text-red-600 ${accessibilityMode ? 'text-lg' : ''}`}>100</p>
                <p className={`text-gray-600 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                  {language === 'english' ? 'Police' : language === 'hindi' ? 'पुलिस' : 'पोलिस'}
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-500 text-white p-3 rounded-lg mb-2">
                  <Phone className="w-6 h-6 mx-auto" />
                </div>
                <p className={`font-bold text-green-600 ${accessibilityMode ? 'text-lg' : ''}`}>108</p>
                <p className={`text-gray-600 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                  {language === 'english' ? 'Ambulance' : language === 'hindi' ? 'एम्बुलेंस' : 'रुग्णवाहिका'}
                </p>
              </div>
              <div className="text-center">
                <div className="bg-orange-500 text-white p-3 rounded-lg mb-2">
                  <Phone className="w-6 h-6 mx-auto" />
                </div>
                <p className={`font-bold text-orange-600 ${accessibilityMode ? 'text-lg' : ''}`}>101</p>
                <p className={`text-gray-600 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                  {language === 'english' ? 'Fire' : language === 'hindi' ? 'अग्निशमन' : 'अग्निशमन'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyHelp;