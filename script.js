/**
 * Goa Police Translation Interface
 * Offline-first translation system with Web Speech API
 */

class PoliceTranslationInterface {
    constructor() {
        // Core elements
        this.micButton = document.getElementById('micButton');
        this.visitorTranscript = document.getElementById('visitorTranscript');
        this.officerTranscript = document.getElementById('officerTranscript');
        this.visitorLang = document.getElementById('visitorLang');
        this.officerLang = document.getElementById('officerLang');
        this.micStatus = document.getElementById('micStatus');
        this.systemStatus = document.getElementById('systemStatus');
        this.currentMode = document.getElementById('currentMode');
        
        // Audio feedback elements
        this.startBeep = document.getElementById('startBeep');
        this.stopBeep = document.getElementById('stopBeep');
        
        // State management
        this.isRecording = false;
        this.isProcessing = false;
        this.currentSpeaker = 'visitor'; // 'visitor' or 'officer'
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.voices = [];
        
        // Language detection and settings
        this.supportedLanguages = {
            'en': { code: 'en-IN', name: 'English', flag: 'EN' },
            'hi': { code: 'hi-IN', name: 'Hindi', flag: 'HI' },
            'kok': { code: 'hi-IN', name: 'Konkani', flag: 'KOK' }, // Fallback to Hindi
            'mr': { code: 'mr-IN', name: 'Marathi', flag: 'MR' },
            'ru': { code: 'ru-RU', name: 'Russian', flag: 'RU' }
        };
        
        this.detectedLanguages = {
            visitor: 'auto',
            officer: 'en'
        };
        
        // Initialize the interface
        this.init();
    }
    
    /**
     * Initialize the translation interface
     */
    init() {
        console.log('🚀 Initializing Goa Police Translation Interface');
        
        // Check browser compatibility
        if (!this.checkBrowserSupport()) {
            this.showError('Browser not supported. Please use Chrome or Edge.');
            return;
        }
        
        // Initialize Web Speech API
        this.initSpeechRecognition();
        this.loadVoices();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load offline dictionary
        this.loadOfflineDictionary();
        
        // Update status
        this.updateStatus('Ready', 'Offline');
        
        console.log('✅ Interface initialized successfully');
    }
    
    /**
     * Check if browser supports required APIs
     */
    checkBrowserSupport() {
        const hasWebSpeech = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        const hasSynthesis = 'speechSynthesis' in window;
        
        console.log(`🔍 Browser support - Speech Recognition: ${hasWebSpeech}, Speech Synthesis: ${hasSynthesis}`);
        
        return hasWebSpeech && hasSynthesis;
    }
    
