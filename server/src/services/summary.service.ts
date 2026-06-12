import { IConsultationSummary } from '../models/Consultation';
import OpenAI from 'openai';
import { env, isOpenAIConfigured } from '../config/env';

const openai = isOpenAIConfigured ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

export class SummaryService {
  /**
   * Generates a structured summary from a transcript using OpenAI.
   * Falls back to a rule-based mock summary if OpenAI is not configured or the call fails.
   */
  static async generateSummary(transcript: string): Promise<IConsultationSummary> {
    if (!isOpenAIConfigured || !openai) {
      console.warn('[Summary] OPENAI_API_KEY not set. Using mock summary.');
      return this.generateMockSummary(transcript);
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an assistant that summarizes astrology consultation transcripts. ' +
              'Respond ONLY with a valid JSON object (no markdown, no code fences) matching exactly this shape: ' +
              '{"keyTopics": string[], "recommendations": string[], "actionItems": string[], "followUps": string[], "keywords": string[], "sentiment": string}. ' +
              'keyTopics: 2-5 main themes discussed. recommendations: practical advice given by the astrologer. ' +
              'actionItems: concrete tasks the client should do. followUps: suggested next steps/future consultations. ' +
              'keywords: 3-6 short tags. sentiment: one word describing the overall tone (e.g. Positive, Insightful, Harmonious, Neutral, Concerned).',
          },
          {
            role: 'user',
            content: `Summarize the following consultation transcript:\n\n${transcript}`,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return this.generateMockSummary(transcript);
      }

      const parsed = JSON.parse(content);

      const summary: IConsultationSummary = {
        keyTopics: Array.isArray(parsed.keyTopics) ? parsed.keyTopics : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
        followUps: Array.isArray(parsed.followUps) ? parsed.followUps : [],
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        sentiment: typeof parsed.sentiment === 'string' ? parsed.sentiment : 'Neutral',
      };

      // Guard against empty AI output
      if (summary.keyTopics.length === 0 && summary.recommendations.length === 0) {
        return this.generateMockSummary(transcript);
      }

      return summary;
    } catch (error) {
      console.error('[Summary] OpenAI summarization failed. Falling back to mock summary.', error);
      return this.generateMockSummary(transcript);
    }
  }

  /**
   * Generates a structured summary from a transcript (rule-based fallback)
   */
  static generateMockSummary(transcript: string): IConsultationSummary {
    const text = transcript.toLowerCase();

    // Default structure
    let keyTopics = ['Planetary Transits', 'General Well-being', 'Astrological Counseling'];
    let recommendations = ['Practice daily meditation to calm anxious energy', 'Maintain a balanced routine'];
    let actionItems = ['Review transit dates shared during the session'];
    let followUps = ['Check in next quarter or during major life transitions'];
    let keywords = ['Astrology', 'Chart', 'Transit', 'Vedic'];
    let sentiment = 'Positive';

    if (text.includes('saturn') || text.includes('career') || text.includes('job')) {
      keyTopics = [
        'Saturn Mahadasha Impact',
        'Career Path & Professional Transitions',
        'Tenth House Lord Analysis',
        'Financial Projections'
      ];
      recommendations = [
        'Strengthen Saturn by chanting the Shani Mantra on Saturday evenings',
        'Delay major speculative financial investments for the next 45 days',
        'Perform a phased career transition rather than a sudden resignation'
      ];
      actionItems = [
        'Research genuine blue or yellow sapphire gemstones',
        'Set up a regular Saturday chanting routine',
        'Prepare updated professional profile documents'
      ];
      followUps = [
        'Schedule a follow-up consultation in October after Jupiter transits'
      ];
      keywords = ['Saturn', 'Career', 'Mahadasha', 'Tenth House', 'Gemstone'];
      sentiment = 'Insightful';
    } else if (text.includes('relation') || text.includes('marriage') || text.includes('venus')) {
      keyTopics = [
        'Relationship Compatibility & Chart Matching',
        'Venus & 7th House Analysis',
        'Manglik Dosha Assessment'
      ];
      recommendations = [
        'Perform fasts on Thursdays to strengthen Jupiter and venus influence',
        'Offer water to the morning Sun for energy harmony',
        'Keep communication transparent and gentle to mitigate Mars influence'
      ];
      actionItems = [
        'Initiate Sun prayers in the morning',
        'Plan compatibility matching for prospective dates'
      ];
      followUps = [
        'Schedule a joint compatibility session prior to final decision-making'
      ];
      keywords = ['Venus', 'Relationship', 'Compatibility', 'Dosha', 'Marriage'];
      sentiment = 'Harmonious';
    }

    return {
      keyTopics,
      recommendations,
      actionItems,
      followUps,
      keywords,
      sentiment,
    };
  }
}
