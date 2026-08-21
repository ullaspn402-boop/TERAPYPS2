import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config();

const app = express();

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/$/, ''))
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.vercel.app') ||
        cleanOrigin.includes('localhost') ||
        cleanOrigin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());

// Basic Route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Import Routes
import authRoutes from './routes/auth.routes';
import patientsRoutes from './routes/patients.routes';
import casesRoutes from './routes/cases.routes';
import sessionsRoutes from './routes/sessions.routes';
import reportsRoutes from './routes/reports.routes';
import usersRoutes from './routes/users.routes';
import therapyPlansRoutes from './routes/therapyPlans.routes';
import aiRoutes from './routes/ai.routes';
import notificationsRoutes from './routes/notifications.routes';
import analyticsRoutes from './routes/analytics.routes';

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/therapy-plans', therapyPlansRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ success: false, error: message });
});

// Database connection & Server start
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/speechcare';

async function startServer() {
  let uri = MONGODB_URI;
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log('✅ Connected to MongoDB at', uri);
  } catch (error) {
    console.warn('⚠️ Local MongoDB not found on port 27017. Launching embedded MongoMemoryServer fallback...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({ instance: { port: 27017 } });
      uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('✅ Connected to MongoMemoryServer at', uri);
    } catch (memErr) {
      console.error('❌ Failed to launch MongoMemoryServer:', memErr);
      process.exit(1);
    }
  }

  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}

startServer();
