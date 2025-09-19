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
   * Auto-detect language from user input using multiple detection methods
   */
  detectLanguage(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Russian detection (Cyrillic characters)
    if (/[а-яё]/i.test(text)) {
      return 'ru';
    }
    
    // Hindi/Devanagari detection
    if (/[\u0900-\u097F]/.test(text)) {
      // Check for Konkani-specific patterns (simplified)
      if (lowerText.includes('हांव') || lowerText.includes('तुम्ही') || lowerText.includes('आमी') || 
          lowerText.includes('कितें') || lowerText.includes('कसो') || lowerText.includes('कशें') ||
          lowerText.includes('आसा') || lowerText.includes('करा') || lowerText.includes('जाता')) {
        return 'kok';
      }
      return 'hi';
    }
    
    // Konkani in Latin script detection
    if (lowerText.includes('hanv') || lowerText.includes('tumhi') || lowerText.includes('ami') ||
        lowerText.includes('kitem') || lowerText.includes('kaso') || lowerText.includes('kashem')) {
      return 'kok';
    }
    
    // Enhanced word-based detection
    const hindiWords = ['है', 'का', 'की', 'को', 'में', 'से', 'पर', 'और', 'या', 'मैं', 'आप', 'हम', 'वह', 'यह'];
    const konkaniWords = ['आसा', 'चो', 'ची', 'क', 'त', 'न', 'वर', 'आनी', 'वा', 'हांव', 'तुम्ही', 'आमी', 'तो', 'हे'];
    const englishWords = ['the', 'is', 'are', 'and', 'or', 'in', 'on', 'at', 'to', 'i', 'you', 'we', 'he', 'she'];
    const russianWords = ['это', 'что', 'как', 'где', 'когда', 'почему', 'я', 'ты', 'мы', 'он', 'она'];
    
    const words = lowerText.split(/\s+/);
    
    let hindiScore = 0, konkaniScore = 0, englishScore = 0, russianScore = 0;
    
    words.forEach(word => {
      if (hindiWords.includes(word)) hindiScore++;
      if (konkaniWords.includes(word)) konkaniScore++;
      if (englishWords.includes(word)) englishScore++;
      if (russianWords.includes(word)) russianScore++;
    });
    
    // Return language with highest score
    const scores = [
      { lang: 'kok', score: konkaniScore },
      { lang: 'hi', score: hindiScore },
      { lang: 'en', score: englishScore },
      { lang: 'ru', score: russianScore }
    ];
    
    const maxScore = Math.max(...scores.map(s => s.score));
    if (maxScore > 0) {
      const detectedLang = scores.find(s => s.score === maxScore)?.lang || 'en';
      console.log('Language detection scores:', scores, 'Detected:', detectedLang);
      return detectedLang;
    }
    
    return 'en'; // Default fallback
  }

  /**
   * Calculate similarity between two strings using enhanced word matching
   */
  private calculateSimilarity(query: string, incident: string): number {
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const incidentWords = incident.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    
    let exactMatches = 0;
    let partialMatches = 0;
    
    queryWords.forEach(qWord => {
      // Check for exact matches
      if (incidentWords.includes(qWord)) {
        exactMatches++;
      } else {
        // Check for partial matches (substring)
        if (incidentWords.some(iWord => iWord.includes(qWord) || qWord.includes(iWord))) {
          partialMatches++;
        }
      }
    });
    
    // Weight exact matches higher than partial matches
    const totalScore = (exactMatches * 2) + partialMatches;
    return totalScore / (queryWords.length * 2);
  }

  /**
   * Find most relevant incidents using semantic search
   */
  private findRelevantIncidents(query: string, limit: number = 3): Incident[] {
    const similarities = this.incidents.map(incident => ({
      incident,
      similarity: Math.max(
        this.calculateSimilarity(query, incident.question) * 1.0,
        this.calculateSimilarity(query, incident.category) * 0.8,
        this.calculateSimilarity(query, incident.answer) * 0.6
      )
    }));

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .filter(item => item.similarity > 0.15) // Minimum threshold
      .map(item => item.incident);
  }

  /**
   * Translate text to target language using built-in translations
   */
  private translateText(text: string, targetLang: string): string {
    // Enhanced translation mappings
    const translations: Record<string, Record<string, string>> = {
      // Greetings
      'hello_ai': {
        'hi': 'नमस्ते! मैं गोवा पुलिस एआई सहायक हूं। मैं आपकी कैसे मदद कर सकता हूं? आप मुझसे पुलिस प्रक्रियाओं, अपने अधिकारों, या किसी भी कानूनी मुद्दे के बारे में पूछ सकते हैं।',
        'kok': 'नमस्कार! हांव गोवा पोलिस एआई सहाय्यक. हांव तुमची कशी मदत करूं शकतां? तुम्ही म्हाका पोलिस प्रक्रिया, तुमचे हक्क, वा खंयच्याय कायदेशीर मुद्द्याविशीं विचारूं शकता.',
        'ru': 'Привет! Я помощник полиции Гоа с ИИ. Как я могу вам помочь сегодня? Вы можете спросить меня о полицейских процедурах, ваших правах или любых правовых вопросах.',
        'en': 'Hello! I am Goa Police AI Assistant. How can I help you today? You can ask me about police procedures, your rights, or any legal matters.'
      },
      
      // No match responses
      'no_match': {
        'hi': 'मुझे खुशी होगी कि मैं आपकी मदत करूं। क्या आप अपना सवाल दूसरे तरीके से पूछ सकते हैं? आप रिपोर्ट दर्ज करने, आपातकालीन सहायता, या अपने अधिकारों के बारे में पूछ सकते हैं।',
        'kok': 'हांव तुमची मदत करपाक खुश जातलों। तुम्ही तुमचो प्रश्न दुसऱ्या तरेन विचारूं शकता? तुम्ही रिपोर्ट दाखल करप, तातकाळीन मदत, वा तुमच्या हक्कांविशीं विचारूं शकता.',
        'ru': 'Я буду рад помочь вам. Можете ли вы переформулировать свой вопрос? Вы можете спросить о подаче заявления, экстренной помощи или ваших правах.',
        'en': 'I would be happy to help you. Could you please rephrase your question? You can ask about filing reports, emergency help, or your rights.'
      },
      
      // Follow-up responses
      'need_more_info': {
        'hi': 'मुझे आपकी बेहतर मदद करने के लिए और जानकारी चाहिए। क्या आप अधिक विवरण दे सकते हैं?',
        'kok': 'तुमची बरी मदत करपाखातीर म्हाका चड माहिती जाय। तुम्ही चड तपशील दिवंक शकता?',
        'ru': 'Мне нужна дополнительная информация, чтобы лучше вам помочь. Можете ли вы предоставить больше деталей?',
        'en': 'I need more information to help you better. Can you provide more details?'
      },
      
      // Emergency responses
      'emergency_help': {
        'hi': 'यह एक आपातकालीन स्थिति लगती है। कृपया तुरंत 100 पर कॉल करें या मुख्य मेनू से आपातकालीन सहायता का उपयोग करें।',
        'kok': 'ही एक तातकाळीन परिस्थिती दिसता. कृपया ताबडतोब 100 वर कॉल करा वा मुख्य मेन्यू वयल्यान तातकाळीन मदत वापरा.',
        'ru': 'Это похоже на экстренную ситуацию. Пожалуйста, немедленно звоните 100 или используйте экстренную помощь из главного меню.',
        'en': 'This seems like an emergency situation. Please call 100 immediately or use emergency help from the main menu.'
      }
    };

    // Check for specific translation keys
    for (const [key, langMap] of Object.entries(translations)) {
      if (text.includes(key.replace('_', ' ')) || this.matchesTranslationPattern(text, key)) {
        return langMap[targetLang] || langMap['en'] || text;
      }
    }

    // For incident answers, translate key terms
    return this.translateIncidentAnswer(text, targetLang);
  }

  /**
   * Check if text matches a translation pattern
   */
  private matchesTranslationPattern(text: string, pattern: string): boolean {
    const patterns: Record<string, string[]> = {
      'hello_ai': ['hello', 'hi', 'hey', 'namaste', 'namaskar', 'привет', 'здравствуйте'],
      'no_match': ['rephrase', 'different way', 'not understand', 'unclear'],
      'need_more_info': ['more details', 'more information', 'elaborate', 'explain'],
      'emergency_help': ['emergency', 'urgent', 'immediate', 'help now', 'crisis']
    };

    const keywords = patterns[pattern] || [];
    const lowerText = text.toLowerCase();
    
    return keywords.some(keyword => lowerText.includes(keyword));
  }

  /**
   * Translate incident answers with key legal terms
   */
  private translateIncidentAnswer(text: string, targetLang: string): string {
    if (targetLang === 'en') return text;

    // Key legal term translations
    const legalTerms: Record<string, Record<string, string>> = {
      'FIR': {
        'hi': 'एफआईआर',
        'kok': 'एफआयआर',
        'ru': 'Заявление в полицию'
      },
      'police station': {
        'hi': 'पुलिस स्टेशन',
        'kok': 'पोलिस स्टेशन',
        'ru': 'полицейский участок'
      },
      'report': {
        'hi': 'रिपोर्ट',
        'kok': 'रिपोर्ट',
        'ru': 'заявление'
      },
      'immediately': {
        'hi': 'तुरंत',
        'kok': 'ताबडतोब',
        'ru': 'немедленно'
      },
      'evidence': {
        'hi': 'साक्ष्य',
        'kok': 'पुरावे',
        'ru': 'доказательства'
      },
      'witness': {
        'hi': 'गवाह',
        'kok': 'साक्षीदार',
        'ru': 'свидетель'
      }
    };

    let translatedText = text;
    
    // Replace key terms
    for (const [englishTerm, translations] of Object.entries(legalTerms)) {
      const translation = translations[targetLang];
      if (translation) {
        const regex = new RegExp(`\\b${englishTerm}\\b`, 'gi');
        translatedText = translatedText.replace(regex, translation);
      }
    }

    // Add language-specific prefixes for better context
    const prefixes: Record<string, string> = {
      'hi': 'पुलिस सलाह: ',
      'kok': 'पोलिस सल्लो: ',
      'ru': 'Совет полиции: '
    };

    if (prefixes[targetLang] && !translatedText.startsWith(prefixes[targetLang])) {
      translatedText = prefixes[targetLang] + translatedText;
    }

    return translatedText;
  }

  /**
   * Add message to conversation history for context
   */
  private addToHistory(role: 'user' | 'assistant', content: string, language?: string) {
    this.conversationHistory.push({
      role,
      content,
      timestamp: new Date(),
      language
    });

    // Keep only recent messages to maintain context without overwhelming the system
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }
  }

  /**
   * Get conversation context for maintaining cross-conversational flow
   */
  private getConversationContext(): string {
    if (this.conversationHistory.length === 0) return '';
    
    const recentMessages = this.conversationHistory.slice(-6); // Last 6 messages for context
    return recentMessages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
  }

  /**
   * Check if user input is a greeting
   */
  private isGreeting(text: string): boolean {
    const greetings = [
      // English
      'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
      // Hindi
      'नमस्ते', 'नमस्कार', 'हैलो', 'हाय', 'सुप्रभात', 'शुभ दोपहर', 'शुभ संध्या',
      // Konkani
      'नमस्कार', 'देव बरे करूं', 'सकाळ', 'दुपार', 'सांज',
      // Russian
      'привет', 'здравствуйте', 'доброе утро', 'добрый день', 'добрый вечер'
    ];
    
    const lowerText = text.toLowerCase();
    return greetings.some(greeting => lowerText.includes(greeting));
  }

  /**
   * Check if query indicates emergency
   */
  private isEmergency(text: string): boolean {
    const emergencyKeywords = [
      // English
      'emergency', 'urgent', 'help', 'crisis', 'danger', 'threat', 'attack', 'robbery', 'assault',
      // Hindi
      'आपातकाल', 'तुरंत', 'मदद', 'संकट', 'खतरा', 'धमकी', 'हमला', 'डकैती', 'हमला',
      // Konkani
      'तातकाळ', 'ताबडतोब', 'मदत', 'संकट', 'धोको', 'धमकी', 'हल्लो', 'दरोडो',
      // Russian
      'экстренная', 'срочно', 'помощь', 'кризис', 'опасность', 'угроза', 'нападение', 'грабеж'
    ];
    
    const lowerText = text.toLowerCase();
    return emergencyKeywords.some(keyword => lowerText.includes(keyword));
  }

  /**
   * Generate contextual response using RAG approach
   */
  async generateResponse(userQuery: string): Promise<{ response: string; language: string }> {
    // Detect user's language
    const detectedLang = this.detectLanguage(userQuery);
    console.log('Detected language:', detectedLang, 'for query:', userQuery);
    
    // Add user message to history
    this.addToHistory('user', userQuery, detectedLang);
    
    // Handle greetings
    if (this.isGreeting(userQuery)) {
      const greeting = this.translateText('hello_ai', detectedLang);
      this.addToHistory('assistant', greeting, detectedLang);
      return { response: greeting, language: detectedLang };
    }

    // Handle emergency situations
    if (this.isEmergency(userQuery)) {
      const emergencyResponse = this.translateText('emergency_help', detectedLang);
      this.addToHistory('assistant', emergencyResponse, detectedLang);
      return { response: emergencyResponse, language: detectedLang };
    }

    // Find relevant incidents using RAG
    const relevantIncidents = this.findRelevantIncidents(userQuery);
    
    if (relevantIncidents.length === 0) {
      // No relevant information found - provide helpful fallback
      const fallbackResponse = this.generateContextualFallback(userQuery, detectedLang);
      this.addToHistory('assistant', fallbackResponse, detectedLang);
      return { response: fallbackResponse, language: detectedLang };
    }

    // Generate contextual response based on found incidents
    const response = this.generateContextualResponse(userQuery, relevantIncidents, detectedLang);
    this.addToHistory('assistant', response, detectedLang);
    
    return { response, language: detectedLang };
  }

  /**
   * Generate contextual fallback when no incidents match
   */
  private generateContextualFallback(query: string, language: string): string {
    const context = this.getConversationContext();
    
    // Analyze query for specific topics
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('pcc') || lowerQuery.includes('clearance') || lowerQuery.includes('certificate')) {
      const pccResponse = {
        'hi': 'पुलिस क्लीयरेंस सर्टिफिकेट (पीसीसी) के लिए, कृपया मुख्य मेनू से "रिपोर्ट दर्ज करें" चुनें और फिर पीसीसी विकल्प चुनें। आपको पासपोर्ट फोटो, पहचान प्रमाण और उद्देश्य घोषणा की आवश्यकता होगी।',
        'kok': 'पोलिस क्लिअरन्स सर्टिफिकेट (पीसीसी) खातीर, कृपया मुख्य मेन्यू वयल्यान "रिपोर्ट दाखल करा" निवडा आनी मगीर पीसीसी पर्याय निवडा। तुमकां पासपोर्ट फोटो, वळख पुरावो आनी हेतू घोषणा लागतली.',
        'ru': 'Для справки о несудимости (PCC), пожалуйста, выберите "Подать заявление" в главном меню, а затем выберите опцию PCC. Вам понадобятся фотографии паспортного размера, удостоверение личности и декларация о цели.',
        'en': 'For Police Clearance Certificate (PCC), please select "File Report" from the main menu and then choose the PCC option. You will need passport photos, identity proof, and purpose declaration.'
      };
      return pccResponse[language] || pccResponse['en'];
    }
    
    if (lowerQuery.includes('complaint') || lowerQuery.includes('file') || lowerQuery.includes('report')) {
      const complaintResponse = {
        'hi': 'शिकायत दर्ज करने के लिए, मुख्य मेनू से "रिपोर्ट दर्ज करें" चुनें। आप चोरी, उत्पीड़न, साइबर अपराध और अन्य मुद्दों की रिपोर्ट कर सकते हैं।',
        'kok': 'शिकायत दाखल करपाखातीर, मुख्य मेन्यू वयल्यान "रिपोर्ट दाखल करा" निवडा। तुम्ही चोरी, छळवणूक, सायबर गुन्हा आनी हेर मुद्द्यांची रिपोर्ट करूं शकता.',
        'ru': 'Чтобы подать жалобу, выберите "Подать заявление" в главном меню. Вы можете сообщить о краже, домогательствах, киберпреступлениях и других проблемах.',
        'en': 'To file a complaint, select "File Report" from the main menu. You can report theft, harassment, cybercrime, and other issues.'
      };
      return complaintResponse[language] || complaintResponse['en'];
    }
    
    // Default fallback with conversation context
    if (context.includes('theft') || context.includes('stolen')) {
      const theftFollowUp = {
        'hi': 'चोरी के मामले में, क्या आपको और जानकारी चाहिए? मैं आपको FIR दर्ज करने की प्रक्रिया या आवश्यक दस्तावेजों के बारे में बता सकता हूं।',
        'kok': 'चोरीच्या प्रकरणांत, तुमकां आनीक माहिती जाय? हांव तुमकां एफआयआर दाखल करपाची प्रक्रिया वा गरजेचे कागदपत्रांविशीं सांगूं शकतां.',
        'ru': 'В случае кражи, нужна ли вам дополнительная информация? Я могу рассказать вам о процедуре подачи заявления или необходимых документах.',
        'en': 'Regarding theft cases, do you need more information? I can tell you about the FIR filing process or required documents.'
      };
      return theftFollowUp[language] || theftFollowUp['en'];
    }

    return this.translateText('no_match', language);
  }

  /**
   * Generate contextual response based on relevant incidents and conversation history
   */
  private generateContextualResponse(
    query: string, 
    incidents: Incident[], 
    language: string
  ): string {
    const context = this.getConversationContext();
    
    // Single best match - provide detailed answer
    if (incidents.length === 1) {
      const incident = incidents[0];
      let response = `${this.translateText('Based on your query about', language)} ${incident.category.toLowerCase()}, ${this.translateText('here is what you should do', language)}:\n\n${this.translateText(incident.answer, language)}`;
      
      // Add contextual follow-up based on conversation history
      if (context.includes('emergency') || context.includes('urgent') || query.toLowerCase().includes('urgent')) {
        const urgentNote = {
          'hi': '\n\nयह तत्काल कार्रवाई की आवश्यकता है। आप तुरंत 100 पर कॉल भी कर सकते हैं।',
          'kok': '\n\nहाका ताबडतोब कार्रवायेची गरज आसा। तुम्ही ताबडतोब 100 वर कॉल पण करूं शकता.',
          'ru': '\n\nЭто требует немедленных действий. Вы также можете немедленно позвонить по номеру 100.',
          'en': '\n\nThis requires immediate action. You can also call 100 immediately.'
        };
        response += urgentNote[language] || urgentNote['en'];
      }
      
      // Add follow-up question to maintain conversation
      const followUp = {
        'hi': '\n\nक्या आपको इस प्रक्रिया के बारे में कोई और प्रश्न है?',
        'kok': '\n\nतुमकां ह्या प्रक्रियेविशीं आनीक खंयचे प्रश्न आसात?',
        'ru': '\n\nЕсть ли у вас еще вопросы об этой процедуре?',
        'en': '\n\nDo you have any other questions about this process?'
      };
      response += followUp[language] || followUp['en'];
      
      return response;
    }

    // Multiple relevant incidents - provide options
    if (incidents.length > 1) {
      const optionsHeader = {
        'hi': 'मुझे कई संबंधित प्रक्रियाएं मिलीं जो आपकी मदद कर सकती हैं:\n\n',
        'kok': 'म्हाका कितल्योश संबंधित प्रक्रिया मेळ्ल्यो जो तुमची मदत करूं शकतात:\n\n',
        'ru': 'Я нашел несколько соответствующих процедур, которые могут вам помочь:\n\n',
        'en': 'I found several relevant procedures that might help you:\n\n'
      };
      
      let response = optionsHeader[language] || optionsHeader['en'];
      
      incidents.forEach((incident, index) => {
        const translatedAnswer = this.translateText(incident.answer, language);
        response += `${index + 1}. **${incident.category}**: ${translatedAnswer}\n\n`;
      });
      
      const whichQuestion = {
        'hi': 'इनमें से कौन सी स्थिति आपके मामले से सबसे अच्छी तरह मेल खाती है?',
        'kok': 'ह्यांतल्यान कोणती परिस्थिती तुमच्या प्रकरणाशी बरी मेळटा?',
        'ru': 'Какая из этих ситуаций лучше всего соответствует вашему случаю?',
        'en': 'Which of these situations best matches your case?'
      };
      
      response += whichQuestion[language] || whichQuestion['en'];
      return response;
    }

    // Fallback with context awareness
    return this.generateContextualFallback(query, language);
  }

  /**
   * Enhanced similarity search with context awareness
   */
  private findRelevantIncidentsWithContext(query: string): Incident[] {
    const context = this.getConversationContext();
    const combinedQuery = context ? `${context}\nCurrent query: ${query}` : query;
    
    return this.findRelevantIncidents(combinedQuery, 3);
  }

  /**
   * Main method to generate response with full RAG pipeline
   */
  async generateResponse(userQuery: string): Promise<{ response: string; language: string }> {
    try {
      // Detect user's language
      const detectedLang = this.detectLanguage(userQuery);
      console.log('RAG Processing - Detected language:', detectedLang, 'Query:', userQuery);
      
      // Add user message to history
      this.addToHistory('user', userQuery, detectedLang);
      
      // Handle greetings
      if (this.isGreeting(userQuery)) {
        const greeting = this.translateText('hello_ai', detectedLang);
        this.addToHistory('assistant', greeting, detectedLang);
        return { response: greeting, language: detectedLang };
      }

      // Handle emergency situations with priority
      if (this.isEmergency(userQuery)) {
        const emergencyResponse = this.translateText('emergency_help', detectedLang);
        this.addToHistory('assistant', emergencyResponse, detectedLang);
        return { response: emergencyResponse, language: detectedLang };
      }

      // Use context-aware incident search
      const relevantIncidents = this.findRelevantIncidentsWithContext(userQuery);
      
      if (relevantIncidents.length === 0) {
        // No relevant information found - provide contextual fallback
        const fallbackResponse = this.generateContextualFallback(userQuery, detectedLang);
        this.addToHistory('assistant', fallbackResponse, detectedLang);
        return { response: fallbackResponse, language: detectedLang };
      }

      // Generate response based on found incidents and conversation context
      const response = this.generateContextualResponse(userQuery, relevantIncidents, detectedLang);
      this.addToHistory('assistant', response, detectedLang);
      
      return { response, language: detectedLang };
      
    } catch (error) {
      console.error('Error in RAG service:', error);
      
      // Error fallback
      const errorResponse = {
        'hi': 'मुझे खेद है, मुझे आपके प्रश्न को संसाधित करने में समस्या हो रही है। कृपया पुनः प्रयास करें।',
        'kok': 'म्हाका माफ करा, म्हाका तुमचो प्रश्न प्रक्रिया करपांत अडचण येत आसा। कृपया परत प्रयत्न करा.',
        'ru': 'Извините, у меня проблемы с обработкой вашего вопроса. Пожалуйста, попробуйте еще раз.',
        'en': 'I apologize, I am having trouble processing your question. Please try again.'
      };
      
      const detectedLang = this.detectLanguage(userQuery);
      return { 
        response: errorResponse[detectedLang] || errorResponse['en'], 
        language: detectedLang 
      };
    }
  }

  /**
   * Get conversation history for display or analysis
   */
  getConversationHistory(): ConversationMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
    console.log('Conversation history cleared');
  }

  /**
   * Get language code for speech synthesis
   */
  getLanguageCodeForSpeech(language: string): string {
    const langMap: Record<string, string> = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'kok': 'hi-IN', // Fallback to Hindi for Konkani
      'ru': 'ru-RU'
    };
    return langMap[language] || 'en-IN';
  }

  /**
   * Enhanced language detection with confidence scoring
   */
  detectLanguageWithConfidence(text: string): { language: string; confidence: number } {
    const detectedLang = this.detectLanguage(text);
    
    // Simple confidence calculation based on script and word matches
    let confidence = 0.5; // Base confidence
    
    if (/[\u0900-\u097F]/.test(text)) confidence += 0.3; // Devanagari script
    if (/[а-яё]/i.test(text)) confidence += 0.4; // Cyrillic script
    if (/^[a-zA-Z\s.,!?'"]+$/.test(text)) confidence += 0.2; // Latin script
    
    return { language: detectedLang, confidence: Math.min(confidence, 1.0) };
  }
}

// Create singleton instance
export const ragService = new RAGService();