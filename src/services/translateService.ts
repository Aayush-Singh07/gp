const GOOGLE_TRANSLATE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY || '';

export const translateService = {
  async translateText(text: string, targetLanguage: string, sourceLanguage: string = 'auto'): Promise<string> {
    try {
      if (!GOOGLE_TRANSLATE_API_KEY) {
        console.warn('Google Translate API key not set. Returning original text.');
        return text;
      }
      
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            target: targetLanguage,
            source: sourceLanguage === 'auto' ? undefined : sourceLanguage,
            format: 'text'
          })
        }
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      return data.data.translations[0].translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error('Failed to translate text');
    }
  },

  // Language code mappings
  getLanguageCode(language: string): string {
    const languageMap: Record<string, string> = {
      'english': 'en',
      'hindi': 'hi',
      'konkani': 'kok' // Note: Konkani might not be fully supported, fallback to Hindi
    };
    return languageMap[language] || 'en';
  }
};