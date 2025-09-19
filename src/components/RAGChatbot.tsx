import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, MicOff, Volume2, Send, RotateCcw, MessageCircle } from 'lucide-react';
import { Language, translations } from '../types/language';
import { ragService } from '../services/ragService';

interface RAGChatbotProps {
  language: Language;
  onClose: () => void;
  accessibilityMode: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  detectedLanguage?: string;
}

const RAGChatbot: React.FC<RAGChatbotProps> = ({ 
  language, 
  onClose, 
  accessibilityMode 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState<string>('en');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  useEffect(() => {
    // Initialize speech recognition with multi-language support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 3; // Get multiple alternatives for better detection
      
      // Start with auto-detection (English as default)
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        
        console.log('Speech recognition result:', transcript, 'Confidence:', confidence);
        
        // Auto-detect language from transcript
        const detectedLang = ragService.detectLanguage(transcript);
        setDetectedLanguage(detectedLang);
        
        handleUserMessage(transcript, detectedLang);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsProcessing(false);
        
        // Try different language if recognition fails
        if (event.error === 'language-not-supported') {
          console.log('Language not supported, trying Hindi fallback');
          recognitionRef.current!.lang = 'hi-IN';
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (isProcessing) {
          setIsProcessing(false);
        }
      };

      recognitionRef.current.onstart = () => {
        setIsProcessing(false);
        console.log('Speech recognition started');
      };
    }

    // Initialize speech synthesis
    synthRef.current = window.speechSynthesis;

    // Add welcome message
    const welcomeMessage: Message = {
      id: '1',
      text: getWelcomeMessage(language),
      sender: 'ai',
      timestamp: new Date(),
      detectedLanguage: getLanguageCode(language)
    };
    setMessages([welcomeMessage]);

    // Speak welcome message
    setTimeout(() => {
      speakText(welcomeMessage.text, getLanguageCode(language));
    }, 500);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getWelcomeMessage = (lang: Language): string => {
    switch (lang) {
      case 'hindi':
        return 'नमस्ते! मैं गोवा पुलिस एआई सहायक हूं। मैं आपकी कैसे मदद कर सकता हूं? आप मुझसे पुलिस प्रक्रियाओं, अपने अधिकारों, या किसी भी कानूनी मुद्दे के बारे में पूछ सकते हैं।';
      case 'konkani':
        return 'नमस्कार! हांव गोवा पोलिस एआई सहाय्यक. हांव तुमची कशी मदत करूं शकतां? तुम्ही म्हाका पोलिस प्रक्रिया, तुमचे हक्क, वा खंयच्याय कायदेशीर मुद्द्याविशीं विचारूं शकता.';
      default:
        return 'Hello! I am Goa Police AI Assistant. How can I help you today? You can ask me about police procedures, your rights, or any legal matters.';
    }
  };

  const getLanguageCode = (lang: Language): string => {
    switch (lang) {
      case 'hindi': return 'hi';
      case 'konkani': return 'kok';
      default: return 'en';
    }
  };

  const getSpeechLanguageCode = (langCode: string): string => {
    switch (langCode) {
      case 'hi': return 'hi-IN';
      case 'kok': return 'hi-IN'; // Fallback to Hindi for Konkani
      case 'ru': return 'ru-RU';
      default: return 'en-IN';
    }
  };

  const startListening = async () => {
    if (recognitionRef.current && !isListening && !isSpeaking) {
      try {
        // Request microphone permission first
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        setIsListening(true);
        setIsProcessing(true);
        
        // Set recognition language based on detected or default language
        const speechLang = getSpeechLanguageCode(detectedLanguage);
        recognitionRef.current.lang = speechLang;
        
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
        setIsProcessing(false);
        
        const errorMessage = language === 'english' ? 'Microphone access denied. Please allow microphone access and try again.' :
                            language === 'hindi' ? 'माइक्रोफोन एक्सेस अस्वीकृत। कृपया माइक्रोफोन एक्सेस की अनुमति दें।' :
                            'मायक्रोफोन प्रवेश नाकारला. कृपया मायक्रोफोन प्रवेशाची परवानगी द्या.';
        alert(errorMessage);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsProcessing(false);
    }
  };

  const speakText = (text: string, langCode: string) => {
    if (synthRef.current && !isSpeaking) {
      setIsSpeaking(true);
      
      // Cancel any ongoing speech
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language for speech synthesis
      const speechLang = getSpeechLanguageCode(langCode);
      utterance.lang = speechLang;
      
      // Find appropriate voice
      const voices = synthRef.current.getVoices();
      let voice = null;
      
      if (langCode === 'en') {
        voice = voices.find(v => v.lang.startsWith('en-IN')) ||
               voices.find(v => v.lang.startsWith('en-US')) ||
               voices.find(v => v.lang.startsWith('en'));
      } else if (langCode === 'hi' || langCode === 'kok') {
        voice = voices.find(v => v.lang.startsWith('hi-IN')) ||
               voices.find(v => v.lang.startsWith('hi'));
      } else if (langCode === 'ru') {
        voice = voices.find(v => v.lang.startsWith('ru-RU')) ||
               voices.find(v => v.lang.startsWith('ru'));
      }
      
      if (voice) {
        utterance.voice = voice;
        console.log('Using voice:', voice.name, voice.lang);
      }
      
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onend = () => {
        setIsSpeaking(false);
        console.log('Speech synthesis completed');
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
      };

      synthRef.current.speak(utterance);
    }
  };

  const handleUserMessage = async (text: string, detectedLang?: string) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    
    // Use detected language or fallback to current language
    const userLangCode = detectedLang || getLanguageCode(language);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date(),
      detectedLanguage: userLangCode
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    try {
      // Get RAG response
      const { response, language: responseLang } = await ragService.generateResponse(text);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date(),
        detectedLanguage: responseLang
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Speak the response in the detected language
      setTimeout(() => {
        speakText(response, responseLang);
      }, 500);
      
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Fallback response
      const fallbackResponse = language === 'english' ? 
        'I apologize, but I am having trouble processing your request. Please try again.' :
        language === 'hindi' ? 
        'मुझे खेद है, लेकिन मुझे आपके अनुरोध को संसाधित करने में समस्या हो रही है। कृपया पुनः प्रयास करें।' :
        'म्हाका माफ करा, पूण म्हाका तुमची विनंती प्रक्रिया करपांत अडचण येत आसा. कृपया परत प्रयत्न करा.';
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: fallbackResponse,
        sender: 'ai',
        timestamp: new Date(),
        detectedLanguage: getLanguageCode(language)
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      handleUserMessage(inputText);
    }
  };

  const clearConversation = () => {
    setMessages([{
      id: '1',
      text: getWelcomeMessage(language),
      sender: 'ai',
      timestamp: new Date(),
      detectedLanguage: getLanguageCode(language)
    }]);
    ragService.clearHistory();
  };

  const getLanguageFlag = (langCode: string): string => {
    switch (langCode) {
      case 'hi': return 'हि';
      case 'kok': return 'कोंक';
      case 'ru': return 'РУ';
      default: return 'EN';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-2xl shadow-2xl w-full flex flex-col ${
        accessibilityMode ? 'max-w-4xl max-h-[90vh]' : 'max-w-2xl max-h-[85vh]'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center">
            <MessageCircle className="w-6 h-6 mr-3" />
            <div>
              <h2 className={`font-bold ${accessibilityMode ? 'text-xl' : 'text-lg'}`}>
                {language === 'english' ? 'AI Police Assistant' :
                 language === 'hindi' ? 'एआई पुलिस सहायक' :
                 'एआई पोलिस सहाय्यक'}
              </h2>
              <p className={`text-green-200 ${accessibilityMode ? 'text-base' : 'text-sm'}`}>
                {language === 'english' ? 'Smart FAQ & Legal Guidance' :
                 language === 'hindi' ? 'स्मार्ट FAQ और कानूनी मार्गदर्शन' :
                 'स्मार्ट FAQ आनी कायदेशीर मार्गदर्शन'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Language Indicator */}
            <div className="bg-yellow-500 text-green-900 px-3 py-1 rounded-full text-sm font-bold">
              {getLanguageFlag(detectedLanguage)}
            </div>
            
            <button
              onClick={clearConversation}
              className="bg-green-500 text-white p-2 rounded-full hover:bg-green-400 transition-colors"
              title="Clear Conversation"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800 shadow-md border'
                } ${accessibilityMode ? 'px-6 py-4' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-semibold ${accessibilityMode ? 'text-base' : 'text-xs'} ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.sender === 'user' ? 
                      (language === 'english' ? 'You' : 
                       language === 'hindi' ? 'आप' : 'तुम्ही') :
                      (language === 'english' ? 'AI Assistant' : 
                       language === 'hindi' ? 'एआई सहायक' : 'एआई सहाय्यक')
                    }
                    {message.detectedLanguage && (
                      <span className="ml-2 opacity-75">
                        [{getLanguageFlag(message.detectedLanguage)}]
                      </span>
                    )}
                  </span>
                  
                  {message.sender === 'ai' && (
                    <button
                      onClick={() => speakText(message.text, message.detectedLanguage || 'en')}
                      className={`ml-2 opacity-75 hover:opacity-100 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                      disabled={isSpeaking}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <p className={`leading-relaxed ${accessibilityMode ? 'text-lg' : 'text-sm'}`}>
                  {message.text}
                </p>
                
                <p className={`mt-1 opacity-70 ${accessibilityMode ? 'text-sm' : 'text-xs'} ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-3 rounded-2xl shadow-md border">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-gray-600 text-sm">
                    {language === 'english' ? 'AI is thinking...' :
                     language === 'hindi' ? 'एआई सोच रहा है...' :
                     'एआई विचार करत आसा...'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white rounded-b-2xl">
          {/* Language Detection Status */}
          <div className="flex items-center justify-center mb-3">
            <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
              {language === 'english' ? 'Detected Language:' :
               language === 'hindi' ? 'पहचानी गई भाषा:' :
               'वळखल्ली भास:'} 
              <span className="font-bold ml-1">{getLanguageFlag(detectedLanguage)}</span>
            </div>
          </div>
          
          {/* Text Input */}
          <div className="flex items-center space-x-2 mb-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleSendMessage()}
              placeholder={
                language === 'english' ? 'Type your question or use voice...' :
                language === 'hindi' ? 'अपना प्रश्न टाइप करें या आवाज का उपयोग करें...' :
                'तुमचो प्रश्न टायप करा वा आवाज वापरा...'
              }
              className={`flex-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                accessibilityMode ? 'p-4 text-lg' : 'p-3'
              }`}
              disabled={isProcessing || isListening}
            />
            
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isProcessing || isListening}
              className={`bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${
                accessibilityMode ? 'p-4' : 'p-3'
              }`}
            >
              <Send className={accessibilityMode ? 'w-6 h-6' : 'w-5 h-5'} />
            </button>
          </div>
          
          {/* Voice Controls */}
          <div className="flex items-center justify-center">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing && !isListening}
              className={`p-4 rounded-full transition-all duration-300 ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : isSpeaking
                  ? 'bg-blue-500 text-white'
                  : 'bg-green-500 text-white hover:bg-green-600'
              } disabled:opacity-50 ${accessibilityMode ? 'p-6' : ''}`}
              aria-label={
                isListening ? 'Stop recording' : 
                isSpeaking ? 'AI is speaking' : 'Start voice input'
              }
            >
              {isListening ? (
                <MicOff className={accessibilityMode ? 'w-8 h-8' : 'w-6 h-6'} />
              ) : isSpeaking ? (
                <Volume2 className={accessibilityMode ? 'w-8 h-8' : 'w-6 h-6'} />
              ) : (
                <Mic className={accessibilityMode ? 'w-8 h-8' : 'w-6 h-6'} />
              )}
            </button>
          </div>
          
          <p className={`text-center text-gray-500 mt-2 ${accessibilityMode ? 'text-base' : 'text-xs'}`}>
            {isListening ? 
              (language === 'english' ? 'Listening... Speak now' :
               language === 'hindi' ? 'सुन रहा हूं... अब बोलें' :
               'ऐकत आसा... आता बोला') :
             isSpeaking ? 
              (language === 'english' ? 'AI is speaking...' :
               language === 'hindi' ? 'एआई बोल रहा है...' :
               'एआई बोलत आसा...') :
             isProcessing ? 
              (language === 'english' ? 'Processing...' :
               language === 'hindi' ? 'प्रसंस्करण...' :
               'प्रक्रिया...') :
              (language === 'english' ? 'Press mic or type to ask questions' :
               language === 'hindi' ? 'प्रश्न पूछने के लिए माइक दबाएं या टाइप करें' :
               'प्रश्न विचारपाखातीर माइक दाबा वा टायप करा')
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default RAGChatbot;