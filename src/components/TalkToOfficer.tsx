import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Mic, MicOff } from 'lucide-react';
import { Language, translations } from '../types/language';
import { translateService } from '../services/translateService';
import { whisperService } from '../services/whisperService';

interface TalkToOfficerProps {
  language: Language;
  onBack: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'visitor' | 'officer';
  timestamp: Date;
  originalText?: string;
  translatedText?: string;
}

const TalkToOfficer: React.FC<TalkToOfficerProps> = ({ language, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const t = translations[language];

  useEffect(() => {
    // Add welcome message from officer
    const welcomeMessage: Message = {
      id: '1',
      text: language === 'english' ? 
        'Hello! I am Officer Sharma. How can I assist you today?' :
        language === 'hindi' ? 
        'नमस्ते! मैं अधिकारी शर्मा हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?' :
        'नमस्कार! हांव अधिकारी शर्मा. आज हांव तुमची कशी मदत करूं शकतां?',
      sender: 'officer',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const visitorMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'visitor',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, visitorMessage]);
    setInputText('');

    // Simulate officer response with translation
    setTimeout(async () => {
      try {
        // Translate visitor message to English for officer understanding
        const translatedToEnglish = language !== 'english' ? 
          await translateService.translateText(text, 'en', translateService.getLanguageCode(language)) : 
          text;

        // Generate officer response (in English)
        const officerResponseEn = generateOfficerResponse(translatedToEnglish);

        // Translate officer response to visitor's language
        const officerResponse = language !== 'english' ? 
          await translateService.translateText(officerResponseEn, translateService.getLanguageCode(language), 'en') :
          officerResponseEn;

        const officerMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: officerResponse,
          sender: 'officer',
          timestamp: new Date(),
          originalText: officerResponseEn,
          translatedText: language !== 'english' ? officerResponse : undefined
        };

        setMessages(prev => [...prev, officerMessage]);
      } catch (error) {
        console.error('Translation error:', error);
        // Fallback to English response
        const officerMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'I apologize, but I am having trouble with translation. Could you please try again?',
          sender: 'officer',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, officerMessage]);
      }
    }, 1000);
  };

  const generateOfficerResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('complaint') || lowerMessage.includes('file') || lowerMessage.includes('report')) {
      return "I understand you want to file a complaint. You can use our complaint filing system from the main menu. Would you like me to guide you through the process?";
    } else if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || lowerMessage.includes('help')) {
      return "If this is an emergency, please use the SOS button on the main screen immediately. For non-emergency assistance, I'm here to help. Can you tell me more about your situation?";
    } else if (lowerMessage.includes('pcc') || lowerMessage.includes('clearance') || lowerMessage.includes('certificate')) {
      return "For Police Clearance Certificate applications, you can use the PCC section from the main menu. The process is simple and guided. Do you need help with the requirements?";
    } else if (lowerMessage.includes('status') || lowerMessage.includes('track') || lowerMessage.includes('token')) {
      return "To check the status of your application, you'll need your token number. Do you have your token number with you?";
    } else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're welcome! I'm here to help. Is there anything else you need assistance with?";
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('namaste')) {
      return "Hello! I'm here to assist you with any police-related services. What can I help you with today?";
    } else {
      return "I understand your concern. Could you please provide more details so I can assist you better? You can also use our complaint filing system or emergency services if needed.";
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      const languageCode = translateService.getLanguageCode(language);
      const transcript = await whisperService.transcribeAudio(audioBlob, languageCode);
      await sendMessage(transcript);
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('Failed to process audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-4">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-4">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-bold">{t.talkToOfficer}</h1>
            <p className="text-blue-200 text-sm">
              {language === 'english' ? 'Officer Sharma - Available Now' :
               language === 'hindi' ? 'अधिकारी शर्मा - अभी उपलब्ध' :
               'अधिकारी शर्मा - आता उपलब्ध'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'visitor' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'visitor'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-800 shadow'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
            placeholder={
              language === 'english' ? 'Type your message...' :
              language === 'hindi' ? 'अपना संदेश टाइप करें...' :
              'तुमचो संदेश टायप करा...'
            }
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isProcessing}
          />
          
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`p-3 rounded-lg transition-colors ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <button
            onClick={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isProcessing}
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        {isProcessing && (
          <p className="text-center text-sm text-gray-500 mt-2">
            {language === 'english' ? 'Processing audio...' :
             language === 'hindi' ? 'ऑडियो प्रोसेसिंग...' :
             'ऑडिओ प्रोसेसिंग...'}
          </p>
        )}
      </div>
    </div>
  );
};

export default TalkToOfficer;