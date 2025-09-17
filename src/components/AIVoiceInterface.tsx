import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Volume2 } from 'lucide-react';
import { Language, translations } from '../types/language';

interface AIVoiceInterfaceProps {
  language: Language;
  onClose: () => void;
  accessibilityMode: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AIVoiceInterface: React.FC<AIVoiceInterfaceProps> = ({ 
  language, 
  onClose, 
  accessibilityMode 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const t = translations[language];

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      // Set language based on user selection
      const langCode = language === 'english' ? 'en-US' : 
                      language === 'hindi' ? 'hi-IN' : 'hi-IN'; // Fallback to Hindi for Konkani
      recognitionRef.current.lang = langCode;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleUserMessage(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsProcessing(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    synthRef.current = window.speechSynthesis;

    // Add welcome message
    const welcomeMessage: Message = {
      id: '1',
      text: t.aiWelcomeMessage,
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);

    // Speak welcome message
    setTimeout(() => {
      speakText(t.aiWelcomeMessage);
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

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isSpeaking) {
      setIsListening(true);
      setIsProcessing(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsProcessing(false);
    }
  };

  const speakText = (text: string) => {
    if (synthRef.current && !isSpeaking) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice based on language
      const voices = synthRef.current.getVoices();
      let voice = null;
      
      if (language === 'english') {
        voice = voices.find(v => v.lang.startsWith('en-IN')) ||
               voices.find(v => v.lang.startsWith('en-US')) ||
               voices.find(v => v.lang.startsWith('en'));
      } else if (language === 'hindi' || language === 'konkani') {
        voice = voices.find(v => v.lang.startsWith('hi-IN')) ||
               voices.find(v => v.lang.startsWith('hi'));
      }
      
      if (voice) utterance.voice = voice;
      utterance.rate = 0.8;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    }
  };

  const handleUserMessage = (text: string) => {
    setIsProcessing(true);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Generate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(text);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false);
      
      // Speak the response
      setTimeout(() => {
        speakText(aiResponse);
      }, 500);
    }, 1000);
  };

  const generateAIResponse = (userText: string): string => {
    const lowerText = userText.toLowerCase();
    
    // Enhanced AI responses based on user input
    if (lowerText.includes('complaint') || lowerText.includes('report') || lowerText.includes('शिकायत') || lowerText.includes('रिपोर्ट')) {
      return language === 'english' ? 
        "I can help you file a report. Please use the 'File Report' option from the main menu to get started with the step-by-step process. You can report theft, harassment, cybercrime, and other issues." :
        language === 'hindi' ?
        "मैं आपकी रिपोर्ट दर्ज करने में मदद कर सकता हूं। कृपया मुख्य मेनू से 'रिपोर्ट दर्ज करें' विकल्प का उपयोग करें। आप चोरी, उत्पीड़न, साइबर अपराध और अन्य मुद्दों की रिपोर्ट कर सकते हैं।" :
        "हांव तुमची रिपोर्ट दाखल करपाक मदत करूं शकतां। कृपया मुख्य मेन्यू वयल्यान 'रिपोर्ट दाखल करा' पर्याय वापरा। तुम्ही चोरी, छळवणूक, सायबर गुन्हा आनी हेर मुद्द्यांची रिपोर्ट करूं शकता.";
    } 
    
    else if (lowerText.includes('emergency') || lowerText.includes('help') || lowerText.includes('urgent') || lowerText.includes('आपातकाल') || lowerText.includes('मदद') || lowerText.includes('तातकाळ')) {
      return language === 'english' ? 
        "For emergencies, please use the red 'Emergency Help' button immediately. If this is urgent, press that button now. You can also call 100 for police, 108 for ambulance, or 101 for fire services." :
        language === 'hindi' ?
        "आपातकाल के लिए, कृपया तुरंत लाल 'आपातकालीन सहायता' बटन का उपयोग करें। आप पुलिस के लिए 100, एम्बुलेंस के लिए 108, या अग्निशमन सेवा के लिए 101 पर कॉल कर सकते हैं।" :
        "तातकाळीन परिस्थितीखातीर, कृपया ताबडतोब लाल 'तातकाळ मदत' बटन दाबा। तुम्ही पोलिसांखातीर 100, रुग्णवाहिकेखातीर 108, वा अग्निशमन सेवेखातीर 101 वर कॉल करूं शकता.";
    } 
    
    else if (lowerText.includes('pcc') || lowerText.includes('clearance') || lowerText.includes('certificate') || lowerText.includes('प्रमाणपत्र')) {
      return language === 'english' ? 
        "For Police Clearance Certificate, please select 'File Report' and then choose 'PCC' from the available options. You'll need passport photos, identity proof, and purpose declaration." :
        language === 'hindi' ?
        "पुलिस क्लीयरेंस सर्टिफिकेट के लिए, कृपया 'रिपोर्ट दर्ज करें' चुनें और फिर उपलब्ध विकल्पों से 'पीसीसी' चुनें। आपको पासपोर्ट फोटो, पहचान प्रमाण और उद्देश्य घोषणा की आवश्यकता होगी।" :
        "पोलिस क्लिअरन्स सर्टिफिकेटाखातीर, कृपया 'रिपोर्ट दाखल करा' निवडा आनी मगीर उपलब्ध पर्यायांतल्यान 'पीसीसी' निवडा। तुमकां पासपोर्ट फोटो, वळख पुरावो आनी हेतू घोषणा लागतली.";
    } 
    
    else if (lowerText.includes('translation') || lowerText.includes('translate') || lowerText.includes('language') || lowerText.includes('अनुवाद') || lowerText.includes('भाषा') || lowerText.includes('भाषांतर')) {
      return language === 'english' ? 
        "I can help with translation! Use the 'Translation Assistant' feature for real-time translation between you and police officers. It supports voice and text translation." :
        language === 'hindi' ?
        "मैं अनुवाद में मदद कर सकता हूं! आप और पुलिस अधिकारियों के बीच रियल-टाइम अनुवाद के लिए 'अनुवाद सहायक' सुविधा का उपयोग करें। यह आवाज और टेक्स्ट अनुवाद का समर्थन करता है।" :
        "हांव भाषांतरांत मदत करूं शकतां! तुमच्या आनी पोलिस अधिकाऱ्यांमदीं रियल-टायम भाषांतराखातीर 'भाषांतर सहाय्यक' सुविधा वापरा. ही आवाज आनी मजकूर भाषांतराक आधार दिता.";
    } 
    
    else if (lowerText.includes('information') || lowerText.includes('rights') || lowerText.includes('legal') || lowerText.includes('जानकारी') || lowerText.includes('अधिकार') || lowerText.includes('कानूनी') || lowerText.includes('माहिती') || lowerText.includes('हक्क')) {
      return language === 'english' ? 
        "I can provide information about your legal rights and procedures. Use 'Get Information' to learn about common issues like theft, harassment, traffic violations, and required documents." :
        language === 'hindi' ?
        "मैं आपके कानूनी अधिकारों और प्रक्रियाओं के बारे में जानकारी प्रदान कर सकता हूं। चोरी, उत्पीड़न, यातायात उल्लंघन और आवश्यक दस्तावेजों जैसे सामान्य मुद्दों के बारे में जानने के लिए 'जानकारी प्राप्त करें' का उपयोग करें।" :
        "हांव तुमच्या कायदेशीर हक्कां आनी प्रक्रियांविशीं माहिती दिवंक शकतां. चोरी, छळवणूक, वाहतूक उल्लंघन आनी गरजेचे कागदपत्रांविशीं जाणपाखातीर 'माहिती मेळवा' वापरा.";
    } 
    
    else if (lowerText.includes('thank') || lowerText.includes('thanks') || lowerText.includes('धन्यवाद') || lowerText.includes('देव बरे')) {
      return language === 'english' ? 
        "You're welcome! I'm here to help. Is there anything else you need assistance with? You can ask about filing reports, emergency help, or getting information about your rights." :
        language === 'hindi' ?
        "आपका स्वागत है! मैं मदद के लिए यहां हूं। क्या कोई और चीज है जिसमें आपको सहायता चाहिए? आप रिपोर्ट दर्ज करने, आपातकालीन सहायता, या अपने अधिकारों के बारे में जानकारी के बारे में पूछ सकते हैं।" :
        "तुमचे स्वागत! हांव मदतीखातीर हांगा आसा. खंयचे हेर आसा जाका तुमकां मदत जाय? तुम्ही रिपोर्ट दाखल करप, तातकाळीन मदत, वा तुमच्या हक्कांविशीं माहिती विचारूं शकता.";
    } 
    
    else if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('namaste') || lowerText.includes('नमस्ते') || lowerText.includes('नमस्कार')) {
      return language === 'english' ? 
        "Hello! Welcome to Goa Police AI Assistant. I'm here to help you with filing reports, emergency assistance, getting legal information, and translation services. How can I assist you today?" :
        language === 'hindi' ?
        "नमस्ते! गोवा पुलिस एआई सहायक में आपका स्वागत है। मैं रिपोर्ट दर्ज करने, आपातकालीन सहायता, कानूनी जानकारी प्राप्त करने और अनुवाद सेवाओं में आपकी मदद के लिए यहां हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?" :
        "नमस्कार! गोवा पोलिस एआई सहाय्यकांत तुमचे स्वागत. हांव रिपोर्ट दाखल करप, तातकाळीन मदत, कायदेशीर माहिती मेळोवप आनी भाषांतर सेवांनी तुमची मदत करपाखातीर हांगा आसा. आज हांव तुमची कशी मदत करूं शकतां?";
    } 
    
    else {
      return language === 'english' ? 
        "I'm here to help you with police services. You can file reports, get information about your rights, request emergency help, or use translation services. What would you like to do?" :
        language === 'hindi' ?
        "मैं पुलिस सेवाओं में आपकी मदद के लिए यहां हूं। आप रिपोर्ट दर्ज कर सकते हैं, अपने अधिकारों के बारे में जानकारी प्राप्त कर सकते हैं, आपातकालीन सहायता का अनुरोध कर सकते हैं, या अनुवाद सेवाओं का उपयोग कर सकते हैं। आप क्या करना चाहेंगे?" :
        "हांव पोलिस सेवांनी तुमची मदत करपाखातीर हांगा आसा। तुम्ही रिपोर्ट दाखल करूं शकता, तुमच्या हक्कांविशीं माहिती मेळोवूं शकता, तातकाळीन मदतीची विनंती करूं शकता, वा भाषांतर सेवांचो वापर करूं शकता. तुम्ही कितें करूंक सोदता?";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-2xl shadow-2xl w-full flex flex-col ${
        accessibilityMode ? 'max-w-2xl max-h-[85vh]' : 'max-w-md max-h-[80vh]'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
          <h2 className={`font-bold ${accessibilityMode ? 'text-xl' : 'text-lg'}`}>
            {t.aiVoiceAssistant}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                } ${accessibilityMode ? 'max-w-md px-6 py-3' : ''}`}
              >
                <p className={accessibilityMode ? 'text-base' : 'text-sm'}>{message.text}</p>
                <p className={`mt-1 opacity-70 ${accessibilityMode ? 'text-sm' : 'text-xs'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 border-t">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isSpeaking || isProcessing}
              className={`p-4 rounded-full transition-all duration-300 ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : isSpeaking
                  ? 'bg-blue-500 text-white'
                  : 'bg-green-500 text-white hover:bg-green-600'
              } disabled:opacity-50 ${accessibilityMode ? 'p-6' : ''}`}
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
            {isListening ? t.listening :
             isSpeaking ? t.speaking :
             isProcessing ? t.processing :
             t.tapToSpeak}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIVoiceInterface;