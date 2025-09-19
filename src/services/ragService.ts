import incidentsData from '../data/incidents.json';
import { Language } from '../types/language';

interface Incident {
  question: string;
  category: string;
  answer: string;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  language?: string;
}

export class RAGService {
  private incidents: Incident[] = incidentsData;
  private conversationHistory: ConversationMessage[] = [];
  private maxHistoryLength = 10; // Keep last 10 messages for context

  /**
   * Auto-detect language from user input
   */
  detectLanguage(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Russian detection (Cyrillic characters)
    if (/[а-яё]/i.test(text)) {
      return 'ru';
    }
    
    // Hindi/Devanagari detection
    if (/[\u0900-\u097F]/.test(text)) {
      // Check for Konkani-specific patterns
      if (lowerText.includes('हांव') || lowerText.includes('तुम्ही') || lowerText.includes('आमी') || 
          lowerText.includes('कितें') || lowerText.includes('कसो') || lowerText.includes('कशें')) {
        return 'kok';
      }
      return 'hi';
    }
    
    // Konkani in Latin script detection
    if (lowerText.includes('hanv') || lowerText.includes('tumhi') || lowerText.includes('ami') ||
        lowerText.includes('kitem') || lowerText.includes('kaso') || lowerText.includes('kashem')) {
      return 'kok';
    }
    
    // Hindi transliterated words
    const hindiWords = ['kya', 'hai', 'mera', 'mujhe', 'kaise', 'kahan', 'kyun', 'aap', 'hum'];
    const konkaniWords = ['kitem', 'asa', 'mhaka', 'kaso', 'khoim', 'kiteak', 'tumi', 'ami'];
    
    const words = lowerText.split(/\s+/);
    let hindiScore = 0, konkaniScore = 0;
    
    words.forEach(word => {
      if (hindiWords.some(hw => word.includes(hw))) hindiScore++;
      if (konkaniWords.some(kw => word.includes(kw))) konkaniScore++;
    });
    
    if (konkaniScore > hindiScore) return 'kok';
    if (hindiScore > 0) return 'hi';
    
    return 'en'; // Default to English
  }

  /**
   * Calculate similarity between two strings using simple word matching
   */
  private calculateSimilarity(query: string, incident: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const incidentWords = incident.toLowerCase().split(/\s+/);
    
    let matches = 0;
    queryWords.forEach(word => {
      if (incidentWords.some(iWord => iWord.includes(word) || word.includes(iWord))) {
        matches++;
      }
    });
    
    return matches / Math.max(queryWords.length, incidentWords.length);
  }

  /**
   * Find most relevant incidents using semantic search
   */
  private findRelevantIncidents(query: string, limit: number = 3): Incident[] {
    const similarities = this.incidents.map(incident => ({
      incident,
      similarity: Math.max(
        this.calculateSimilarity(query, incident.question),
        this.calculateSimilarity(query, incident.category),
        this.calculateSimilarity(query, incident.answer) * 0.5 // Lower weight for answer matching
      )
    }));

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .filter(item => item.similarity > 0.1) // Minimum threshold
      .map(item => item.incident);
  }

  /**
   * Translate text to target language (simplified implementation)
   */
  private async translateText(text: string, targetLang: string): Promise<string> {
    // This is a simplified translation - in production, use Google Translate API or similar
    const translations: Record<string, Record<string, string>> = {
      'greeting': {
        'hi': 'नमस्ते! मैं गोवा पुलिस एआई सहायक हूं। मैं आपकी कैसे मदद कर सकता हूं?',
        'kok': 'नमस्कार! हांव गोवा पोलिस एआई सहाय्यक. हांव तुमची कशी मदत करूं शकतां?',
        'ru': 'Привет! Я помощник полиции Гоа с ИИ. Как я могу вам помочь?',
        'en': 'Hello! I am Goa Police AI Assistant. How can I help you?'
      },
      'no_match': {
        'hi': 'मुझे खुशी होगी कि मैं आपकी मदद करूं। क्या आप अपना सवाल दूसरे तरीके से पूछ सकते हैं? आप रिपोर्ट दर्ज करने, आपातकालीन सहायता, या अपने अधिकारों के बारे में पूछ सकते हैं।',
        'kok': 'हांव तुमची मदत करपाक खुश जातलों। तुम्ही तुमचो प्रश्न दुसऱ्या तरेन विचारूं शकता? तुम्ही रिपोर्ट दाखल करप, तातकाळीन मदत, वा तुमच्या हक्कांविशीं विचारूं शकता.',
        'ru': 'Я буду рад помочь вам. Можете ли вы переформулировать свой вопрос? Вы можете спросить о подаче заявления, экстренной помощи или ваших правах.',
        'en': 'I would be happy to help you. Could you please rephrase your question? You can ask about filing reports, emergency help, or your rights.'
      }
    };

    // Simple keyword-based translation for common responses
    if (text.includes('Hello') || text.includes('I am Goa Police')) {
      return translations['greeting'][targetLang] || text;
    }
    
    if (text.includes('Could you please rephrase')) {
      return translations['no_match'][targetLang] || text;
    }

    // For actual answers, we'll use the original English text
    // In production, integrate with Google Translate API here
    return text;
  }

