import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import { Comment } from '../types';
import VoteButtons from './VoteButtons';

interface CommentSectionProps {
  videoId: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function CommentItem({
  comment, videoId, onDelete, level = 0,
}: {
  comment: Comment; videoId: number; onDelete: (id: number) => void; level?: number;
}) {
  const { user } = useAuth();
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replies, setReplies] = useState<Comment[]>(comment.replies || []);

  const handleReply = async () => {
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const newReply = await api.createComment({ content: replyText.trim(), video_id: videoId, parent_id: comment.id });
      setReplies(r => [...r, newReply]);
      setReplyText('');
      setReplyOpen(false);
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginLeft: level > 0 ? '32px' : '0', marginBottom: '16px' }}>
      <div style={{
        background: level > 0 ? 'rgba(255,255,255,0.02)' : 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px',
              background: 'linear-gradient(135deg, var(--accent), #2563eb)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: '700', color: '#fff',
              flexShrink: 0,
            }}>
              {comment.username[0].toUpperCase()}
            </div>
            <div>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>
                @{comment.username}
              </span>
              {comment.is_artist === 1 && (
                <span style={{
                  marginLeft: '6px',
                  fontSize: '10px',
                  padding: '1px 6px',
                  background: 'rgba(245,158,11,0.15)',
                  color: 'var(--hero-badge)',
                  borderRadius: '4px',
                  fontWeight: '600',
                }}>Artist</span>
              )}
              <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                {timeAgo(comment.created_at)}
              </span>
            </div>
          </div>
          {user?.id === comment.user_id && (
            <button
              onClick={() => onDelete(comment.id)}
              style={{
                background: 'none', border: 'none',
                color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--error)';
                e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.background = 'none';
              }}
            >Delete</button>
          )}
        </div>

        {/* Content */}
        <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-primary)', marginBottom: '10px' }}>
          {comment.content}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <VoteButtons
            commentId={comment.id}
            upvotes={comment.upvotes}
            downvotes={comment.downvotes}
            userVote={comment.user_vote}
            size="sm"
          />
          {level === 0 && (
            <button
              onClick={() => setReplyOpen(o => !o)}
              style={{
                background: 'none', border: 'none',
                color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer',
                padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              {replies.length > 0 ? `${replies.length} repl${replies.length === 1 ? 'y' : 'ies'}` : 'Reply'}
            </button>
          )}
        </div>

        {/* Reply input */}
        {replyOpen && (
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              rows={2}
              style={{
                flex: 1,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 10px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                resize: 'vertical',
                outline: 'none',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
            />
            <button
              onClick={handleReply}
              disabled={submitting || !replyText.trim()}
              style={{
                alignSelf: 'flex-end',
                padding: '7px 14px',
                background: 'var(--accent)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: '600',
                opacity: submitting || !replyText.trim() ? 0.5 : 1,
                cursor: submitting || !replyText.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? '...' : 'Reply'}
            </button>
          </div>
        )}
      </div>

      {/* Replies */}
      {replies.map(reply => (
        <CommentItem
          key={reply.id}
          comment={reply}
          videoId={videoId}
          onDelete={onDelete}
          level={1}
        />
      ))}
    </div>
  );
}

export default function CommentSection({ videoId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getComments(videoId)
      .then(setComments)
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [videoId]);

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      const comment = await api.createComment({ content: text.trim(), video_id: videoId });
      setComments(c => [comment, ...c]);
      setText('');
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    await api.deleteComment(id);
    setComments(c => c.filter(cm => cm.id !== id && (cm.replies || []).every(r => r.id !== id)));
  };

  const totalCount = comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0);

  return (
    <section>
      <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>
        {totalCount} Comment{totalCount !== 1 ? 's' : ''}
      </h2>

      {/* Comment input */}
      {user ? (
        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent), #2563eb)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: '700', color: '#fff',
          }}>
            {user.username[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              style={{
                width: '100%',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                resize: 'vertical',
                outline: 'none',
                marginBottom: '8px',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', alignSelf: 'center' }}>
                {text.length}/2000
              </span>
              <button
                onClick={handleSubmit}
                disabled={submitting || !text.trim()}
                style={{
                  padding: '8px 20px',
                  background: 'var(--accent)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '600',
                  opacity: submitting || !text.trim() ? 0.5 : 1,
                  cursor: submitting || !text.trim() ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s, opacity 0.15s',
                }}
                onMouseEnter={e => {
                  if (!submitting && text.trim()) e.currentTarget.style.background = 'var(--accent-hover)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--accent)';
                }}
              >
                {submitting ? 'Posting...' : 'Post comment'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '14px',
        }}>
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: '600' }}>Sign in</Link>
          {' '}to join the conversation
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading comments...</div>
      ) : comments.length === 0 ? (
        <div style={{
          padding: '32px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>💬</div>
          <div style={{ fontSize: '14px' }}>No comments yet. Be the first!</div>
        </div>
      ) : (
        <div>
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              videoId={videoId}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
