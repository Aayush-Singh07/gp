import React, { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Header from './Header';
import VoiceInput from './VoiceInput';
import { Language, translations } from '../types/language';
import { generatePCCPDF } from '../utils/pccPdfGenerator';
import { complaintsService } from '../lib/supabase';
import { generateReceipt } from '../utils/receiptGenerator';

interface PCCFilingProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
  onBack: () => void;
}

interface PCCData {
  pccType: string;
  purpose: string;
  personalInfo: {
    name: string;
    phone: string;
    email: string;
    address: string;
    dateOfBirth: string;
    placeOfBirth: string;
    fatherName: string;
    motherName: string;
  };
  documentsChecked: string[];
}

const PCCFiling: React.FC<PCCFilingProps> = ({ language, onLanguageChange, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenNumber, setTokenNumber] = useState('');
  const t = translations[language];
  const [pccData, setPccData] = useState<PCCData>({
    pccType: '',
    purpose: '',
    personalInfo: {
      name: '',
      phone: '',
      email: '',
      address: '',
      dateOfBirth: '',
      placeOfBirth: '',
      fatherName: '',
      motherName: ''
    },
    documentsChecked: []
  });

  const steps = [
    { number: 1, title: t.selectPccType },
    { number: 2, title: t.enterPurpose },
    { number: 3, title: t.pccPersonalInfo },
    { number: 4, title: t.pccDocuments },
    { number: 5, title: t.pccPreview }
  ];

  const pccTypes = [
    t.pccTypes.employment,
    t.pccTypes.visa,
    t.pccTypes.immigration,
    t.pccTypes.education,
    t.pccTypes.business,
    t.pccTypes.others
  ];

  const requiredDocuments = [
    language === 'english' ? 'Aadhaar Card' : language === 'hindi' ? 'आधार कार्ड' : 'आधार कार्ड',
    language === 'english' ? 'Passport Size Photographs (2)' : language === 'hindi' ? 'पासपोर्ट साइज फोटो (2)' : 'पासपोर्ट साइज फोटो (2)',
    language === 'english' ? 'Birth Certificate' : language === 'hindi' ? 'जन्म प्रमाण पत्र' : 'जन्म प्रमाणपत्र',
    language === 'english' ? 'Address Proof' : language === 'hindi' ? 'पता प्रमाण' : 'पत्त्याचो पुरावो',
    language === 'english' ? 'Passport (if applying for visa/immigration)' : language === 'hindi' ? 'पासपोर्ट (वीजा/आप्रवासन के लिए)' : 'पासपोर्ट (व्हिसा/स्थलांतराखातीर)',
    language === 'english' ? 'Employment Letter (if for employment)' : language === 'hindi' ? 'नियुक्ति पत्र (रोजगार के लिए)' : 'नोकरीचे पत्र (नोकरीखातीर)'
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handlePccTypeSelect = (type: string) => {
    setPccData({ ...pccData, pccType: type });
  };

  const handlePurposeChange = (purpose: string) => {
    setPccData({ ...pccData, purpose });
  };

  const handlePersonalInfoChange = (field: string, value: string) => {
    setPccData({
      ...pccData,
      personalInfo: { ...pccData.personalInfo, [field]: value }
    });
  };

  const handleDocumentCheck = (document: string) => {
    const updatedDocs = pccData.documentsChecked.includes(document)
      ? pccData.documentsChecked.filter(doc => doc !== document)
      : [...pccData.documentsChecked, document];
    
    setPccData({ ...pccData, documentsChecked: updatedDocs });
  };

  const generateDraft = () => {
    const token = 'PCC' + Math.random().toString().substr(2, 8).toUpperCase();
    setTokenNumber(token);
    
    // Save to database
    savePCCToDatabase(token);
    
    // Generate receipt instead of full PDF
    generateReceipt(token, 'pcc', pccData.personalInfo.name, language);
    
    setShowTokenModal(true);
  };
  
  const savePCCToDatabase = async (token: string) => {
    try {
      await complaintsService.create({
        type: 'pcc',
        token_number: token,
        complainant_name: pccData.personalInfo.name,
        complainant_phone: pccData.personalInfo.phone,
        complainant_email: pccData.personalInfo.email,
        complaint_data: pccData,
        status: 'pending'
      });
    } catch (error) {
      console.error('Error saving PCC application:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.selectPccType.replace('\n', ' ')}</h2>
            {pccTypes.map((type) => (
              <div
                key={type}
                onClick={() => handlePccTypeSelect(type)}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                  pccData.pccType === type
                    ? 'bg-yellow-500 text-white shadow-lg'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-lg">{type}</span>
                  <div className={`w-6 h-6 rounded-full border-2 ${
                    pccData.pccType === type
                      ? 'bg-white border-white'
                      : 'border-gray-400'
                  }`}>
                    {pccData.pccType === type && (
                      <div className="w-full h-full rounded-full bg-yellow-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.enterPurpose.replace('\n', ' ')}</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.purpose}</label>
              <div className="flex items-center space-x-2">
                <textarea
                  value={pccData.purpose}
                  onChange={(e) => handlePurposeChange(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder={t.enterPurposeDetails}
                />
                <VoiceInput
                  onTranscript={(text) => handlePurposeChange(pccData.purpose + ' ' + text)}
                  language={language}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.pccPersonalInfo.replace('\n', ' ')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.fullName}</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={pccData.personalInfo.name}
                    onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t.enterFullName}
                  />
                  <VoiceInput
                    onTranscript={(text) => handlePersonalInfoChange('name', text)}
                    language={language}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.phoneNumber}</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="tel"
                    value={pccData.personalInfo.phone}
                    onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t.enterPhoneNumber}
                  />
                  <VoiceInput
                    onTranscript={(text) => handlePersonalInfoChange('phone', text)}
                    language={language}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.emailAddress}</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="email"
                    value={pccData.personalInfo.email}
                    onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t.enterEmailAddress}
                  />
                  <VoiceInput
                    onTranscript={(text) => handlePersonalInfoChange('email', text)}
                    language={language}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.address}</label>
                <div className="flex items-center space-x-2">
                  <textarea
                    value={pccData.personalInfo.address}
                    onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder={t.enterCompleteAddress}
                  />
                  <VoiceInput
                    onTranscript={(text) => handlePersonalInfoChange('address', pccData.personalInfo.address + ' ' + text)}
                    language={language}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'english' ? 'Date of Birth *' : language === 'hindi' ? 'जन्म तिथि *' : 'जन्म तारीख *'}
                </label>
                <input
                  type="date"
                  value={pccData.personalInfo.dateOfBirth}
                  onChange={(e) => handlePersonalInfoChange('dateOfBirth', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'english' ? 'Place of Birth *' : language === 'hindi' ? 'जन्म स्थान *' : 'जन्म जागा *'}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={pccData.personalInfo.placeOfBirth}
                    onChange={(e) => handlePersonalInfoChange('placeOfBirth', e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={language === 'english' ? 'Enter place of birth' : language === 'hindi' ? 'जन्म स्थान दर्ज करें' : 'जन्म जागा घाला'}
                  />
                  <VoiceInput
                    onTranscript={(text) => handlePersonalInfoChange('placeOfBirth', text)}
                    language={language}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'english' ? "Father's Name *" : language === 'hindi' ? 'पिता का नाम *' : 'बापायचे नांव *'}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={pccData.personalInfo.fatherName}
                    onChange={(e) => handlePersonalInfoChange('fatherName', e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={language === 'english' ? "Enter father's name" : language === 'hindi' ? 'पिता का नाम दर्ज करें' : 'बापायचे नांव घाला'}
                  />
                  <VoiceInput
                    onTranscript={(text) => handlePersonalInfoChange('fatherName', text)}
                    language={language}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'english' ? "Mother's Name *" : language === 'hindi' ? 'माता का नाम *' : 'आवयचे नांव *'}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={pccData.personalInfo.motherName}
                    onChange={(e) => handlePersonalInfoChange('motherName', e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={language === 'english' ? "Enter mother's name" : language === 'hindi' ? 'माता का नाम दर्ज करें' : 'आवयचे नांव घाला'}
                  />
                  <VoiceInput
                    onTranscript={(text) => handlePersonalInfoChange('motherName', text)}
                    language={language}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.requiredDocuments}</h2>
            <div className="bg-yellow-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-yellow-800">
                {t.documentsNote}
              </p>
            </div>
            <div className="space-y-3">
              {requiredDocuments.map((doc, index) => (
                <div
                  key={index}
                  onClick={() => handleDocumentCheck(doc)}
                  className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                >
                  <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                    pccData.documentsChecked.includes(doc)
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300'
                  }`}>
                    {pccData.documentsChecked.includes(doc) && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-gray-700">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.pccPreview.replace('\n', ' ')}</h2>
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">{t.pccType}</h3>
                <p className="text-gray-600">{pccData.pccType}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">{t.purposeDetails}</h3>
                <p className="text-gray-600">{pccData.purpose}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">{t.personalInformation}</h3>
                <div className="text-gray-600 space-y-1">
                  <p>{t.name} {pccData.personalInfo.name}</p>
                  <p>{t.phone} {pccData.personalInfo.phone}</p>
                  <p>{t.email} {pccData.personalInfo.email}</p>
                  <p>{t.address.replace(' *', ':')} {pccData.personalInfo.address}</p>
                  <p>{language === 'english' ? 'Date of Birth:' : language === 'hindi' ? 'जन्म तिथि:' : 'जन्म तारीख:'} {pccData.personalInfo.dateOfBirth}</p>
                  <p>{language === 'english' ? 'Place of Birth:' : language === 'hindi' ? 'जन्म स्थान:' : 'जन्म जागा:'} {pccData.personalInfo.placeOfBirth}</p>
                  <p>{language === 'english' ? "Father's Name:" : language === 'hindi' ? 'पिता का नाम:' : 'बापायचे नांव:'} {pccData.personalInfo.fatherName}</p>
                  <p>{language === 'english' ? "Mother's Name:" : language === 'hindi' ? 'माता का नाम:' : 'आवयचे नांव:'} {pccData.personalInfo.motherName}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">{t.documentsAvailable}</h3>
                <p className="text-gray-600">{pccData.documentsChecked.length} {t.outOf} {requiredDocuments.length} {t.documentsChecked}</p>
              </div>
            </div>
            
            <button
              onClick={generateDraft}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              {t.generateDraft}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header language={language} onLanguageChange={onLanguageChange} showLanguageToggle={false} />
      
      <div className="p-4">
        <div className="bg-white rounded-lg p-4 mb-4">
          {/* Progress Header */}
          <div className="flex items-center mb-6">
            <button onClick={handleBack} className="mr-4">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">{t.pccFiling}</h1>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8 px-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="text-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep >= step.number
                      ? 'bg-blue-900 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step.number}
                  </div>
                  <div className="text-xs mt-2 max-w-16 leading-tight">
                    {step.title.split('\n').map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    currentStep > step.number ? 'bg-blue-900' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="mb-6">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          {currentStep < 5 && (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !pccData.pccType) ||
                (currentStep === 2 && !pccData.purpose) ||
                (currentStep === 3 && (!pccData.personalInfo.name || !pccData.personalInfo.phone || !pccData.personalInfo.address || !pccData.personalInfo.dateOfBirth || !pccData.personalInfo.placeOfBirth || !pccData.personalInfo.fatherName || !pccData.personalInfo.motherName))
              }
              className="w-full bg-blue-900 text-white py-4 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {t.next}
            </button>
          )}
        </div>
      </div>

      {/* Token Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">{t.pccDraftGeneratedSuccess}</h3>
            <p className="text-gray-600 mb-4">{t.pccDraftGenerated}</p>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-1">{t.yourPccTokenNumber}</p>
              <p className="text-2xl font-bold text-blue-900">{tokenNumber}</p>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              {t.saveTokenNote}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setShowTokenModal(false)}
                className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
              >
                {t.continue}
              </button>
              <button
                onClick={onBack}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                {t.backToHome}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PCCFiling;