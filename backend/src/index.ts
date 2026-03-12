import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { initializeDatabase } from './database';
import authRoutes from './routes/auth';
import seriesRoutes from './routes/series';
import videoRoutes from './routes/videos';
import commentRoutes from './routes/comments';
import voteRoutes from './routes/votes';

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';

// In production the frontend is built to ../frontend/dist and served here.
// In dev the Vite dev server runs separately on :5173 and proxies /api to :3001.
if (IS_PROD) {
  app.use(cors());
} else {
  app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
}

app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/votes', voteRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Serve built frontend in production
const FRONTEND_DIST = path.resolve(__dirname, '../../frontend/dist');
if (IS_PROD && fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  // SPA fallback — serve index.html for all non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
  console.log(`[GenTV] Serving frontend from ${FRONTEND_DIST}`);
}

initializeDatabase();

app.listen(PORT, () => {
  console.log(`[GenTV] Running on http://localhost:${PORT}${IS_PROD ? '' : ' (API only — frontend on :5173)'}`);
});
