import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { Language, translations } from '../types/language';
import { complaintsService } from '../lib/supabase';
import { generateReceipt } from '../utils/receiptGenerator';
import VoiceInput from './VoiceInput';

interface EmergencyModalProps {
  language: Language;
  onClose: () => void;
}

const EmergencyModal: React.FC<EmergencyModalProps> = ({ language, onClose }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedIssue, setSelectedIssue] = useState('');
  const [sosTicketId, setSosTicketId] = useState('');
  const t = translations[language];

  const emergencyIssues = [
    t.medicalEmergency,
    t.fireEmergency,
    t.accidentEmergency,
    t.crimeInProgress,
    t.domesticViolence,
    t.kidnapping,
    t.robbery,
    t.others
  ];

  const handleNext = () => {
    if (step === 1 && name && selectedIssue) {
      const ticketId = 'SOS' + Math.random().toString().substr(2, 8).toUpperCase();
      setSosTicketId(ticketId);
      saveSOSToDatabase(ticketId);
      generateReceipt(ticketId, 'sos', name, language);
      setStep(2);
    }
  };
  
  const saveSOSToDatabase = async (ticketId: string) => {
    try {
      await complaintsService.create({
        type: 'sos',
        token_number: ticketId,
        complainant_name: name,
        complainant_phone: '', // Not collected in SOS
        complaint_data: {
          emergencyType: selectedIssue,
          timestamp: new Date().toISOString()
        },
        status: 'pending'
      });
    } catch (error) {
      console.error('Error saving SOS:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {step === 1 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">{t.emergencyTitle}</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.enterName}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t.enterName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.selectEmergencyIssue}
                </label>
                <div className="space-y-2">
                  {emergencyIssues.map((issue) => (
                    <div
                      key={issue}
                      onClick={() => setSelectedIssue(issue)}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedIssue === issue
                          ? 'bg-red-500 text-white shadow-lg'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{issue}</span>
                        <div className={`w-5 h-5 rounded-full border-2 ${
                          selectedIssue === issue
                            ? 'bg-white border-white'
                            : 'border-gray-400'
                        }`}>
                          {selectedIssue === issue && (
                            <div className="w-full h-full rounded-full bg-red-500 flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={!name || !selectedIssue}
                className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {t.next}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t.sosTicketGenerated}</h3>
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-1">{t.yourSosTicketId}</p>
                <p className="text-2xl font-bold text-red-600">{sosTicketId}</p>
              </div>
              <p className="text-gray-600 mb-6">{t.officerWillAssist}</p>
              <button
                onClick={onClose}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                {t.ok}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmergencyModal;