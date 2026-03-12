export interface User {
  id: number;
  username: string;
  email: string;
  is_artist: number;
  bio: string | null;
  avatar_url?: string | null;
  created_at?: string;
}

export interface IpSource {
  id: number;
  title: string;
  description: string;
  type: string;
  excerpt: string;
  artist_id: number;
  artist_username: string;
  artist_bio: string | null;
  gradient_from: string;
  gradient_to: string;
  total_videos: number;
  hero_video_id?: number;
  hero_video_title?: string;
  hero_video_duration?: string;
  hero_view_count?: number;
  total_upvotes?: number;
  created_at: string;
}

export interface Video {
  id: number;
  title: string;
  description: string | null;
  duration: string;
  video_url: string | null;
  view_count: number;
  is_hero: number;
  created_at: string;
  ip_source_id: number;
  series_title?: string;
  series_type?: string;
  series_excerpt?: string;
  gradient_from?: string;
  gradient_to?: string;
  series_artist_id?: number;
  user_id: number;
  username: string;
  user_bio?: string | null;
  is_artist?: number;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  user_vote: 'up' | 'down' | null;
}

export interface Comment {
  id: number;
  content: string;
  parent_id: number | null;
  created_at: string;
  user_id: number;
  username: string;
  is_artist: number;
  upvotes: number;
  downvotes: number;
  user_vote: 'up' | 'down' | null;
  replies?: Comment[];
}

export interface SeriesDetail extends IpSource {
  videos: Video[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}
