// Types de base pour l'application Podcast Manager

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface User {
  id: string;
  email: string;
  name: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  subscription_status: 'free' | 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired';
  created_at: Date;
  updated_at: Date;
}

export interface Episode {
  id: string;
  user_id: string;
  title: string;
  audio_file_url: string;
  description?: string | null;
  duration: number | null;
  status: 'draft' | 'uploaded' | 'transcribing' | 'transcribed' | 'optimizing' | 'optimized' | 'generating_content' | 'completed' | 'published' | 'failed' | 'error' | null;
  created_at: string | null;
  updated_at: string | null;
  error_message?: string | null;
  file_size?: number | null;
  highlights_timestamps?: string | null;
  s3_bucket?: string | null;
  s3_key?: string | null;
  timestamps?: string | null;
  video_url?: string | null;
}

export interface Transcription {
  id: string;
  episode_id: string;
  raw_text: string;
  cleaned_text?: string | null;
  formatted_text?: string | null;
  optimized_text?: string | null;
  processing_status?: string | null;
  timestamps: Json | null;
  blog_description?: string | null;
  spotify_description?: string | null;
  youtube_description?: string | null;
  social_drafts?: Json | null;
  type?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Timestamp {
  start: number;
  end: number;
  topic: string;
  description: string;
}

export interface SocialDraft {
  platform: 'twitter' | 'linkedin' | 'instagram';
  content: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduled_at?: Date;
  published_at?: Date;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  current_period_start: Date;
  current_period_end: Date;
  cancel_at_period_end: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types pour les formulaires
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface EpisodeFormData {
  title: string;
  description?: string;
  audioFile: File;
}

// Types pour les erreurs
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Types pour les notifications
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
