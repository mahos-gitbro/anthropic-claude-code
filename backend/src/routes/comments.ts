import { Router, Response } from 'express';
import { getDb } from '../database';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, (req: AuthRequest, res: Response) => {
  const videoId = Number(req.query.videoId);
  if (!videoId) {
    res.status(400).json({ error: 'videoId is required' });
    return;
  }

  const db = getDb();

  const comments = db.prepare(`
    SELECT
      c.id,
      c.content,
      c.parent_id,
      c.created_at,
      u.id as user_id,
      u.username,
      u.is_artist,
      (SELECT COUNT(*) FROM votes vt WHERE vt.comment_id = c.id AND vt.vote_type = 'up') as upvotes,
      (SELECT COUNT(*) FROM votes vt WHERE vt.comment_id = c.id AND vt.vote_type = 'down') as downvotes
      ${req.userId ? `, (SELECT vt.vote_type FROM votes vt WHERE vt.comment_id = c.id AND vt.user_id = ${req.userId} LIMIT 1) as user_vote` : ', NULL as user_vote'}
    FROM comments c
    JOIN users u ON u.id = c.user_id
    WHERE c.video_id = ?
    ORDER BY c.created_at ASC
  `).all(videoId) as Array<{
    id: number; content: string; parent_id: number | null; created_at: string;
    user_id: number; username: string; is_artist: number; upvotes: number; downvotes: number; user_vote: string | null;
    replies?: typeof comments;
  }>;

  // Build nested structure (top-level + replies)
  const topLevel = comments.filter(c => !c.parent_id);
  const replies = comments.filter(c => c.parent_id);

  for (const comment of topLevel) {
    comment.replies = replies.filter(r => r.parent_id === comment.id);
  }

  res.json(topLevel);
});

router.post('/', requireAuth, (req: AuthRequest, res: Response) => {
  const { content, video_id, parent_id } = req.body as {
    content?: string; video_id?: number; parent_id?: number | null;
  };

  if (!content?.trim() || !video_id) {
    res.status(400).json({ error: 'Content and video_id are required' });
    return;
  }
  if (content.trim().length > 2000) {
    res.status(400).json({ error: 'Comment must be 2000 characters or fewer' });
    return;
  }

  const db = getDb();

  const video = db.prepare('SELECT id FROM videos WHERE id = ?').get(video_id);
  if (!video) {
    res.status(404).json({ error: 'Video not found' });
    return;
  }

  if (parent_id) {
    const parent = db.prepare('SELECT id, parent_id FROM comments WHERE id = ? AND video_id = ?').get(parent_id, video_id) as { id: number; parent_id: number | null } | undefined;
    if (!parent) {
      res.status(404).json({ error: 'Parent comment not found' });
      return;
    }
    if (parent.parent_id !== null) {
      res.status(400).json({ error: 'Cannot reply to a reply (max nesting depth: 1)' });
      return;
    }
  }

  const result = db.prepare(
    'INSERT INTO comments (content, user_id, video_id, parent_id) VALUES (?, ?, ?, ?)',
  ).run(content.trim(), req.userId, video_id, parent_id || null);

  const comment = db.prepare(`
    SELECT c.*, u.username, u.is_artist FROM comments c
    JOIN users u ON u.id = c.user_id
    WHERE c.id = ?
  `).get(result.lastInsertRowid) as Record<string, unknown>;

  res.status(201).json({ ...comment, upvotes: 0, downvotes: 0, user_vote: null, replies: [] });
});

router.delete('/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const commentId = Number(req.params.id);

  const comment = db.prepare('SELECT id, user_id FROM comments WHERE id = ?').get(commentId) as { id: number; user_id: number } | undefined;
  if (!comment) {
    res.status(404).json({ error: 'Comment not found' });
    return;
  }
  if (comment.user_id !== req.userId) {
    res.status(403).json({ error: 'Cannot delete another user\'s comment' });
    return;
  }

  db.prepare('DELETE FROM votes WHERE comment_id = ?').run(commentId);
  db.prepare('DELETE FROM comments WHERE parent_id = ?').run(commentId);
  db.prepare('DELETE FROM comments WHERE id = ?').run(commentId);

  res.status(204).end();
});

export default router;
