import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IpSource } from '../types';

interface SeriesCardProps {
  series: IpSource;
  index: number;
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function SeriesCard({ series, index }: SeriesCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={`/series/${series.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: 'var(--bg-card)',
        border: `1px solid ${hovered ? 'rgba(139, 92, 246, 0.3)' : 'var(--border)'}`,
        transition: 'all 0.25s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? `0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(139, 92, 246, 0.2)` : 'none',
      }}
    >
      {/* Gradient header */}
      <div style={{
        height: '140px',
        background: `linear-gradient(135deg, ${series.gradient_from}, ${series.gradient_to})`,
        backgroundSize: '200% 200%',
        animation: hovered ? 'gradientShift 4s ease infinite' : 'gradientShift 10s ease infinite',
        position: 'relative',
        display: 'flex', alignItems: 'flex-end',
        padding: '16px',
      }}>
        {/* Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 20% 40%, rgba(255,255,255,0.08) 0%, transparent 65%)',
        }} />

        {/* Series number */}
        <div style={{
          position: 'absolute', top: '16px', left: '16px',
          width: '28px', height: '28px',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
          borderRadius: '6px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.9)',
        }}>
          {index + 1}
        </div>

        {/* Type badge */}
        <div style={{
          position: 'absolute', top: '16px', right: '16px',
          padding: '3px 8px',
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(8px)',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: '600',
          color: 'rgba(255,255,255,0.85)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {series.type}
        </div>

        {/* Hero badge */}
        <div style={{
          padding: '3px 10px',
          background: 'rgba(245,158,11,0.9)',
          backdropFilter: 'blur(8px)',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: '700',
          color: '#fff',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Hero Series
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        <h3 style={{
          fontSize: '15px',
          fontWeight: '700',
          marginBottom: '6px',
          lineHeight: '1.3',
          color: hovered ? '#fff' : 'var(--text-primary)',
          transition: 'color 0.2s',
        }}>
          {series.title}
        </h3>
        <p style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          marginBottom: '12px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: '1.5',
        }}>
          {series.description}
        </p>

        {/* Artist */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          marginBottom: '12px',
        }}>
          <div style={{
            width: '20px', height: '20px',
            background: `linear-gradient(135deg, ${series.gradient_from}, ${series.gradient_to})`,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '9px', fontWeight: '700', color: '#fff',
          }}>
            {series.artist_username[0].toUpperCase()}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
            @{series.artist_username}
          </span>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: '12px',
          fontSize: '11px', color: 'var(--text-muted)',
          paddingTop: '12px',
          borderTop: '1px solid var(--border)',
        }}>
          <span>{series.total_videos} videos</span>
          {series.hero_view_count !== undefined && (
            <span>{formatViews(series.hero_view_count)} views</span>
          )}
          {series.total_upvotes !== undefined && (
            <span style={{ color: 'var(--success)', opacity: 0.8 }}>
              {series.total_upvotes} upvotes
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
