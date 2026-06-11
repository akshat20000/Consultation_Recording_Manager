import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.routes.js';
import clientRoutes from './routes/client.routes.js';
import consultationRoutes from './routes/consultation.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

// Standard middlewares
app.use(cors({
  origin: '*', // Allow all origins for testing convenience
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local uploads folder statically (fallback mode)
app.use('/uploads', express.static('./uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// App API routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
