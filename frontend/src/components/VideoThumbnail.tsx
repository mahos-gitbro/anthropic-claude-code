interface VideoThumbnailProps {
  gradientFrom: string;
  gradientTo: string;
  duration?: string;
  isHero?: boolean;
  title?: string;
  style?: React.CSSProperties;
}

export default function VideoThumbnail({ gradientFrom, gradientTo, duration, isHero, title, style }: VideoThumbnailProps) {
  return (
    <div style={{
      position: 'relative',
      background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
      backgroundSize: '200% 200%',
      animation: 'gradientShift 8s ease infinite',
      overflow: 'hidden',
      ...style,
    }}>
      {/* Overlay pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.06) 0%, transparent 70%)',
      }} />

      {/* Play icon */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: '44px', height: '44px',
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
            <path d="M5.5 3.5l7 4.5-7 4.5V3.5z" />
          </svg>
        </div>
      </div>

      {/* Badges */}
      <div style={{
        position: 'absolute', top: '8px', left: '8px',
        display: 'flex', gap: '6px',
      }}>
        {isHero && (
          <span style={{
            padding: '2px 8px',
            background: 'rgba(245, 158, 11, 0.9)',
            backdropFilter: 'blur(8px)',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '700',
            color: '#fff',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}>
            Hero
          </span>
        )}
      </div>

      {/* Duration */}
      {duration && (
        <div style={{
          position: 'absolute', bottom: '8px', right: '8px',
          padding: '2px 6px',
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: '600',
          color: '#fff',
        }}>
          {duration}
        </div>
      )}

      {/* Title overlay for hero */}
      {isHero && title && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '32px 16px 12px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
        }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '500',
            color: 'rgba(255,255,255,0.9)',
            lineHeight: '1.3',
          }}>
            {title}
          </div>
        </div>
      )}
    </div>
  );
}
