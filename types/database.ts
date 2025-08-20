export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          subscription_tier: 'free' | 'pro' | 'enterprise'
          subscription_status: 'active' | 'inactive' | 'cancelled'
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          subscription_status?: 'active' | 'inactive' | 'cancelled'
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          subscription_status?: 'active' | 'inactive' | 'cancelled'
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      social_connections: {
        Row: {
          id: string
          user_id: string
          platform: 'twitter' | 'linkedin'
          access_token: string
          refresh_token: string | null
          token_expires_at: string | null
          platform_user_id: string
          platform_username: string
          is_active: boolean
          permissions: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: 'twitter' | 'linkedin'
          access_token: string
          refresh_token?: string | null
          token_expires_at?: string | null
          platform_user_id: string
          platform_username: string
          is_active?: boolean
          permissions?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: 'twitter' | 'linkedin'
          access_token?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          platform_user_id?: string
          platform_username?: string
          is_active?: boolean
          permissions?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      episodes: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          audio_file_url: string
          duration: number | null
          file_size: number | null
          status: 'draft' | 'processing' | 'published' | 'failed'
          error_message: string | null
          timestamps: string | null
          video_url: string | null
          s3_key: string | null
          s3_bucket: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          audio_file_url: string
          duration?: number | null
          file_size?: number | null
          status?: 'draft' | 'processing' | 'published' | 'failed'
          error_message?: string | null
          timestamps?: string | null
          video_url?: string | null
          s3_key?: string | null
          s3_bucket?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          audio_file_url?: string
          duration?: number | null
          file_size?: number | null
          status?: 'draft' | 'processing' | 'published' | 'failed'
          error_message?: string | null
          timestamps?: string | null
          video_url?: string | null
          s3_key?: string | null
          s3_bucket?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transcriptions: {
        Row: {
          id: string
          episode_id: string
          raw_text: string
          cleaned_text: string | null
          timestamps: Json | null
          type: 'raw' | 'enhanced'
          blog_description: string | null
          spotify_description: string | null
          youtube_description: string | null
          social_drafts: Json | null
          processing_status: 'pending' | 'processing' | 'completed' | 'error'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          episode_id: string
          raw_text: string
          cleaned_text?: string | null
          timestamps?: Json | null
          type?: 'raw' | 'enhanced'
          blog_description?: string | null
          spotify_description?: string | null
          youtube_description?: string | null
          social_drafts?: Json | null
          processing_status?: 'pending' | 'processing' | 'completed' | 'error'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          episode_id?: string
          raw_text?: string
          cleaned_text?: string | null
          timestamps?: Json | null
          type?: 'raw' | 'enhanced'
          blog_description?: string | null
          spotify_description?: string | null
          youtube_description?: string | null
          social_drafts?: Json | null
          processing_status?: 'pending' | 'processing' | 'completed' | 'error'
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string
          stripe_price_id: string
          status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
          current_period_start: string
          current_period_end: string
          trial_start: string | null
          trial_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id: string
          stripe_price_id: string
          status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
          current_period_start: string
          current_period_end: string
          trial_start?: string | null
          trial_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string
          stripe_price_id?: string
          status?: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
          current_period_start?: string
          current_period_end?: string
          trial_start?: string | null
          trial_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      scheduled_tweets: {
        Row: {
          id: string
          user_id: string
          content: string
          scheduled_date: string
          scheduled_time: string
          status: 'pending' | 'published' | 'cancelled'
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          scheduled_date: string
          scheduled_time: string
          status?: 'pending' | 'published' | 'cancelled'
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          scheduled_date?: string
          scheduled_time?: string
          status?: 'pending' | 'published' | 'cancelled'
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Types utilitaires
export type User = Database['public']['Tables']['users']['Row']
export type SocialConnection = Database['public']['Tables']['social_connections']['Row']
export type Episode = Database['public']['Tables']['episodes']['Row']
export type Transcription = Database['public']['Tables']['transcriptions']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type ScheduledTweet = Database['public']['Tables']['scheduled_tweets']['Row']

export type UserInsert = Database['public']['Tables']['users']['Insert']
export type SocialConnectionInsert = Database['public']['Tables']['social_connections']['Insert']
export type EpisodeInsert = Database['public']['Tables']['episodes']['Insert']
export type TranscriptionInsert = Database['public']['Tables']['transcriptions']['Insert']
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']
export type ScheduledTweetInsert = Database['public']['Tables']['scheduled_tweets']['Insert']

export type UserUpdate = Database['public']['Tables']['users']['Update']
export type SocialConnectionUpdate = Database['public']['Tables']['social_connections']['Update']
export type EpisodeUpdate = Database['public']['Tables']['episodes']['Update']
export type TranscriptionUpdate = Database['public']['Tables']['transcriptions']['Update']
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']
export type ScheduledTweetUpdate = Database['public']['Tables']['scheduled_tweets']['Update']
