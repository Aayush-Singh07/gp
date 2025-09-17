import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';
import { Language } from '../types/language';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  language: Language;
  className?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, language, className = '' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Initialize speech recognition with better language support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      // Enhanced language mapping with better support
      let langCode = 'en-US'; // Default fallback
      
      if (language === 'english') {
        langCode = 'en-IN'; // Indian English for better accent recognition
      } else if (language === 'hindi') {
        langCode = 'hi-IN';
      } else if (language === 'konkani') {
        // Try Konkani first, fallback to Hindi
        langCode = 'kok-IN'; // Konkani (if supported)
        // If not supported, will fallback to Hindi in error handler
      }
      
      recognitionRef.current.lang = langCode;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Speech recognition result:', transcript, 'Language:', langCode);
        onTranscript(transcript);
        setIsRecording(false);
        setIsProcessing(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        // If Konkani fails, try Hindi
        if (language === 'konkani' && event.error === 'language-not-supported') {
          console.log('Konkani not supported, falling back to Hindi');
          recognitionRef.current!.lang = 'hi-IN';
          try {
            recognitionRef.current!.start();
            return;
          } catch (e) {
            console.error('Hindi fallback failed:', e);
          }
        }
        
        setIsRecording(false);
        setIsProcessing(false);
        
        // Show user-friendly error message
        const errorMessage = language === 'english' ? 'Speech recognition failed. Please try again.' :
                            language === 'hindi' ? 'वाक् पहचान असफल। कृपया पुनः प्रयास करें।' :
                            'आवाज वळखप असफल। कृपया परत प्रयत्न करा।';
        alert(errorMessage);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        setIsProcessing(false);
      };

      recognitionRef.current.onstart = () => {
        setIsProcessing(false);
        console.log('Speech recognition started for language:', langCode);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  const startRecording = async () => {
    if (recognitionRef.current && !isRecording) {
      try {
        setIsRecording(true);
        setIsProcessing(true);
        
        // Request microphone permission first
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsRecording(false);
        setIsProcessing(false);
        
        const errorMessage = language === 'english' ? 'Microphone access denied. Please allow microphone access and try again.' :
                            language === 'hindi' ? 'माइक्रोफोन एक्सेस अस्वीकृत। कृपया माइक्रोफोन एक्सेस की अनुमति दें।' :
                            'मायक्रोफोन प्रवेश नाकारला. कृपया मायक्रोफोन प्रवेशाची परवानगी द्या.';
        alert(errorMessage);
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setIsProcessing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isProcessing}
      className={`p-2 rounded-full transition-colors ${
        isRecording 
          ? 'bg-red-500 text-white animate-pulse' 
          : isProcessing
          ? 'bg-yellow-500 text-white'
          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
      } ${className} disabled:opacity-50`}
      title={
        isRecording ? 
          (language === 'english' ? 'Stop Recording' : 
           language === 'hindi' ? 'रिकॉर्डिंग बंद करें' : 'रेकॉर्डिंग बंद करा') :
        isProcessing ?
          (language === 'english' ? 'Processing...' : 
           language === 'hindi' ? 'प्रसंस्करण...' : 'प्रक्रिया...') :
          (language === 'english' ? 'Start Voice Input' : 
           language === 'hindi' ? 'आवाज इनपुट शुरू करें' : 'आवाज इनपुट सुरू करा')
      }
    >
      {isProcessing ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : isRecording ? (
        <MicOff className="w-4 h-4" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
};

export default VoiceInput;