  /**
   * Add message to conversation history
   */
  private addToHistory(role: 'user' | 'assistant', content: string, language?: string) {
    this.conversationHistory.push({
      role,
      content,
      timestamp: new Date(),
      language
    });

    // Keep only recent messages
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }
  }

  /**
   * Get conversation context for better responses
   */
  private getConversationContext(): string {
    if (this.conversationHistory.length === 0) return '';
    
    const recentMessages = this.conversationHistory.slice(-4); // Last 4 messages
    return recentMessages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
  }

  /**
   * Generate contextual response using RAG
   */
  async generateResponse(userQuery: string): Promise<{ response: string; language: string }> {
    // Detect user's language
    const detectedLang = this.detectLanguage(userQuery);
    
    // Add user message to history
    this.addToHistory('user', userQuery, detectedLang);
    
    // Handle greetings
    if (this.isGreeting(userQuery)) {
      const greeting = await this.translateText('Hello! I am Goa Police AI Assistant. How can I help you?', detectedLang);
      this.addToHistory('assistant', greeting, detectedLang);
      return { response: greeting, language: detectedLang };
    }

    // Find relevant incidents using RAG
    const relevantIncidents = this.findRelevantIncidents(userQuery);
    
    if (relevantIncidents.length === 0) {
      // No relevant information found
      const fallbackResponse = await this.translateText(
        'I would be happy to help you. Could you please rephrase your question? You can ask about filing reports, emergency help, or your rights.',
        detectedLang
      );
      this.addToHistory('assistant', fallbackResponse, detectedLang);
      return { response: fallbackResponse, language: detectedLang };
    }

    // Generate contextual response
    const response = await this.generateContextualResponse(userQuery, relevantIncidents, detectedLang);
    this.addToHistory('assistant', response, detectedLang);
    
    return { response, language: detectedLang };
  }

  /**
   * Check if user input is a greeting
   */
  private isGreeting(text: string): boolean {
    const greetings = [
      'hello', 'hi', 'hey', 'namaste', 'namaskar', 'good morning', 'good afternoon', 'good evening',
      'नमस्ते', 'नमस्कार', 'हैलो', 'हाय', 'सुप्रभात', 'शुभ दोपहर', 'शुभ संध्या',
      'привет', 'здравствуйте', 'доброе утро', 'добрый день', 'добрый вечер'
    ];
    
    const lowerText = text.toLowerCase();
    return greetings.some(greeting => lowerText.includes(greeting));
  }

  /**
   * Generate contextual response based on relevant incidents and conversation history
   */
  private async generateContextualResponse(
    query: string, 
    incidents: Incident[], 
    language: string
  ): Promise<string> {
    const context = this.getConversationContext();
    
    // If we have a direct match, provide the answer
    if (incidents.length === 1 && incidents[0]) {
      const incident = incidents[0];
      let response = `Based on your query about ${incident.category.toLowerCase()}, here's what you should do:\n\n${incident.answer}`;
      
      // Add contextual follow-up based on conversation history
      if (context.includes('emergency') || context.includes('urgent')) {
        response += '\n\nSince this seems urgent, you can also call 100 for immediate police assistance.';
      }
      
      return await this.translateText(response, language);
    }

    // Multiple relevant incidents - provide options
    if (incidents.length > 1) {
      let response = 'I found several relevant procedures that might help you:\n\n';
      
      incidents.forEach((incident, index) => {
        response += `${index + 1}. **${incident.category}**: ${incident.answer}\n\n`;
      });
      
      response += 'Which of these situations best matches your case?';
      return await this.translateText(response, language);
    }

    // Fallback response
    return await this.translateText(
      'I understand your concern. Could you provide more specific details about your situation? This will help me give you the most accurate guidance.',
      language
    );
  }

  /**
   * Get conversation history for display
   */
  getConversationHistory(): ConversationMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Get language code for speech synthesis
   */
  getLanguageCode(language: string): string {
    const langMap: Record<string, string> = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'kok': 'hi-IN', // Fallback to Hindi
      'ru': 'ru-RU'
    };
    return langMap[language] || 'en-IN';
  }
}

export const ragService = new RAGService();