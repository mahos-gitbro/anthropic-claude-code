import { Router, Response } from 'express';
import { getDb } from '../database';
import { optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, (_req: AuthRequest, res: Response) => {
  const db = getDb();

  const series = db.prepare(`
    SELECT
      ip.id,
      ip.title,
      ip.description,
      ip.type,
      ip.excerpt,
      ip.gradient_from,
      ip.gradient_to,
      ip.created_at,
      u.id as artist_id,
      u.username as artist_username,
      u.bio as artist_bio,
      (SELECT COUNT(*) FROM videos v WHERE v.ip_source_id = ip.id) as total_videos,
      (SELECT COUNT(*) FROM videos v WHERE v.ip_source_id = ip.id AND v.is_hero = 1) as hero_count,
      (
        SELECT v.id FROM videos v WHERE v.ip_source_id = ip.id AND v.is_hero = 1 LIMIT 1
      ) as hero_video_id,
      (
        SELECT v.title FROM videos v WHERE v.ip_source_id = ip.id AND v.is_hero = 1 LIMIT 1
      ) as hero_video_title,
      (
        SELECT v.duration FROM videos v WHERE v.ip_source_id = ip.id AND v.is_hero = 1 LIMIT 1
      ) as hero_video_duration,
      (
        SELECT v.view_count FROM videos v WHERE v.ip_source_id = ip.id AND v.is_hero = 1 LIMIT 1
      ) as hero_view_count,
      (
        SELECT COUNT(*) FROM votes vt
        JOIN videos v ON v.id = vt.video_id
        WHERE v.ip_source_id = ip.id AND vt.vote_type = 'up'
      ) as total_upvotes
    FROM ip_sources ip
    JOIN users u ON u.id = ip.artist_id
    ORDER BY ip.id ASC
  `).all();

  res.json(series);
});

router.get('/:id', optionalAuth, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const seriesId = Number(req.params.id);

  const series = db.prepare(`
    SELECT
      ip.id,
      ip.title,
      ip.description,
      ip.type,
      ip.excerpt,
      ip.gradient_from,
      ip.gradient_to,
      ip.created_at,
      u.id as artist_id,
      u.username as artist_username,
      u.bio as artist_bio,
      (SELECT COUNT(*) FROM videos v WHERE v.ip_source_id = ip.id) as total_videos
    FROM ip_sources ip
    JOIN users u ON u.id = ip.artist_id
    WHERE ip.id = ?
  `).get(seriesId);

  if (!series) {
    res.status(404).json({ error: 'Series not found' });
    return;
  }

  const videos = db.prepare(`
    SELECT
      v.id,
      v.title,
      v.description,
      v.duration,
      v.video_url,
      v.view_count,
      v.is_hero,
      v.created_at,
      u.id as user_id,
      u.username,
      u.is_artist,
      (SELECT COUNT(*) FROM votes vt WHERE vt.video_id = v.id AND vt.vote_type = 'up') as upvotes,
      (SELECT COUNT(*) FROM votes vt WHERE vt.video_id = v.id AND vt.vote_type = 'down') as downvotes,
      (SELECT COUNT(*) FROM comments c WHERE c.video_id = v.id) as comment_count
      ${req.userId ? `, (SELECT vt.vote_type FROM votes vt WHERE vt.video_id = v.id AND vt.user_id = ${req.userId} LIMIT 1) as user_vote` : ', NULL as user_vote'}
    FROM videos v
    JOIN users u ON u.id = v.user_id
    WHERE v.ip_source_id = ?
    ORDER BY v.is_hero DESC, v.view_count DESC
  `).all(seriesId);

  res.json({ ...series, videos });
});

export default router;
