import React, { useState } from 'react';
import { ArrowLeft, FileText, CheckCircle, Mic } from 'lucide-react';
import { Language, translations } from '../types/language';
import VoiceInput from './VoiceInput';
import { generateReceipt } from '../utils/receiptGenerator';
import { complaintsService } from '../lib/supabase';

interface FileReportProps {
  language: Language;
  onBack: () => void;
  onComplete: () => void;
  accessibilityMode: boolean;
}

interface ReportData {
  type: string;
  name: string;
  phone: string;
  email: string;
  description: string;
  location: string;
  date: string;
}

const FileReport: React.FC<FileReportProps> = ({ 
  language, 
  onBack, 
  onComplete, 
  accessibilityMode 
}) => {
  const [reportData, setReportData] = useState<ReportData>({
    type: '',
    name: '',
    phone: '',
    email: '',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [showReceipt, setShowReceipt] = useState(false);
  const [tokenNumber, setTokenNumber] = useState('');
  const t = translations[language];

  const reportTypes = [
    { id: 'theft', name: t.theft },
    { id: 'harassment', name: t.harassment },
    { id: 'cybercrime', name: t.cybercrime },
    { id: 'traffic', name: t.trafficViolation },
    { id: 'domestic', name: language === 'english' ? 'Domestic Violence' : language === 'hindi' ? 'घरेलू हिंसा' : 'घरगुती हिंसा' },
    { id: 'missing', name: language === 'english' ? 'Missing Person' : language === 'hindi' ? 'लापता व्यक्ति' : 'बेपत्ता व्यक्ती' },
    { id: 'noise', name: language === 'english' ? 'Noise Complaint' : language === 'hindi' ? 'शोर की शिकायत' : 'आवाजाची शिकायत' },
    { id: 'property', name: language === 'english' ? 'Property Dispute' : language === 'hindi' ? 'संपत्ति विवाद' : 'मालमत्तेचो वाद' },
    { id: 'other', name: t.others }
  ];

  const handleInputChange = (field: keyof ReportData, value: string) => {
    setReportData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!reportData.type || !reportData.name || !reportData.phone || !reportData.description) {
      alert(language === 'english' ? 'Please fill all required fields' : 
            language === 'hindi' ? 'कृपया सभी आवश्यक फ़ील्ड भरें' : 
            'कृपया सगळे गरजेचे फील्ड भरा');
      return;
    }

    const token = 'RPT' + Math.random().toString().substr(2, 8).toUpperCase();
    setTokenNumber(token);

    try {
      // Save to database in English for police
      await complaintsService.create({
        type: 'complaint',
        token_number: token,
        complainant_name: reportData.name,
        complainant_phone: reportData.phone,
        complainant_email: reportData.email,
        complaint_data: {
          type: translateToEnglish(reportData.type),
          description: reportData.description, // Keep original for now
          location: reportData.location,
          date: reportData.date
        },
        status: 'pending'
      });

      // Generate receipt in user's language
      generateReceipt(token, 'complaint', reportData.name, language);
      setShowReceipt(true);
    } catch (error) {
      console.error('Error saving report:', error);
    }
  };

  const translateToEnglish = (type: string): string => {
    const typeMap: Record<string, string> = {
      'theft': 'Theft',
      'harassment': 'Harassment', 
      'cybercrime': 'Cybercrime',
      'traffic': 'Traffic Violation',
      'domestic': 'Domestic Violence',
      'missing': 'Missing Person',
      'noise': 'Noise Complaint',
      'property': 'Property Dispute',
      'other': 'Other'
    };
    return typeMap[type] || type;
  };

  if (showReceipt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          
          <h2 className={`font-bold text-gray-800 mb-4 ${accessibilityMode ? 'text-2xl' : 'text-xl'}`}>
            {language === 'english' ? 'Report Filed Successfully!' : 
             language === 'hindi' ? 'रिपोर्ट सफलतापूर्वक दर्ज की गई!' : 
             'रिपोर्ट यशस्वीपणान दाखल जाली!'}
          </h2>
          
          <div className="bg-blue-50 p-6 rounded-xl mb-6">
            <p className={`text-gray-600 mb-2 ${accessibilityMode ? 'text-lg' : ''}`}>
              {language === 'english' ? 'Your Token Number:' : 
               language === 'hindi' ? 'आपका टोकन नंबर:' : 
               'तुमचो टोकन नंबर:'}
            </p>
            <p className={`font-bold text-blue-900 ${accessibilityMode ? 'text-3xl' : 'text-2xl'}`}>
              {tokenNumber}
            </p>
          </div>
          
          <p className={`text-gray-600 mb-6 ${accessibilityMode ? 'text-lg' : 'text-sm'}`}>
            {language === 'english' ? 'Please save this token number. You can use it to track your report status.' : 
             language === 'hindi' ? 'कृपया इस टोकन नंबर को सेव करें। आप इसका उपयोग अपनी रिपोर्ट की स्थिति ट्रैक करने के लिए कर सकते हैं।' : 
             'कृपया हो टोकन नंबर सेव्ह करा। तुम्ही हाचो वापर तुमच्या रिपोर्टाची स्थिती ट्रॅक करपाखातीर करूं शकता.'}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={onComplete}
              className={`w-full bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors ${
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-800 text-white p-4">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-4">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center">
            <FileText className="w-8 h-8 mr-3" />
            <div>
              <h1 className={`font-bold ${accessibilityMode ? 'text-xl' : 'text-lg'}`}>
                {t.fileReport}
              </h1>
              <p className={`text-green-200 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                {language === 'english' ? 'File Your Report' : 
                 language === 'hindi' ? 'अपनी रिपोर्ट दर्ज करें' : 
                 'तुमची रिपोर्ट दाखल करा'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          {/* Report Type Selection */}
          <div>
            <label className={`block font-medium text-gray-700 mb-3 ${accessibilityMode ? 'text-xl' : 'text-lg'}`}>
              {language === 'english' ? 'Type of Report *' : 
               language === 'hindi' ? 'रिपोर्ट का प्रकार *' : 
               'रिपोर्टाचो प्रकार *'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleInputChange('type', type.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    reportData.type === type.id
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${accessibilityMode ? 'p-6 text-lg' : ''}`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block font-medium text-gray-700 mb-2 ${accessibilityMode ? 'text-lg' : ''}`}>
                {t.fullName}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={reportData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`flex-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    accessibilityMode ? 'p-4 text-lg' : 'p-3'
                  }`}
                  placeholder={t.enterFullName}
                />
                <VoiceInput
                  onTranscript={(text) => handleInputChange('name', text)}
                  language={language}
                />
              </div>
            </div>

            <div>
              <label className={`block font-medium text-gray-700 mb-2 ${accessibilityMode ? 'text-lg' : ''}`}>
                {t.phoneNumber}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="tel"
                  value={reportData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`flex-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    accessibilityMode ? 'p-4 text-lg' : 'p-3'
                  }`}
                  placeholder={t.enterPhoneNumber}
                />
                <VoiceInput
                  onTranscript={(text) => handleInputChange('phone', text)}
                  language={language}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={`block font-medium text-gray-700 mb-2 ${accessibilityMode ? 'text-lg' : ''}`}>
              {t.emailAddress}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="email"
                value={reportData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`flex-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  accessibilityMode ? 'p-4 text-lg' : 'p-3'
                }`}
                placeholder={t.enterEmailAddress}
              />
              <VoiceInput
                onTranscript={(text) => handleInputChange('email', text)}
                language={language}
              />
            </div>
          </div>

          {/* Incident Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block font-medium text-gray-700 mb-2 ${accessibilityMode ? 'text-lg' : ''}`}>
                {language === 'english' ? 'Date of Incident *' : 
                 language === 'hindi' ? 'घटना की तारीख *' : 
                 'घटनेची तारीख *'}
              </label>
              <input
                type="date"
                value={reportData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  accessibilityMode ? 'p-4 text-lg' : 'p-3'
                }`}
              />
            </div>

            <div>
              <label className={`block font-medium text-gray-700 mb-2 ${accessibilityMode ? 'text-lg' : ''}`}>
                {t.incidentLocation}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={reportData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={`flex-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    accessibilityMode ? 'p-4 text-lg' : 'p-3'
                  }`}
                  placeholder={t.enterIncidentLocation}
                />
                <VoiceInput
                  onTranscript={(text) => handleInputChange('location', text)}
                  language={language}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={`block font-medium text-gray-700 mb-2 ${accessibilityMode ? 'text-lg' : ''}`}>
              {t.descriptionOfIncident}
            </label>
            <div className="flex items-start space-x-2">
              <textarea
                value={reportData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={accessibilityMode ? 6 : 4}
                className={`flex-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  accessibilityMode ? 'p-4 text-lg' : 'p-3'
                }`}
                placeholder={t.describeIncident}
              />
              <VoiceInput
                onTranscript={(text) => handleInputChange('description', reportData.description + ' ' + text)}
                language={language}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!reportData.type || !reportData.name || !reportData.phone || !reportData.description}
            className={`w-full bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${
              accessibilityMode ? 'py-6 text-xl' : 'py-4 text-lg'
            }`}
          >
            {language === 'english' ? 'Submit Report' : 
             language === 'hindi' ? 'रिपोर्ट जमा करें' : 
             'रिपोर्ट जमा करा'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileReport;