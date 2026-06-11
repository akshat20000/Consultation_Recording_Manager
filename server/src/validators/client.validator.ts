import { z } from 'zod';

export const createClientSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Client name is required').max(50),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(5, 'Valid phone number is required'),
    notes: z.string().optional(),
  }),
});

export const updateClientSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Client name is required').optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().min(5, 'Valid phone number is required').optional(),
    notes: z.string().optional(),
  }),
});
