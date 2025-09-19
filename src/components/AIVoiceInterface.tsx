import React, { useState, useEffect, useRef } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { Language, translations } from '../types/language';
import RAGChatbot from './RAGChatbot';

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
      // Set language based on user selection
      const langCode = language === 'english' ? 'en-US' : 
                      language === 'hindi' ? 'hi-IN' : 'hi-IN'; // Fallback to Hindi for Konkani
      recognitionRef.current.lang = langCode;
  }
  )

  // Use the new RAG Chatbot component
  return (
    <RAGChatbot
      language={language}
      onClose={onClose}
      accessibilityMode={accessibilityMode}
    />
  );
};

export default AIVoiceInterface;