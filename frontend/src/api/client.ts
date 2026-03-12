const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('gentv_token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers as Record<string, string> || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data as T;
}

export const api = {
  // Auth
  register: (username: string, email: string, password: string) =>
    request<{ token: string; user: import('../types').User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ token: string; user: import('../types').User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<import('../types').User>('/auth/me'),

  // Series
  getSeries: () => request<import('../types').IpSource[]>('/series'),
  getSeriesById: (id: number) => request<import('../types').SeriesDetail>(`/series/${id}`),

  // Videos
  getVideos: (params?: { series?: number; hero?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.series) qs.set('series', String(params.series));
    if (params?.hero) qs.set('hero', 'true');
    return request<import('../types').Video[]>(`/videos${qs.toString() ? `?${qs}` : ''}`);
  },
  getVideo: (id: number) => request<import('../types').Video>(`/videos/${id}`),
  createVideo: (data: { title: string; description?: string; video_url?: string; duration?: string; ip_source_id: number }) =>
    request<import('../types').Video>('/videos', { method: 'POST', body: JSON.stringify(data) }),

  // Comments
  getComments: (videoId: number) => request<import('../types').Comment[]>(`/comments?videoId=${videoId}`),
  createComment: (data: { content: string; video_id: number; parent_id?: number | null }) =>
    request<import('../types').Comment>('/comments', { method: 'POST', body: JSON.stringify(data) }),
  deleteComment: (id: number) =>
    fetch(`${BASE}/comments/${id}`, { method: 'DELETE', headers: { ...authHeaders() } }),

  // Votes
  vote: (data: { video_id?: number; comment_id?: number; vote_type: 'up' | 'down' }) =>
    request<{ user_vote: 'up' | 'down' | null; upvotes: number; downvotes: number }>('/votes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
