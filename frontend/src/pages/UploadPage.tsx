import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import { IpSource } from '../types';

export default function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [series, setSeries] = useState<IpSource[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    video_url: '',
    duration: '',
    ip_source_id: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getSeries().then(setSeries).catch(() => setSeries([]));
  }, []);

  if (!user) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '400px',
          padding: '40px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>
            Sign in to upload
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            You need to be logged in to upload derivative content.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/login" style={btnSecondary}>Sign in</Link>
            <Link to="/register" style={btnPrimary}>Join GenTV</Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedSeries = series.find(s => String(s.id) === form.ip_source_id);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.ip_source_id) {
      setError('Please select a hero series');
      return;
    }
    setLoading(true);
    try {
      const video = await api.createVideo({
        title: form.title,
        description: form.description || undefined,
        video_url: form.video_url || undefined,
        duration: form.duration || undefined,
        ip_source_id: Number(form.ip_source_id),
      });
      navigate(`/video/${video.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '720px', margin: '0 auto', padding: '40px 24px 80px',
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px' }}>
          Upload Derivative
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Share your generative AI interpretation of one of the 10 Hero Series
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Series selection */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>
            Hero Series <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Select the original IP your work is derived from
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {series.map(s => {
              const selected = form.ip_source_id === String(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, ip_source_id: String(s.id) }))}
                  style={{
                    textAlign: 'left',
                    padding: '12px 14px',
                    background: selected ? `${s.gradient_from}15` : 'var(--bg-card)',
                    border: `1px solid ${selected ? s.gradient_from : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: '10px',
                  }}
                >
                  <div style={{
                    width: '32px', height: '32px', flexShrink: 0,
                    background: `linear-gradient(135deg, ${s.gradient_from}, ${s.gradient_to})`,
                    borderRadius: '6px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: '700', color: '#fff',
                  }}>
                    {s.id}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '12px', fontWeight: '600',
                      color: selected ? s.gradient_from : 'var(--text-primary)',
                      marginBottom: '2px',
                      lineHeight: '1.3',
                    }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{s.type}</div>
                  </div>
                  {selected && (
                    <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="16" height="16" viewBox="0 0 16 16" fill={s.gradient_from}>
                      <path d="M13 4L6 11 3 8" stroke={s.gradient_from} strokeWidth="2" fill="none" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Source IP excerpt preview */}
        {selectedSeries && (
          <div style={{
            padding: '14px 16px',
            background: `${selectedSeries.gradient_from}08`,
            border: `1px solid ${selectedSeries.gradient_from}25`,
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
          }}>
            <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: selectedSeries.gradient_from, marginBottom: '8px' }}>
              Source IP Excerpt
            </div>
            <blockquote style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              lineHeight: '1.7',
              borderLeft: `2px solid ${selectedSeries.gradient_from}50`,
              paddingLeft: '10px',
              fontStyle: 'italic',
              margin: 0,
              whiteSpace: 'pre-wrap',
            }}>
              {selectedSeries.excerpt}
            </blockquote>
          </div>
        )}

        {/* Title */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>
            Title <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Give your work a compelling title"
            required
            maxLength={200}
            style={inputStyle}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Describe your creative interpretation and process..."
            rows={4}
            maxLength={2000}
            style={{ ...inputStyle, resize: 'vertical' }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Video URL */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Video URL</label>
          <input
            type="url"
            value={form.video_url}
            onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
            placeholder="https://www.youtube.com/embed/... or leave blank"
            style={inputStyle}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
          />
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Use a YouTube embed URL (youtube.com/embed/ID). Leave blank to use a gradient placeholder.
          </div>
        </div>

        {/* Duration */}
        <div style={{ marginBottom: '28px' }}>
          <label style={labelStyle}>Duration</label>
          <input
            type="text"
            value={form.duration}
            onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
            placeholder="e.g. 5:30"
            pattern="\d+:\d{2}"
            style={{ ...inputStyle, maxWidth: '160px' }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
          />
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--error)',
            fontSize: '13px',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            disabled={loading || !form.title || !form.ip_source_id}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #8b5cf6, #2563eb)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: '#fff',
              fontSize: '14px', fontWeight: '700',
              cursor: loading || !form.title || !form.ip_source_id ? 'not-allowed' : 'pointer',
              opacity: loading || !form.title || !form.ip_source_id ? 0.5 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'Uploading...' : 'Publish'}
          </button>
          <Link to="/" style={{ ...btnSecondary, display: 'flex', alignItems: 'center' }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-primary)',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.15s',
};

const btnPrimary: React.CSSProperties = {
  padding: '10px 20px',
  background: 'var(--accent)',
  borderRadius: 'var(--radius-sm)',
  color: '#fff',
  fontSize: '14px', fontWeight: '600',
};

const btnSecondary: React.CSSProperties = {
  padding: '10px 20px',
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-primary)',
  fontSize: '14px', fontWeight: '500',
};
