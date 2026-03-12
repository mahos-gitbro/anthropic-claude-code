import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { SeriesDetail, Video } from '../types';
import VideoCard from '../components/VideoCard';
import VideoThumbnail from '../components/VideoThumbnail';
import VoteButtons from '../components/VoteButtons';

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function SeriesPage() {
  const { id } = useParams<{ id: string }>();
  const [series, setSeries] = useState<SeriesDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'derivatives'>('all');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getSeriesById(Number(id))
      .then(setSeries)
      .catch(() => setSeries(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading series...</div>
      </div>
    );
  }

  if (!series) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>Series not found</h1>
        <Link to="/" style={{ color: 'var(--accent)' }}>Back to home</Link>
      </div>
    );
  }

  const heroVideo = series.videos.find(v => v.is_hero === 1);
  const derivatives = series.videos.filter(v => v.is_hero === 0);
  const displayVideos = tab === 'all' ? series.videos : derivatives;

  return (
    <div>
      {/* Series hero banner */}
      <div style={{
        position: 'relative',
        background: `linear-gradient(135deg, ${series.gradient_from}18, ${series.gradient_to}18)`,
        borderBottom: '1px solid var(--border)',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 0% 50%, ${series.gradient_from}15 0%, transparent 60%)`,
        }} />
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <Link to="/" style={{ color: 'var(--text-muted)', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              Home
            </Link>
            <span>/</span>
            <span style={{ color: 'var(--text-secondary)' }}>Series</span>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{series.title}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '48px', alignItems: 'start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{
                  padding: '4px 10px',
                  background: `${series.gradient_from}25`,
                  border: `1px solid ${series.gradient_from}40`,
                  borderRadius: '6px',
                  fontSize: '11px', fontWeight: '700',
                  color: series.gradient_from,
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>{series.type}</span>
                <span style={{
                  padding: '4px 10px',
                  background: 'rgba(245,158,11,0.12)',
                  border: '1px solid rgba(245,158,11,0.25)',
                  borderRadius: '6px',
                  fontSize: '11px', fontWeight: '700',
                  color: '#f59e0b',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>Hero Series</span>
              </div>

              <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.5px', lineHeight: '1.1' }}>
                {series.title}
              </h1>

              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.7', maxWidth: '600px', marginBottom: '24px' }}>
                {series.description}
              </p>

              {/* Artist info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{
                  width: '40px', height: '40px',
                  background: `linear-gradient(135deg, ${series.gradient_from}, ${series.gradient_to})`,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', fontWeight: '700', color: '#fff',
                }}>
                  {series.artist_username[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>@{series.artist_username}</div>
                  {series.artist_bio && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{series.artist_bio}</div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <span>{series.total_videos} videos total</span>
                <span style={{ color: 'var(--border)' }}>·</span>
                <span>{derivatives.length} derivatives</span>
              </div>
            </div>

            {/* IP Source excerpt */}
            <div style={{
              width: '340px',
              background: 'var(--bg-card)',
              border: `1px solid ${series.gradient_from}30`,
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              flexShrink: 0,
            }}>
              <div style={{
                fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px',
                color: series.gradient_from,
                marginBottom: '12px',
              }}>
                Source IP — {series.type}
              </div>
              <blockquote style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: '1.8',
                borderLeft: `3px solid ${series.gradient_from}50`,
                paddingLeft: '12px',
                fontStyle: 'italic',
                margin: 0,
                whiteSpace: 'pre-wrap',
              }}>
                {series.excerpt}
              </blockquote>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Hero video spotlight */}
        {heroVideo && (
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#f59e0b' }}>★</span> Hero Film
            </h2>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px',
              background: 'var(--bg-card)',
              border: `1px solid ${series.gradient_from}25`,
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
            }}>
              <Link to={`/video/${heroVideo.id}`}>
                <VideoThumbnail
                  gradientFrom={series.gradient_from}
                  gradientTo={series.gradient_to}
                  duration={heroVideo.duration}
                  isHero
                  style={{ height: '260px' }}
                />
              </Link>
              <div style={{ padding: '28px 28px 28px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Link to={`/video/${heroVideo.id}`} style={{ display: 'block', marginBottom: '12px' }}>
                  <h3 style={{
                    fontSize: '18px', fontWeight: '700', lineHeight: '1.3',
                    transition: 'color 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  >
                    {heroVideo.title}
                  </h3>
                </Link>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
                  {heroVideo.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>{formatViews(heroVideo.view_count)} views</span>
                  <span>{heroVideo.comment_count} comments</span>
                </div>
                <VoteButtons
                  videoId={heroVideo.id}
                  upvotes={heroVideo.upvotes}
                  downvotes={heroVideo.downvotes}
                  userVote={heroVideo.user_vote}
                  size="md"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-card)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            {(['all', 'derivatives'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '6px 16px',
                  background: tab === t ? 'var(--bg-elevated)' : 'none',
                  border: 'none',
                  borderRadius: '6px',
                  color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: '13px',
                  fontWeight: tab === t ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {t === 'all' ? `All (${series.videos.length})` : `Derivatives (${derivatives.length})`}
              </button>
            ))}
          </div>

          <Link
            to="/upload"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px',
              background: 'var(--accent-light)',
              border: '1px solid var(--accent-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--accent)',
              fontSize: '13px', fontWeight: '600',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-light)'}
          >
            + Upload Derivative
          </Link>
        </div>

        {/* Videos grid */}
        {displayVideos.length === 0 ? (
          <div style={{
            padding: '48px', textAlign: 'center',
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
            color: 'var(--text-muted)', fontSize: '14px',
          }}>
            No derivatives yet. Be the first to create one!
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
          }}>
            {displayVideos.map((v: Video) => (
              <VideoCard key={v.id} video={{ ...v, gradient_from: series.gradient_from, gradient_to: series.gradient_to }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
