import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Video } from '../types';
import VideoThumbnail from './VideoThumbnail';

interface VideoCardProps {
  video: Video;
  showSeries?: boolean;
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export default function VideoCard({ video, showSeries = false }: VideoCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={`/video/${video.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        background: 'var(--bg-card)',
        border: `1px solid ${hovered ? 'var(--border-hover)' : 'var(--border)'}`,
        transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      {/* Thumbnail */}
      <VideoThumbnail
        gradientFrom={video.gradient_from || '#7c3aed'}
        gradientTo={video.gradient_to || '#2563eb'}
        duration={video.duration}
        isHero={Boolean(video.is_hero)}
        style={{ aspectRatio: '16/9', width: '100%' }}
      />

      {/* Info */}
      <div style={{ padding: '12px 14px 14px' }}>
        {showSeries && video.series_title && (
          <div style={{
            fontSize: '11px',
            color: 'var(--accent)',
            fontWeight: '500',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            {video.series_title}
          </div>
        )}
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          lineHeight: '1.35',
          marginBottom: '8px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {video.title}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: '12px', color: 'var(--text-muted)',
        }}>
          <span>@{video.username}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" style={{ color: 'var(--success)', opacity: 0.8 }}>
                <path d="M8 2l1.8 5.4H16l-4.9 3.6 1.8 5.4L8 13l-4.9 3.4 1.8-5.4L0 7.4h6.2z" />
              </svg>
              {video.upvotes}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 2l12 12M2 14l12-12" strokeLinecap="round" />
              </svg>
              {video.downvotes}
            </span>
            <span>{formatViews(video.view_count)} views</span>
            <span>{timeAgo(video.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
