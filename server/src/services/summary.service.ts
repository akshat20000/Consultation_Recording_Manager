import { IConsultationSummary } from '../models/Consultation';

export class SummaryService {
  /**
   * Generates a structured summary from a transcript
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
