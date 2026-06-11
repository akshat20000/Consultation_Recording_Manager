import { z } from 'zod';

export const createConsultationSchema = z.object({
  body: z.object({
    clientId: z.string().min(1, 'Client ID is required'),
    title: z.string().min(1, 'Title is required').max(100),
    notes: z.string().optional(),
    tags: z.preprocess((val) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch {
          return [val];
        }
      }
      return val;
    }, z.array(z.string())).optional(),
    consentGiven: z.preprocess((val) => {
      if (val === 'true' || val === '1' || val === true) return true;
      return false;
    }, z.boolean({ required_error: 'Client consent must be verified' })),
    consentTimestamp: z.string().min(1, 'Consent timestamp is required'),
    duration: z.preprocess((val) => {
      const num = Number(val);
      return isNaN(num) ? 0 : num;
    }, z.number().min(0, 'Duration must be positive')),
  }),
});

export const updateConsultationSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(100).optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    transcript: z.string().optional(),
  }),
});
