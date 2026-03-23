import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import meetingsRoutes from './routes/meetings';
import commitmentsRoutes from './routes/commitments';
import exportRoutes from './routes/export';
import settingsRoutes from './routes/settings';
import statsRoutes from './routes/stats';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.resolve(uploadDir)));

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/meetings', meetingsRoutes);
app.use('/meetings', statsRoutes);
app.use('/meetings', exportRoutes);
app.use('/commitments', commitmentsRoutes);
app.use('/settings', settingsRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);

  if (err.message && err.message.includes('Invalid file type')) {
    res.status(400).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
});

export default app;
