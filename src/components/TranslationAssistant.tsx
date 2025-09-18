import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mic, MicOff, Volume2, Languages, RotateCcw } from 'lucide-react';
import { Language, translations } from '../types/language';

interface TranslationAssistantProps {
  language: Language;
  onBack: () => void;
  accessibilityMode: boolean;  
}

interface Message {
  id: string;
  text: string;
  translatedText: string;
  sender: 'visitor' | 'officer';
  timestamp: Date;
}

const TranslationAssistant: React.FC<TranslationAssistantProps> = ({ 
  language, 
  onBack, 
  accessibilityMode 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<'visitor' | 'officer'>('visitor');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const t = translations[language];

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        handleTranslation(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', (event as any).error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [currentSpeaker, language]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      const langCode = currentSpeaker === 'visitor' 
        ? (language === 'english' ? 'en-US' : language === 'hindi' ? 'hi-IN' : 'gom-IN') 
        : 'en-US'; 
      recognitionRef.current.lang = langCode;
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Translate text using LibreTranslate API
  const translateText = async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
    try {
      const res = await fetch("https://libretranslate.de/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
          format: "text"
        })
      });

      const data = await res.json();
      return data?.translatedText || text;
    } catch (err) {
      console.error("Translation API error:", err);
      return `[Translation Failed: ${text}]`;
    }
  };

  const handleTranslation = async (text: string) => {
    let sourceLang = "auto"; 
    let targetLang = "en"; 

    if (currentSpeaker === "visitor") {
      // Visitor speaks -> translate to English
      sourceLang = language === "english" ? "en" : language === "hindi" ? "hi" : "gom";
      targetLang = "en";
    } else {
      // Officer speaks English -> translate to visitor's language
      sourceLang = "en";
      targetLang = language === "hindi" ? "hi" : language === "konkani" ? "gom" : "en";
    }

    const translatedText = await translateText(text, sourceLang, targetLang);

    const message: Message = {
      id: Date.now().toString(),
      text,
      translatedText,
      sender: currentSpeaker,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, message]);

    setTimeout(() => {
      speakText(
        translatedText,
        currentSpeaker === "visitor" ? "en-US" : getLanguageCode(language)
      );
    }, 500);
  };

  const getLanguageCode = (lang: Language): string => {
    switch (lang) {
      case "hindi": return "hi-IN";
      case "konkani": return "gom-IN"; // Konkani ISO code gom
      default: return "en-US";
    }
  };

  const speakText = (text: string, langCode: string) => {
    if ("speechSynthesis" in window && !isSpeaking) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith(langCode.split("-")[0]));
      if (voice) utterance.voice = voice;
      utterance.lang = langCode;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={onBack} className="mr-4">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center">
              <Languages className="w-8 h-8 mr-3" />
              <div>
                <h1 className={`font-bold ${accessibilityMode ? "text-xl" : "text-lg"}`}>
                  {t.translationAssistant}
                </h1>
                <p className={`text-purple-200 ${accessibilityMode ? "text-base" : "text-sm"}`}>
                  {language === "english"
                    ? "Real-time Translation"
                    : language === "hindi"
                    ? "रियल-टाइम अनुवाद"
                    : "रियल-टायम भाषांतर"}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={clearMessages}
            className="bg-purple-500 text-white p-2 rounded-full hover:bg-purple-400 transition-colors"
            title="Clear Messages"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Speaker Toggle */}
      <div className="p-4">
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-4">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setCurrentSpeaker("visitor")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                currentSpeaker === "visitor"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              } ${accessibilityMode ? "px-8 py-4 text-lg" : ""}`}
            >
              {language === "english" ? "Visitor" : language === "hindi" ? "आगंतुक" : "भेट देवपी"}
            </button>
            <div className="text-gray-400">
              <Languages className="w-6 h-6" />
            </div>
            <button
              onClick={() => setCurrentSpeaker("officer")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                currentSpeaker === "officer"
                  ? "bg-green-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              } ${accessibilityMode ? "px-8 py-4 text-lg" : ""}`}
            >
              {language === "english" ? "Officer" : language === "hindi" ? "अधिकारी" : "अधिकारी"}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-4 min-h-[400px] max-h-[400px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Languages className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className={accessibilityMode ? "text-lg" : ""}>
                  {language === "english"
                    ? "Start speaking to begin translation"
                    : language === "hindi"
                    ? "अनुवाद शुरू करने के लिए बोलना शुरू करें"
                    : "भाषांतर सुरू करपाखातीर बोलप सुरू करा"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  {/* Original Message */}
                  <div className={`flex ${message.sender === "visitor" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl ${
                        message.sender === "visitor"
                          ? "bg-blue-500 text-white"
                          : "bg-green-500 text-white"
                      } ${accessibilityMode ? "px-6 py-3" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-semibold ${accessibilityMode ? "text-base" : "text-xs"}`}
                        >
                          {message.sender === "visitor"
                            ? language === "english"
                              ? "Visitor"
                              : language === "hindi"
                              ? "आगंतुक"
                              : "भेट देवपी"
                            : language === "english"
                            ? "Officer"
                            : language === "hindi"
                            ? "अधिकारी"
                            : "अधिकारी"}
                        </span>
                        <button
                          onClick={() =>
                            speakText(
                              message.text,
                              message.sender === "visitor" ? getLanguageCode(language) : "en-US"
                            )
                          }
                          className="ml-2 opacity-75 hover:opacity-100"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className={accessibilityMode ? "text-base" : "text-sm"}>{message.text}</p>
                    </div>
                  </div>

                  {/* Translation */}
                  <div className={`flex ${message.sender === "visitor" ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl bg-gray-100 text-gray-800 ${
                        accessibilityMode ? "px-6 py-3" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-semibold text-gray-600 ${
                            accessibilityMode ? "text-base" : "text-xs"
                          }`}
                        >
                          {language === "english"
                            ? "Translation"
                            : language === "hindi"
                            ? "अनुवाद"
                            : "भाषांतर"}
                        </span>
                        <button
                          onClick={() =>
                            speakText(
                              message.translatedText,
                              message.sender === "visitor" ? "en-US" : getLanguageCode(language)
                            )
                          }
                          className="ml-2 opacity-75 hover:opacity-100"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className={accessibilityMode ? "text-base" : "text-sm"}>{message.translatedText}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Voice Controls */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="text-center">
            <p className={`text-gray-600 mb-4 ${accessibilityMode ? "text-lg" : ""}`}>
              {language === "english"
                ? `Currently listening for: ${currentSpeaker === "visitor" ? "Visitor" : "Officer"}`
                : language === "hindi"
                ? `वर्तमान में सुन रहे हैं: ${currentSpeaker === "visitor" ? "आगंतुक" : "अधिकारी"}`
                : `सध्या ऐकत आसा: ${currentSpeaker === "visitor" ? "भेट देवपी" : "अधिकारी"}`}
            </p>

            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isSpeaking}
              className={`p-6 rounded-full transition-all duration-300 ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : isSpeaking
                  ? "bg-yellow-500 text-white"
                  : currentSpeaker === "visitor"
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-green-500 text-white hover:bg-green-600"
              } disabled:opacity-50 ${accessibilityMode ? "p-8" : ""}`}
            >
              {isListening ? (
                <MicOff className={accessibilityMode ? "w-10 h-10" : "w-8 h-8"} />
              ) : isSpeaking ? (
                <Volume2 className={accessibilityMode ? "w-10 h-10" : "w-8 h-8"} />
              ) : (
                <Mic className={accessibilityMode ? "w-10 h-10" : "w-8 h-8"} />
              )}
            </button>

            <p className={`mt-4 text-gray-500 ${accessibilityMode ? "text-lg" : "text-sm"}`}>
              {isListening
                ? language === "english"
                  ? "Listening..."
                  : language === "hindi"
                  ? "सुन रहे हैं..."
                  : "ऐकत आसा..."
                : isSpeaking
                ? language === "english"
                  ? "Speaking..."
                  : language === "hindi"
                  ? "बोल रहे हैं..."
                  : "बोलत आसा..."
                : language === "english"
                ? "Tap to speak"
                : language === "hindi"
                ? "बोलने के लिए टैप करें"
                : "बोलपाखातीर टॅप करा"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationAssistant;
