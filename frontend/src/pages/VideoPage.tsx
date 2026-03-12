import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Video } from '../types';
import VoteButtons from '../components/VoteButtons';
import CommentSection from '../components/CommentSection';
import VideoThumbnail from '../components/VideoThumbnail';

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [voteState, setVoteState] = useState<{ upvotes: number; downvotes: number; userVote: 'up' | 'down' | null } | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getVideo(Number(id))
      .then(v => {
        setVideo(v);
        setVoteState({ upvotes: v.upvotes, downvotes: v.downvotes, userVote: v.user_vote });
      })
      .catch(() => setVideo(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading video...</div>
      </div>
    );
  }

  if (!video) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>Video not found</h1>
        <Link to="/" style={{ color: 'var(--accent)' }}>Back to home</Link>
      </div>
    );
  }

  const gradFrom = video.gradient_from || '#7c3aed';
  const gradTo = video.gradient_to || '#2563eb';

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '32px 24px 80px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
        <Link to="/" style={{ color: 'var(--text-muted)', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          Home
        </Link>
        <span>/</span>
        {video.ip_source_id && (
          <>
            <Link to={`/series/${video.ip_source_id}`} style={{ color: 'var(--text-muted)', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              {video.series_title}
            </Link>
            <span>/</span>
          </>
        )}
        <span style={{ color: 'var(--text-secondary)' }}>{video.title}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
        {/* Main content */}
        <div>
          {/* Video player */}
          {video.video_url ? (
            <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: '24px', aspectRatio: '16/9' }}>
              <iframe
                src={video.video_url}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: '24px' }}>
              <VideoThumbnail
                gradientFrom={gradFrom}
                gradientTo={gradTo}
                duration={video.duration}
                isHero={Boolean(video.is_hero)}
                style={{ aspectRatio: '16/9', width: '100%' }}
              />
            </div>
          )}

          {/* Video info */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '12px' }}>
              <div>
                {video.is_hero === 1 && (
                  <span style={{
                    display: 'inline-block',
                    marginBottom: '8px',
                    padding: '3px 10px',
                    background: 'rgba(245,158,11,0.15)',
                    border: '1px solid rgba(245,158,11,0.3)',
                    borderRadius: '4px',
                    fontSize: '11px', fontWeight: '700',
                    color: '#f59e0b',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                  }}>
                    Hero Film
                  </span>
                )}
                <h1 style={{ fontSize: '22px', fontWeight: '800', lineHeight: '1.2', letterSpacing: '-0.3px' }}>
                  {video.title}
                </h1>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <span>{formatViews(video.view_count)} views</span>
              <span style={{ color: 'var(--border)' }}>·</span>
              <span>{formatDate(video.created_at)}</span>
              <span style={{ color: 'var(--border)' }}>·</span>
              <span>{video.duration}</span>
            </div>

            {/* Vote row */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 0',
              borderTop: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <VoteButtons
                  videoId={video.id}
                  upvotes={voteState?.upvotes ?? video.upvotes}
                  downvotes={voteState?.downvotes ?? video.downvotes}
                  userVote={voteState?.userVote ?? video.user_vote}
                  size="lg"
                />
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {video.comment_count} comments
                </span>
              </div>

              {/* Creator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px', height: '32px',
                  background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: '700', color: '#fff',
                }}>
                  {video.username[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>@{video.username}</div>
                  {video.is_artist === 1 && (
                    <div style={{ fontSize: '11px', color: '#f59e0b' }}>Hero Artist</div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {video.description && (
              <div style={{
                padding: '16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: '1.7',
                marginBottom: '24px',
              }}>
                {video.description}
              </div>
            )}
          </div>

          {/* Comments */}
          <CommentSection videoId={video.id} />
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: '88px' }}>
          {/* Series info */}
          {video.ip_source_id && (
            <div style={{
              background: 'var(--bg-card)',
              border: `1px solid ${gradFrom}25`,
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              marginBottom: '20px',
            }}>
              {/* Gradient header */}
              <div style={{
                height: '60px',
                background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
                backgroundSize: '200% 200%',
                animation: 'gradientShift 10s ease infinite',
              }} />
              <div style={{ padding: '16px' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Part of series
                </div>
                <Link to={`/series/${video.ip_source_id}`} style={{ display: 'block' }}>
                  <h3 style={{
                    fontSize: '15px', fontWeight: '700', marginBottom: '8px', lineHeight: '1.3',
                    transition: 'color 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  >
                    {video.series_title}
                  </h3>
                </Link>
                {video.series_type && (
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    background: `${gradFrom}20`,
                    borderRadius: '4px',
                    fontSize: '11px', fontWeight: '600',
                    color: gradFrom,
                    marginBottom: '12px',
                  }}>
                    {video.series_type}
                  </span>
                )}
                {video.series_excerpt && (
                  <blockquote style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    lineHeight: '1.7',
                    borderLeft: `2px solid ${gradFrom}40`,
                    paddingLeft: '10px',
                    fontStyle: 'italic',
                    margin: '0 0 14px',
                    display: '-webkit-box',
                    WebkitLineClamp: 5,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {video.series_excerpt}
                  </blockquote>
                )}
                <Link
                  to={`/series/${video.ip_source_id}`}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '8px',
                    background: `${gradFrom}15`,
                    border: `1px solid ${gradFrom}30`,
                    borderRadius: 'var(--radius-sm)',
                    color: gradFrom,
                    fontSize: '12px', fontWeight: '600',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = `${gradFrom}25`}
                  onMouseLeave={e => e.currentTarget.style.background = `${gradFrom}15`}
                >
                  View All Videos →
                </Link>
              </div>
            </div>
          )}

          {/* Upload CTA */}
          <div style={{
            padding: '16px',
            background: 'var(--accent-light)',
            border: '1px solid var(--accent-border)',
            borderRadius: 'var(--radius-md)',
          }}>
            <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
              Create a derivative
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: '1.5' }}>
              Inspired by this series? Upload your own GenAI interpretation.
            </div>
            <Link
              to="/upload"
              style={{
                display: 'block', textAlign: 'center',
                padding: '8px',
                background: 'var(--accent)',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
                fontSize: '12px', fontWeight: '600',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
            >
              Upload Derivative
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