    /**
     * Initialize Speech Recognition with auto-language detection
     */
    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.error('❌ Speech Recognition not supported');
            return;
        }
        
        this.recognition = new SpeechRecognition();
        
        // Configure recognition settings
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 3; // Get multiple alternatives for better language detection
        
        // Event handlers
        this.recognition.onstart = () => this.onRecognitionStart();
        this.recognition.onresult = (event) => this.onRecognitionResult(event);
        this.recognition.onerror = (event) => this.onRecognitionError(event);
        this.recognition.onend = () => this.onRecognitionEnd();
        
        console.log('🎤 Speech Recognition initialized');
    }
    
    /**
     * Load available voices for speech synthesis
     */
    loadVoices() {
        const loadVoicesImpl = () => {
            this.voices = this.synthesis.getVoices();
            console.log(`🔊 Loaded ${this.voices.length} voices:`, 
                this.voices.map(v => `${v.name} (${v.lang})`));
        };
        
        // Load voices immediately if available
        loadVoicesImpl();
        
        // Also load when voices change (some browsers load them asynchronously)
        this.synthesis.onvoiceschanged = loadVoicesImpl;
    }
    
    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Mic button click
        this.micButton.addEventListener('click', () => this.toggleRecording());
        
        // Keyboard shortcut (Space key)
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space' && !event.repeat) {
                event.preventDefault();
                this.toggleRecording();
            }
        });
        
        // Panel clicks to switch speaker
        document.querySelector('.visitor-panel').addEventListener('click', () => {
            this.currentSpeaker = 'visitor';
            this.updateSpeakerIndicator();
        });
        
        document.querySelector('.officer-panel').addEventListener('click', () => {
            this.currentSpeaker = 'officer';
            this.updateSpeakerIndicator();
        });
        
        console.log('👂 Event listeners set up');
    }
    
    /**
     * Load offline translation dictionary for common police phrases
     */
    loadOfflineDictionary() {
        // Common police phrases dictionary
        // Structure: { 'source_lang': { 'phrase': { 'target_lang': 'translation' } } }
        this.offlineDictionary = {
            'en': {
                'hello': { 'hi': 'नमस्ते', 'kok': 'नमस्कार', 'ru': 'Привет' },
                'how can i help you': { 'hi': 'मैं आपकी कैसे मदद कर सकता हूं', 'kok': 'हांव तुमची कशी मदत करूं शकतां', 'ru': 'Как я могу вам помочь' },
                'please show your id': { 'hi': 'कृपया अपनी आईडी दिखाएं', 'kok': 'कृपया तुमची आयडी दाखवा', 'ru': 'Пожалуйста, покажите ваш ID' },
                'what is the problem': { 'hi': 'क्या समस्या है', 'kok': 'कितें समस्या आसा', 'ru': 'В чем проблема' },
                'file a complaint': { 'hi': 'शिकायत दर्ज करें', 'kok': 'शिकायत दाखल करा', 'ru': 'Подать жалобу' },
                'emergency': { 'hi': 'आपातकाल', 'kok': 'तातकाळ', 'ru': 'Экстренная ситуация' },
                'police station': { 'hi': 'पुलिस स्टेशन', 'kok': 'पोलिस स्टेशन', 'ru': 'Полицейский участок' },
                'thank you': { 'hi': 'धन्यवाद', 'kok': 'देव बरे करूं', 'ru': 'Спасибо' }
            },
            'hi': {
                'नमस्ते': { 'en': 'hello', 'kok': 'नमस्कार', 'ru': 'Привет' },
                'मदद चाहिए': { 'en': 'need help', 'kok': 'मदत जाय', 'ru': 'Нужна помощь' },
                'शिकायत करनी है': { 'en': 'want to file complaint', 'kok': 'शिकायत करूंक सोदता', 'ru': 'Хочу подать жалобу' },
                'आपातकाल': { 'en': 'emergency', 'kok': 'तातकाळ', 'ru': 'Экстренная ситуация' },
                'धन्यवाद': { 'en': 'thank you', 'kok': 'देव बरे करूं', 'ru': 'Спасибо' }
            },
            'kok': {
                'नमस्कार': { 'en': 'hello', 'hi': 'नमस्ते', 'ru': 'Привет' },
                'मदत जाय': { 'en': 'need help', 'hi': 'मदद चाहिए', 'ru': 'Нужна помощь' },
                'शिकायत करूंक सोदता': { 'en': 'want to file complaint', 'hi': 'शिकायत करनी है', 'ru': 'Хочу подать жалобу' },
                'तातकाळ': { 'en': 'emergency', 'hi': 'आपातकाल', 'ru': 'Экстренная ситуация' },
                'देव बरे करूं': { 'en': 'thank you', 'hi': 'धन्यवाद', 'ru': 'Спасибо' }
            },
            'ru': {
                'привет': { 'en': 'hello', 'hi': 'नमस्ते', 'kok': 'नमस्कार' },
                'нужна помощь': { 'en': 'need help', 'hi': 'मदद चाहिए', 'kok': 'मदत जाय' },
                'хочу подать жалобу': { 'en': 'want to file complaint', 'hi': 'शिकायत करनी है', 'kok': 'शिकायत करूंक सोदता' },
                'экстренная ситуация': { 'en': 'emergency', 'hi': 'आपातकाल', 'kok': 'तातकाळ' },
                'спасибо': { 'en': 'thank you', 'hi': 'धन्यवाद', 'kok': 'देव बरे करूं' }
            }
        };
        
        console.log('📚 Offline dictionary loaded with', Object.keys(this.offlineDictionary).length, 'languages');
    }
    
    /**
     * Toggle recording state
     */
    toggleRecording() {
        if (this.isProcessing) {
            console.log('⏳ Currently processing, ignoring toggle');
            return;
        }
        
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }
    
    /**
     * Start recording with auto-language detection
     */
    startRecording() {
        if (!this.recognition) {
            this.showError('Speech recognition not available');
            return;
        }
        
        console.log(`🎤 Starting recording for ${this.currentSpeaker}`);
        
        // Set recognition language based on current speaker
        // For auto-detection, we'll start with a broad language and refine based on results
        const langCode = this.currentSpeaker === 'officer' ? 'en-IN' : 'hi-IN';
        this.recognition.lang = langCode;
        
        try {
            this.recognition.start();
            this.isRecording = true;
            this.updateMicButton();
            this.playStartBeep();
            this.updateStatus('Listening...', 'Recording');
            
        } catch (error) {
            console.error('❌ Error starting recognition:', error);
            this.showError('Failed to start recording');
        }
    }
    
    /**
     * Stop recording
     */
    stopRecording() {
        if (!this.isRecording) return;
        
        console.log('🛑 Stopping recording');
        
        this.recognition.stop();
        this.isRecording = false;
        this.isProcessing = true;
        this.updateMicButton();
        this.playStopBeep();
        this.updateStatus('Processing...', 'Offline');
    }
    
    /**
     * Handle recognition start event
     */
    onRecognitionStart() {
        console.log('🎤 Recognition started');
        this.updateMicStatus('Listening...', 'Speak now / अब बोलें / आता बोला');
    }
    
    /**
     * Handle recognition result with auto-language detection
     */
    onRecognitionResult(event) {
        console.log('📝 Recognition result received');
        
        const results = Array.from(event.results[0]);
        const transcript = results[0].transcript.trim();
        const confidence = results[0].confidence;
        
        console.log(`📝 Transcript: "${transcript}" (confidence: ${confidence})`);
        
        // Auto-detect language based on transcript content
        const detectedLang = this.detectLanguage(transcript);
        console.log(`🔍 Detected language: ${detectedLang}`);
        
        // Update detected language for current speaker
        this.detectedLanguages[this.currentSpeaker] = detectedLang;
        this.updateLanguageIndicator();
        
        // Add original message to transcript
        this.addMessage(this.currentSpeaker, transcript, detectedLang, 'original');
        
        // Translate to opposite side
        const targetSpeaker = this.currentSpeaker === 'visitor' ? 'officer' : 'visitor';
        const targetLang = this.detectedLanguages[targetSpeaker];
        
        this.translateAndSpeak(transcript, detectedLang, targetLang, targetSpeaker);
    }
    
    /**
     * Auto-detect language from transcript using pattern matching
     * This is a simplified approach - in production, you'd use more sophisticated detection
     */
    detectLanguage(text) {
        const lowerText = text.toLowerCase();
        
        // Russian detection (Cyrillic characters)
        if (/[а-яё]/i.test(text)) {
            return 'ru';
        }
        
        // Hindi/Devanagari detection
        if (/[\u0900-\u097F]/.test(text)) {
            // Check for Konkani-specific patterns (simplified)
            if (lowerText.includes('हांव') || lowerText.includes('तुम्ही') || lowerText.includes('आमी')) {
                return 'kok';
            }
            return 'hi';
        }
        
        // English detection (default for Latin script)
        if (/^[a-zA-Z\s.,!?'"]+$/.test(text)) {
            return 'en';
        }
        
        // Fallback based on common words
        const hindiWords = ['है', 'का', 'की', 'को', 'में', 'से', 'पर', 'और', 'या'];
        const konkaniWords = ['आसा', 'चो', 'ची', 'क', 'त', 'न', 'वर', 'आनी', 'वा'];
        const englishWords = ['the', 'is', 'are', 'and', 'or', 'in', 'on', 'at', 'to'];
        
        const words = lowerText.split(/\s+/);
        
        let hindiScore = 0, konkaniScore = 0, englishScore = 0;
        
        words.forEach(word => {
            if (hindiWords.includes(word)) hindiScore++;
            if (konkaniWords.includes(word)) konkaniScore++;
            if (englishWords.includes(word)) englishScore++;
        });
        
        if (konkaniScore > hindiScore && konkaniScore > englishScore) return 'kok';
        if (hindiScore > englishScore) return 'hi';
        
        return 'en'; // Default fallback
    }
    
    /**
     * Translate text using offline dictionary first, with fallback options
     */
    translateAndSpeak(text, sourceLang, targetLang, targetSpeaker) {
        console.log(`🔄 Translating "${text}" from ${sourceLang} to ${targetLang}`);
        
        // Try offline translation first
        const translation = this.translateOffline(text, sourceLang, targetLang);
        
        if (translation) {
            console.log(`✅ Offline translation: "${translation}"`);
            this.addMessage(targetSpeaker, translation, targetLang, 'translated');
            this.speakText(translation, targetLang);
        } else {
            console.log('❌ No offline translation found');
            
            // Fallback message
            const fallbackMessage = this.getFallbackMessage(targetLang);
            this.addMessage(targetSpeaker, fallbackMessage, targetLang, 'translated');
            
            // TODO: Add external API call here
            // this.translateWithAPI(text, sourceLang, targetLang, targetSpeaker);
            
            console.log('💡 API integration point: Add external translation service call here');
        }
        
        this.isProcessing = false;
        this.updateMicButton();
        this.updateStatus('Ready', 'Offline');
    }
    
    /**
     * Attempt offline translation using built-in dictionary
     */
    translateOffline(text, sourceLang, targetLang) {
        const lowerText = text.toLowerCase().trim();
        
        // Check if source language exists in dictionary
        if (!this.offlineDictionary[sourceLang]) {
            return null;
        }
        
        // Look for exact phrase match
        const phrases = this.offlineDictionary[sourceLang];
        if (phrases[lowerText] && phrases[lowerText][targetLang]) {
            return phrases[lowerText][targetLang];
        }
        
        // Try partial matches for longer sentences
        for (const phrase in phrases) {
            if (lowerText.includes(phrase) && phrases[phrase][targetLang]) {
                return phrases[phrase][targetLang];
            }
        }
        
        return null;
    }
    
    /**
     * Get fallback message when translation is not available
     */
    getFallbackMessage(targetLang) {
        const fallbacks = {
            'en': 'Translation not available offline',
            'hi': 'अनुवाद ऑफलाइन उपलब्ध नहीं',
            'kok': 'भाषांतर ऑफलायन उपलब्ध ना',
            'ru': 'Перевод недоступен офлайн'
        };
        
        return fallbacks[targetLang] || fallbacks['en'];
    }
    
    /**
     * Speak translated text using appropriate voice
     */
    speakText(text, language) {
        if (!this.synthesis) {
            console.error('❌ Speech synthesis not available');
            return;
        }
        
        // Cancel any ongoing speech
        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set language code
        const langConfig = this.supportedLanguages[language];
        if (langConfig) {
            utterance.lang = langConfig.code;
        }
        
        // Find appropriate voice
        const voice = this.findBestVoice(language);
        if (voice) {
            utterance.voice = voice;
            console.log(`🔊 Using voice: ${voice.name} for language: ${language}`);
        }
        
        // Configure speech parameters
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Error handling
        utterance.onerror = (event) => {
            console.error('❌ Speech synthesis error:', event.error);
        };
        
        utterance.onend = () => {
            console.log('🔊 Speech synthesis completed');
        };
        
        // Speak the text
        this.synthesis.speak(utterance);
    }
    
    /**
     * Find the best available voice for a given language
     */
    findBestVoice(language) {
        if (!this.voices.length) return null;
        
        const langConfig = this.supportedLanguages[language];
        if (!langConfig) return null;
        
        // Try to find exact language match
        let voice = this.voices.find(v => v.lang === langConfig.code);
        
        // Fallback to language family match
        if (!voice) {
            const langFamily = langConfig.code.split('-')[0];
            voice = this.voices.find(v => v.lang.startsWith(langFamily));
        }
        
        // Final fallback to any available voice
        if (!voice) {
            voice = this.voices.find(v => v.default) || this.voices[0];
        }
        
        return voice;
    }
    
    /**
     * Add message to transcript area
     */
    addMessage(speaker, text, language, type) {
        const transcriptArea = speaker === 'visitor' ? this.visitorTranscript : this.officerTranscript;
        
        // Clear welcome message if it exists
        const welcomeMessage = transcriptArea.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
        
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const langConfig = this.supportedLanguages[language];
        const langName = langConfig ? langConfig.name : language.toUpperCase();
        const timestamp = new Date().toLocaleTimeString();
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-lang">${langName}</span>
                <span class="message-time">${timestamp}</span>
            </div>
            <div class="message-text">${text}</div>
        `;
        
        // Add to transcript
        transcriptArea.appendChild(messageDiv);
        
        // Scroll to bottom
        transcriptArea.scrollTop = transcriptArea.scrollHeight;
        
        console.log(`💬 Added ${type} message to ${speaker} panel: "${text}"`);
    }
    
    /**
     * Handle recognition errors
     */
    onRecognitionError(event) {
        console.error('❌ Recognition error:', event.error);
        
        this.isRecording = false;
        this.isProcessing = false;
        this.updateMicButton();
        
        let errorMessage = 'Recognition error';
        switch (event.error) {
            case 'no-speech':
                errorMessage = 'No speech detected';
                break;
            case 'audio-capture':
                errorMessage = 'Microphone not accessible';
                break;
            case 'not-allowed':
                errorMessage = 'Microphone permission denied';
                break;
            case 'network':
                errorMessage = 'Network error';
                break;
        }
        
        this.updateStatus(errorMessage, 'Error');
        setTimeout(() => this.updateStatus('Ready', 'Offline'), 3000);
    }
    
    /**
     * Handle recognition end event
     */
    onRecognitionEnd() {
        console.log('🛑 Recognition ended');
        this.isRecording = false;
        
        if (!this.isProcessing) {
            this.updateMicButton();
            this.updateStatus('Ready', 'Offline');
        }
    }
    
    /**
     * Update microphone button appearance
     */
    updateMicButton() {
        this.micButton.classList.remove('recording', 'processing');
        
        if (this.isRecording) {
            this.micButton.classList.add('recording');
        } else if (this.isProcessing) {
            this.micButton.classList.add('processing');
        }
    }
    
    /**
     * Update microphone status text
     */
    updateMicStatus(primary, secondary) {
        const statusText = this.micStatus.querySelector('.status-text');
        const statusSubtext = this.micStatus.querySelector('.status-subtext');
        
        if (statusText) statusText.textContent = primary;
        if (statusSubtext) statusSubtext.textContent = secondary;
    }
    
    /**
     * Update language indicators
     */
    updateLanguageIndicator() {
        const visitorLangCode = this.supportedLanguages[this.detectedLanguages.visitor]?.flag || 'AUTO';
        const officerLangCode = this.supportedLanguages[this.detectedLanguages.officer]?.flag || 'EN';
        
        this.visitorLang.querySelector('.lang-code').textContent = visitorLangCode;
        this.officerLang.querySelector('.lang-code').textContent = officerLangCode;
        
        // Add active class to current speaker
        this.visitorLang.classList.toggle('active', this.currentSpeaker === 'visitor');
        this.officerLang.classList.toggle('active', this.currentSpeaker === 'officer');
    }
    
    /**
     * Update speaker indicator
     */
    updateSpeakerIndicator() {
        this.updateLanguageIndicator();
        console.log(`👤 Current speaker: ${this.currentSpeaker}`);
    }
    
    /**
     * Update system status
     */
    updateStatus(status, mode) {
        this.systemStatus.textContent = status;
        this.currentMode.textContent = mode;
    }
    
    /**
     * Play audio feedback for recording start
     */
    playStartBeep() {
        try {
            // Create a simple beep using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            console.log('🔇 Audio feedback not available');
        }
    }
    
    /**
     * Play audio feedback for recording stop
     */
    playStopBeep() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            console.log('🔇 Audio feedback not available');
        }
    }
    
    /**
     * Show error message to user
     */
    showError(message) {
        console.error('❌', message);
        this.updateStatus(message, 'Error');
        
        // Reset after 5 seconds
        setTimeout(() => {
            this.updateStatus('Ready', 'Offline');
        }, 5000);
    }
    
    /**
     * External API integration point
     * Uncomment and implement when external translation service is available
     */
    /*
    async translateWithAPI(text, sourceLang, targetLang, targetSpeaker) {
        try {
            console.log('🌐 Attempting external API translation...');
            
            // Example: LibreTranslate API call
            const response = await fetch('https://libretranslate.de/translate', {
                method: 'POST',
                body: JSON.stringify({
                    q: text,
                    source: sourceLang,
                    target: targetLang,
                    format: 'text'
                }),
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const data = await response.json();
                const translation = data.translatedText;
                
                console.log(`✅ API translation: "${translation}"`);
                this.addMessage(targetSpeaker, translation, targetLang, 'translated');
                this.speakText(translation, targetLang);
                this.updateStatus('Ready', 'Online');
            } else {
                throw new Error('API request failed');
            }
            
        } catch (error) {
            console.error('❌ API translation failed:', error);
            const fallbackMessage = this.getFallbackMessage(targetLang);
            this.addMessage(targetSpeaker, fallbackMessage, targetLang, 'translated');
            this.updateStatus('Ready', 'Offline');
        }
    }
    */
}

// Initialize the interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing interface...');
    window.translationInterface = new PoliceTranslationInterface();
});

// Handle page visibility changes to manage resources
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.translationInterface) {
        // Stop any ongoing recognition when page is hidden
        if (window.translationInterface.isRecording) {
            window.translationInterface.stopRecording();
        }
        // Cancel any ongoing speech
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PoliceTranslationInterface;
}