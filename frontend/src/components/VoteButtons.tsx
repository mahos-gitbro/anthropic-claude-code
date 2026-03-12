import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';

interface VoteButtonsProps {
  videoId?: number;
  commentId?: number;
  upvotes: number;
  downvotes: number;
  userVote: 'up' | 'down' | null;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
}

export default function VoteButtons({
  videoId, commentId, upvotes: initialUp, downvotes: initialDown, userVote: initialVote,
  size = 'md', orientation = 'horizontal',
}: VoteButtonsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upvotes, setUpvotes] = useState(initialUp);
  const [downvotes, setDownvotes] = useState(initialDown);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(initialVote);
  const [loading, setLoading] = useState(false);

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
  const fontSize = size === 'sm' ? '12px' : size === 'lg' ? '15px' : '13px';
  const padding = size === 'sm' ? '4px 10px' : size === 'lg' ? '9px 18px' : '6px 14px';
  const gap = size === 'sm' ? '4px' : '6px';

  const handleVote = async (type: 'up' | 'down') => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const result = await api.vote({
        video_id: videoId,
        comment_id: commentId,
        vote_type: type,
      });
      setUpvotes(result.upvotes);
      setDownvotes(result.downvotes);
      setUserVote(result.user_vote);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: orientation === 'vertical' ? 'column' : 'row',
      alignItems: 'center',
      gap: orientation === 'vertical' ? '6px' : '8px',
    }}>
      {/* Upvote */}
      <button
        onClick={() => handleVote('up')}
        disabled={loading}
        title={user ? 'Upvote' : 'Sign in to vote'}
        style={{
          display: 'flex', alignItems: 'center', gap,
          padding,
          background: userVote === 'up' ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-elevated)',
          border: `1px solid ${userVote === 'up' ? 'rgba(34, 197, 94, 0.4)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)',
          color: userVote === 'up' ? 'var(--success)' : 'var(--text-secondary)',
          fontSize,
          fontWeight: '500',
          cursor: loading ? 'wait' : 'pointer',
          transition: 'all 0.15s',
          opacity: loading ? 0.7 : 1,
        }}
        onMouseEnter={e => {
          if (!loading && userVote !== 'up') {
            e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.3)';
            e.currentTarget.style.color = 'var(--success)';
          }
        }}
        onMouseLeave={e => {
          if (!loading && userVote !== 'up') {
            e.currentTarget.style.background = 'var(--bg-elevated)';
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }
        }}
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 2L14 12H2L8 2Z" />
        </svg>
        <span>{upvotes}</span>
      </button>

      {/* Downvote */}
      <button
        onClick={() => handleVote('down')}
        disabled={loading}
        title={user ? 'Downvote' : 'Sign in to vote'}
        style={{
          display: 'flex', alignItems: 'center', gap,
          padding,
          background: userVote === 'down' ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-elevated)',
          border: `1px solid ${userVote === 'down' ? 'rgba(239, 68, 68, 0.4)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)',
          color: userVote === 'down' ? 'var(--error)' : 'var(--text-secondary)',
          fontSize,
          fontWeight: '500',
          cursor: loading ? 'wait' : 'pointer',
          transition: 'all 0.15s',
          opacity: loading ? 0.7 : 1,
        }}
        onMouseEnter={e => {
          if (!loading && userVote !== 'down') {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            e.currentTarget.style.color = 'var(--error)';
          }
        }}
        onMouseLeave={e => {
          if (!loading && userVote !== 'down') {
            e.currentTarget.style.background = 'var(--bg-elevated)';
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }
        }}
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 14L2 4H14L8 14Z" />
        </svg>
        <span>{downvotes}</span>
      </button>
    </div>
  );
}
