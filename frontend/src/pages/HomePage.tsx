import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { IpSource } from '../types';
import SeriesCard from '../components/SeriesCard';
import VideoThumbnail from '../components/VideoThumbnail';

function formatViews(n: number = 0): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function HomePage() {
  const [series, setSeries] = useState<IpSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredIdx, setFeaturedIdx] = useState(0);

  useEffect(() => {
    api.getSeries()
      .then(setSeries)
      .catch(() => setSeries([]))
      .finally(() => setLoading(false));
  }, []);

  const featured = series[featuredIdx];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>◌</div>
          <div style={{ fontSize: '14px' }}>Loading GenTV...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Feature */}
      {featured && (
        <section style={{
          position: 'relative',
          minHeight: '520px',
          overflow: 'hidden',
          marginBottom: '64px',
        }}>
          {/* Background gradient */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(135deg, ${featured.gradient_from}22, ${featured.gradient_to}22)`,
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 30%, var(--bg-primary) 100%)',
          }} />

          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px 0', position: 'relative' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '48px', alignItems: 'center' }}>
              {/* Text content */}
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <span style={{
                    padding: '4px 10px',
                    background: `${featured.gradient_from}30`,
                    border: `1px solid ${featured.gradient_from}50`,
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: featured.gradient_from,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    {featured.type}
                  </span>
                  <span style={{
                    padding: '4px 10px',
                    background: 'rgba(245,158,11,0.15)',
                    border: '1px solid rgba(245,158,11,0.3)',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#f59e0b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Featured Hero Series
                  </span>
                </div>

                <h1 style={{
                  fontSize: '42px',
                  fontWeight: '800',
                  lineHeight: '1.1',
                  marginBottom: '16px',
                  letterSpacing: '-1px',
                }}>
                  {featured.title}
                </h1>

                <p style={{
                  fontSize: '15px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.7',
                  marginBottom: '24px',
                  maxWidth: '520px',
                }}>
                  {featured.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px', height: '28px',
                      background: `linear-gradient(135deg, ${featured.gradient_from}, ${featured.gradient_to})`,
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: '700', color: '#fff',
                    }}>
                      {featured.artist_username[0].toUpperCase()}
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      @{featured.artist_username}
                    </span>
                  </div>
                  <span style={{ color: 'var(--border)' }}>·</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {featured.total_videos} videos
                  </span>
                  <span style={{ color: 'var(--border)' }}>·</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {formatViews(featured.hero_view_count || 0)} views
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <Link
                    to={`/series/${featured.id}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '12px 24px',
                      background: `linear-gradient(135deg, ${featured.gradient_from}, ${featured.gradient_to})`,
                      borderRadius: 'var(--radius-md)',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: '700',
                      transition: 'opacity 0.15s, transform 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.opacity = '0.9';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M5.5 3.5l7 4.5-7 4.5V3.5z" />
                    </svg>
                    Watch Hero Series
                  </Link>
                  <Link
                    to={`/series/${featured.id}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '12px 24px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    Explore Derivatives
                  </Link>
                </div>
              </div>

              {/* Featured thumbnail */}
              {featured.hero_video_id && (
                <Link to={`/video/${featured.hero_video_id}`}>
                  <VideoThumbnail
                    gradientFrom={featured.gradient_from}
                    gradientTo={featured.gradient_to}
                    duration={featured.hero_video_duration}
                    isHero
                    title={featured.hero_video_title}
                    style={{
                      borderRadius: 'var(--radius-xl)',
                      aspectRatio: '16/9',
                      width: '100%',
                      border: '1px solid rgba(255,255,255,0.08)',
                      boxShadow: `0 24px 60px ${featured.gradient_from}30`,
                    }}
                  />
                </Link>
              )}
            </div>
          </div>

          {/* Series selector dots */}
          <div style={{
            position: 'relative', zIndex: 1,
            display: 'flex', justifyContent: 'center',
            gap: '8px',
            marginTop: '32px',
            padding: '0 24px 40px',
          }}>
            {series.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setFeaturedIdx(i)}
                title={s.title}
                style={{
                  width: i === featuredIdx ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: i === featuredIdx
                    ? `linear-gradient(135deg, ${s.gradient_from}, ${s.gradient_to})`
                    : 'var(--border)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'width 0.2s, background 0.2s',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* The 10 Hero Series */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 80px' }} id="series">
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '4px', height: '24px',
              background: 'linear-gradient(to bottom, var(--accent), #2563eb)',
              borderRadius: '2px',
            }} />
            <h2 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              The 10 Hero Series
            </h2>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginLeft: '16px' }}>
            10 original works of IP. 10 visionary GenAI artists. Unlimited creative derivatives.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '20px',
        }}>
          {series.map((s, i) => (
            <SeriesCard key={s.id} series={s} index={i} />
          ))}
        </div>
      </section>

      {/* Platform description */}
      <section style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '64px 24px',
        marginBottom: '80px',
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.5px' }}>
            Where GenAI Storytelling Lives
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '32px' }}>
            GenTV unites 10 world-class generative AI artists with a global community of creators.
            Each hero series unlocks an entire universe of derivative works — films, essays, music videos,
            and experimental pieces all rooted in the same original IP.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              { icon: '🎬', title: '10 Hero Series', desc: 'Original works by world-class GenAI artists' },
              { icon: '🌍', title: 'Global Derivatives', desc: 'Hundreds of community-made videos based on the same IP' },
              { icon: '🗳️', title: 'Community Voting', desc: 'Upvote, downvote, and comment to surface the best work' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{
                padding: '20px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
              }}>
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>{icon}</div>
                <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '6px' }}>{title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
