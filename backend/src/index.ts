import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './database';
import authRoutes from './routes/auth';
import seriesRoutes from './routes/series';
import videoRoutes from './routes/videos';
import commentRoutes from './routes/comments';
import voteRoutes from './routes/votes';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/votes', voteRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

initializeDatabase();

app.listen(PORT, () => {
  console.log(`[GenTV] Backend running on http://localhost:${PORT}`);
});
