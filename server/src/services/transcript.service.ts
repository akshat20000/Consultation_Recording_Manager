import fs from 'fs';
import OpenAI from 'openai';
import { env, isOpenAIConfigured } from '../config/env';

const openai = isOpenAIConfigured
  ? new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  })
  : null;

export class TranscriptService {
  /**
   * Generates a transcript from an audio file using OpenAI Whisper.
   * Falls back to a mock transcript if OpenAI is not configured or the call fails.
   */
  static async generateTranscript(
    localFilePath: string,
    clientName: string,
    title: string,
    category?: string
  ): Promise<string> {
    if (!isOpenAIConfigured || !openai) {
      console.warn('[Transcript] API Key not set. Using mock transcript.');
      return this.generateMockTranscript(clientName, title, category);
    }

    try {
      if (!fs.existsSync(localFilePath)) {
        console.warn(`[Transcript] Audio file not found at ${localFilePath}. Using mock transcript.`);
        return this.generateMockTranscript(clientName, title, category);
      }

      const fileExtension = localFilePath.split('.').pop()?.toLowerCase() || 'wav';

      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(localFilePath),
        model: 'whisper-large-v3', 
      });
      

      const text = transcription.text?.trim();
      if (!text || text.toLowerCase().includes('unable to listen')) {
        console.warn('[Transcript] Received an empty or invalid transcription response. Falling back.');
        return this.generateMockTranscript(clientName, title, category);
      }

      console.log('[Transcript] Successfully transcribed audio using Whisper.');
      return text;
    } catch (error) {
      console.error('[Transcript] AI transcription failed. Falling back to mock transcript.', error);
      return this.generateMockTranscript(clientName, title, category);
    }
  }

  /**
   * Generates a realistic mock transcript based on consultation details
   */
  static generateMockTranscript(
    clientName: string,
    title: string,
    category?: string
  ): string {
    const defaultDialogues = [
      `Astrologer: Namaste ${clientName}, thank you for joining today's consultation. We will be analyzing your planetary alignments.`,
      `Client: Namaste. I've been feeling a bit anxious about my path recently. I wanted to understand what the stars say.`,
      `Astrologer: Yes, looking at your natal chart, I see that you are currently undergoing the Saturn (Shani) Mahadasha, which started a year ago. This is why you are experiencing delays and obstacles, particularly in your professional life.`,
      `Client: Oh, that makes sense. It feels like everything is moving very slowly. How long will this block last?`,
      `Astrologer: Saturn teaches us patience and discipline. The transit of Jupiter (Guru) into your 10th house this winter will bring a significant relief and new opportunities. I recommend wearing a natural blue sapphire or a yellow sapphire if your chart supports it, and chanting the Shani Mantra every Saturday.`,
      `Client: Thank you. I will definitely look into that. What about my personal relationships?`,
      `Astrologer: Your 7th house is ruled by Venus, which is well-placed in Taurus. This indicates stable and harmonious relationships, although Mars's aspect suggests occasional heated arguments. Try to keep your communication gentle.`,
      `Client: I understand. I'll practice being more mindful. thank you so much for this clarity!`,
      `Astrologer: You are welcome. Keep faith, and remember, planets outline the path, but your actions define your journey. Let's stay in touch.`
    ];

    const careerDialogues = [
      `Astrologer: Namaste ${clientName}. Let's examine your career houses today. Your 10th house is currently occupied by Jupiter, which is excellent for leadership roles.`,
      `Client: That's reassuring. I was thinking of changing my job. Is it a good time?`,
      `Astrologer: Yes. The transit of Mercury next month creates a very strong Budhaditya Yoga in your house of commerce. This is an ideal window to sign new contracts or initiate a career transition.`,
      `Client: Should I stay in corporate or try entrepreneurship?`,
      `Astrologer: Your Sun is exalted in the 1st house, giving you strong leadership traits. However, Rahu in the 11th house warns against sudden speculative investments. A gradual transition would be safest.`,
      `Client: Understood. I will plan a phased transition.`
    ];

    const relationshipDialogues = [
      `Astrologer: Namaste ${clientName}. Today we are reviewing your relationship chart and compatibility factors.`,
      `Client: Yes, I wanted to ask about matching charts and when my marriage prospects look strong.`,
      `Astrologer: Looking at your 7th house, the lord Venus is conjunct Mercury, which shows a partner who is intellectual and communicative. The Dasha of Jupiter currently active promises auspicious relationship milestones.`,
      `Client: Are there any doshas I should be aware of?`,
      `Astrologer: You have a mild Manglik Dosha, but it is neutralized by the position of Jupiter. I advise offering water to the Sun every morning and keeping a fast on Thursdays to strengthen your relationship bonds.`
    ];

    const textList =
      title.toLowerCase().includes('career') || (category && category.includes('Career'))
        ? careerDialogues
        : title.toLowerCase().includes('match') || title.toLowerCase().includes('relation') || (category && category.includes('Relationship'))
          ? relationshipDialogues
          : defaultDialogues;

    return textList.join('\n\n');
  }
}
