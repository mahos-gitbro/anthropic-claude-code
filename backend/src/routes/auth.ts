import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../database';
import { requireAuth, signToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', (req: Request, res: Response) => {
  const { username, email, password } = req.body as { username?: string; email?: string; password?: string };

  if (!username || !email || !password) {
    res.status(400).json({ error: 'Username, email, and password are required' });
    return;
  }
  if (username.length < 3 || username.length > 30) {
    res.status(400).json({ error: 'Username must be 3–30 characters' });
    return;
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    res.status(400).json({ error: 'Username may only contain letters, numbers, and underscores' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
  if (existing) {
    res.status(409).json({ error: 'Username or email already taken' });
    return;
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (username, email, password_hash, is_artist) VALUES (?, ?, ?, 0)',
  ).run(username, email, passwordHash);

  const userId = result.lastInsertRowid as number;
  const token = signToken(userId, username);
  res.status(201).json({ token, user: { id: userId, username, email, is_artist: 0 } });
});

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as {
    id: number; username: string; email: string; password_hash: string; is_artist: number; bio: string | null;
  } | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = signToken(user.id, user.username);
  res.json({
    token,
    user: { id: user.id, username: user.username, email: user.email, is_artist: user.is_artist, bio: user.bio },
  });
});

router.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const user = db.prepare('SELECT id, username, email, is_artist, bio, avatar_url, created_at FROM users WHERE id = ?').get(req.userId) as {
    id: number; username: string; email: string; is_artist: number; bio: string | null; avatar_url: string | null; created_at: string;
  } | undefined;

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
});

export default router;
