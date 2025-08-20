// Types de base pour l'application Podcast Manager

export interface User {
  id: string;
  email: string;
  name: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface Episode {
  id: string;
  user_id: string;
  title: string;
  audio_file_url: string;
  duration: number;
  status: 'uploading' | 'transcribing' | 'processing' | 'completed' | 'error';
  created_at: Date;
  updated_at: Date;
}

export interface Transcription {
  id: string;
  episode_id: string;
  raw_text: string;
  cleaned_text: string;
  timestamps: Timestamp[];
  blog_description: string;
  spotify_description: string;
  youtube_description: string;
  social_drafts: SocialDraft[];
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
