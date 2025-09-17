import OpenAI from 'openai';

const createOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OpenAI API key not set. Voice input will use fallback.');
    return null;
  }
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
  });
};

const openai = createOpenAIClient();

export const whisperService = {
  async transcribeAudio(audioBlob: Blob, language: string = 'auto'): Promise<string> {
    try {
      if (!openai) {
        throw new Error('OpenAI client not available');
      }
      
      const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
      
      const transcription = await openai.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
        language: language === 'auto' ? undefined : language,
        response_format: 'text'
      });

      return transcription;
    } catch (error) {
      console.error('Whisper transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }
};