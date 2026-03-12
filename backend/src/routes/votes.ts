import { Router, Response } from 'express';
import { getDb } from '../database';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

function getVoteCounts(db: ReturnType<typeof getDb>, videoId?: number, commentId?: number) {
  if (videoId) {
    const up = (db.prepare("SELECT COUNT(*) as c FROM votes WHERE video_id = ? AND vote_type = 'up'").get(videoId) as { c: number }).c;
    const down = (db.prepare("SELECT COUNT(*) as c FROM votes WHERE video_id = ? AND vote_type = 'down'").get(videoId) as { c: number }).c;
    return { upvotes: up, downvotes: down };
  }
  if (commentId) {
    const up = (db.prepare("SELECT COUNT(*) as c FROM votes WHERE comment_id = ? AND vote_type = 'up'").get(commentId) as { c: number }).c;
    const down = (db.prepare("SELECT COUNT(*) as c FROM votes WHERE comment_id = ? AND vote_type = 'down'").get(commentId) as { c: number }).c;
    return { upvotes: up, downvotes: down };
  }
  return { upvotes: 0, downvotes: 0 };
}

// POST /api/votes — cast or toggle a vote
router.post('/', requireAuth, (req: AuthRequest, res: Response) => {
  const { video_id, comment_id, vote_type } = req.body as {
    video_id?: number; comment_id?: number; vote_type?: string;
  };

  if (!video_id && !comment_id) {
    res.status(400).json({ error: 'video_id or comment_id is required' });
    return;
  }
  if (video_id && comment_id) {
    res.status(400).json({ error: 'Provide either video_id or comment_id, not both' });
    return;
  }
  if (vote_type !== 'up' && vote_type !== 'down') {
    res.status(400).json({ error: 'vote_type must be "up" or "down"' });
    return;
  }

  const db = getDb();

  if (video_id) {
    const video = db.prepare('SELECT id FROM videos WHERE id = ?').get(video_id);
    if (!video) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }

    const existing = db.prepare('SELECT id, vote_type FROM votes WHERE user_id = ? AND video_id = ?')
      .get(req.userId, video_id) as { id: number; vote_type: string } | undefined;

    if (existing) {
      if (existing.vote_type === vote_type) {
        // Toggle off
        db.prepare('DELETE FROM votes WHERE id = ?').run(existing.id);
        return res.json({ user_vote: null, ...getVoteCounts(db, video_id) });
      } else {
        // Change vote
        db.prepare('UPDATE votes SET vote_type = ? WHERE id = ?').run(vote_type, existing.id);
        return res.json({ user_vote: vote_type, ...getVoteCounts(db, video_id) });
      }
    } else {
      db.prepare('INSERT INTO votes (user_id, video_id, vote_type) VALUES (?, ?, ?)').run(req.userId, video_id, vote_type);
      return res.json({ user_vote: vote_type, ...getVoteCounts(db, video_id) });
    }
  }

  if (comment_id) {
    const comment = db.prepare('SELECT id FROM comments WHERE id = ?').get(comment_id);
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    const existing = db.prepare('SELECT id, vote_type FROM votes WHERE user_id = ? AND comment_id = ?')
      .get(req.userId, comment_id) as { id: number; vote_type: string } | undefined;

    if (existing) {
      if (existing.vote_type === vote_type) {
        db.prepare('DELETE FROM votes WHERE id = ?').run(existing.id);
        return res.json({ user_vote: null, ...getVoteCounts(db, undefined, comment_id) });
      } else {
        db.prepare('UPDATE votes SET vote_type = ? WHERE id = ?').run(vote_type, existing.id);
        return res.json({ user_vote: vote_type, ...getVoteCounts(db, undefined, comment_id) });
      }
    } else {
      db.prepare('INSERT INTO votes (user_id, comment_id, vote_type) VALUES (?, ?, ?)').run(req.userId, comment_id, vote_type);
      return res.json({ user_vote: vote_type, ...getVoteCounts(db, undefined, comment_id) });
    }
  }
});

export default router;
