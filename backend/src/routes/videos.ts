import { Router, Response } from 'express';
import { getDb } from '../database';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const ipSourceId = req.query.series ? Number(req.query.series) : null;
  const heroOnly = req.query.hero === 'true';

  let query = `
    SELECT
      v.id,
      v.title,
      v.description,
      v.duration,
      v.video_url,
      v.view_count,
      v.is_hero,
      v.created_at,
      v.ip_source_id,
      ip.title as series_title,
      ip.gradient_from,
      ip.gradient_to,
      u.id as user_id,
      u.username,
      u.is_artist,
      (SELECT COUNT(*) FROM votes vt WHERE vt.video_id = v.id AND vt.vote_type = 'up') as upvotes,
      (SELECT COUNT(*) FROM votes vt WHERE vt.video_id = v.id AND vt.vote_type = 'down') as downvotes,
      (SELECT COUNT(*) FROM comments c WHERE c.video_id = v.id) as comment_count
      ${req.userId ? `, (SELECT vt.vote_type FROM votes vt WHERE vt.video_id = v.id AND vt.user_id = ${req.userId} LIMIT 1) as user_vote` : ', NULL as user_vote'}
    FROM videos v
    JOIN users u ON u.id = v.user_id
    JOIN ip_sources ip ON ip.id = v.ip_source_id
    WHERE 1=1
  `;

  const params: unknown[] = [];

  if (ipSourceId) {
    query += ' AND v.ip_source_id = ?';
    params.push(ipSourceId);
  }
  if (heroOnly) {
    query += ' AND v.is_hero = 1';
  }

  query += ' ORDER BY v.view_count DESC';

  const videos = db.prepare(query).all(...params);
  res.json(videos);
});

router.get('/:id', optionalAuth, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const videoId = Number(req.params.id);

  const video = db.prepare(`
    SELECT
      v.id,
      v.title,
      v.description,
      v.duration,
      v.video_url,
      v.view_count,
      v.is_hero,
      v.created_at,
      v.ip_source_id,
      ip.title as series_title,
      ip.type as series_type,
      ip.excerpt as series_excerpt,
      ip.gradient_from,
      ip.gradient_to,
      ip.artist_id as series_artist_id,
      u.id as user_id,
      u.username,
      u.bio as user_bio,
      u.is_artist,
      (SELECT COUNT(*) FROM votes vt WHERE vt.video_id = v.id AND vt.vote_type = 'up') as upvotes,
      (SELECT COUNT(*) FROM votes vt WHERE vt.video_id = v.id AND vt.vote_type = 'down') as downvotes,
      (SELECT COUNT(*) FROM comments c WHERE c.video_id = v.id) as comment_count
      ${req.userId ? `, (SELECT vt.vote_type FROM votes vt WHERE vt.video_id = v.id AND vt.user_id = ${req.userId} LIMIT 1) as user_vote` : ', NULL as user_vote'}
    FROM videos v
    JOIN users u ON u.id = v.user_id
    JOIN ip_sources ip ON ip.id = v.ip_source_id
    WHERE v.id = ?
  `).get(videoId);

  if (!video) {
    res.status(404).json({ error: 'Video not found' });
    return;
  }

  // Increment view count
  db.prepare('UPDATE videos SET view_count = view_count + 1 WHERE id = ?').run(videoId);

  res.json(video);
});

router.post('/', requireAuth, (req: AuthRequest, res: Response) => {
  const { title, description, video_url, duration, ip_source_id } = req.body as {
    title?: string; description?: string; video_url?: string; duration?: string; ip_source_id?: number;
  };

  if (!title || !ip_source_id) {
    res.status(400).json({ error: 'Title and series (ip_source_id) are required' });
    return;
  }

  const db = getDb();
  const series = db.prepare('SELECT id FROM ip_sources WHERE id = ?').get(ip_source_id);
  if (!series) {
    res.status(404).json({ error: 'Series not found' });
    return;
  }

  const result = db.prepare(`
    INSERT INTO videos (title, description, video_url, duration, user_id, ip_source_id, is_hero, view_count)
    VALUES (?, ?, ?, ?, ?, ?, 0, 0)
  `).run(title, description || null, video_url || null, duration || '0:00', req.userId, ip_source_id);

  const videoId = result.lastInsertRowid as number;
  const video = db.prepare('SELECT v.*, u.username, ip.title as series_title FROM videos v JOIN users u ON u.id = v.user_id JOIN ip_sources ip ON ip.id = v.ip_source_id WHERE v.id = ?').get(videoId);
  res.status(201).json(video);
});

export default router;
