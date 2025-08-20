-- Migration pour créer la table scheduled_tweets
-- À exécuter dans l'éditeur SQL de Supabase

-- Créer la table scheduled_tweets
CREATE TABLE IF NOT EXISTS public.scheduled_tweets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) <= 280),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'cancelled')),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index sur user_id pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_scheduled_tweets_user_id ON public.scheduled_tweets(user_id);

-- Créer un index sur scheduled_date et scheduled_time pour la planification
CREATE INDEX IF NOT EXISTS idx_scheduled_tweets_scheduled_datetime ON public.scheduled_tweets(scheduled_date, scheduled_time);

-- Créer un index sur le statut pour filtrer facilement
CREATE INDEX IF NOT EXISTS idx_scheduled_tweets_status ON public.scheduled_tweets(status);

-- Créer un index sur created_at pour l'ordre chronologique
CREATE INDEX IF NOT EXISTS idx_scheduled_tweets_created_at ON public.scheduled_tweets(created_at DESC);

-- Activer RLS (Row Level Security)
ALTER TABLE public.scheduled_tweets ENABLE ROW LEVEL SECURITY;

-- Créer une politique pour que les utilisateurs ne puissent voir que leurs propres tweets
CREATE POLICY "Users can view their own scheduled tweets" ON public.scheduled_tweets
    FOR SELECT USING (auth.uid() = user_id);

-- Créer une politique pour que les utilisateurs puissent insérer leurs propres tweets
CREATE POLICY "Users can insert their own scheduled tweets" ON public.scheduled_tweets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Créer une politique pour que les utilisateurs puissent mettre à jour leurs propres tweets
CREATE POLICY "Users can update their own scheduled tweets" ON public.scheduled_tweets
    FOR UPDATE USING (auth.uid() = user_id);

-- Créer une politique pour que les utilisateurs puissent supprimer leurs propres tweets
CREATE POLICY "Users can delete their own scheduled tweets" ON public.scheduled_tweets
    FOR DELETE USING (auth.uid() = user_id);

-- Créer une fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer un trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_scheduled_tweets_updated_at 
    BEFORE UPDATE ON public.scheduled_tweets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Commentaires sur la table
COMMENT ON TABLE public.scheduled_tweets IS 'Table pour stocker les tweets planifiés des utilisateurs';
COMMENT ON COLUMN public.scheduled_tweets.content IS 'Contenu du tweet (max 280 caractères)';
COMMENT ON COLUMN public.scheduled_tweets.scheduled_date IS 'Date de publication planifiée';
COMMENT ON COLUMN public.scheduled_tweets.scheduled_time IS 'Heure de publication planifiée';
COMMENT ON COLUMN public.scheduled_tweets.status IS 'Statut du tweet: pending, published, ou cancelled';
COMMENT ON COLUMN public.scheduled_tweets.published_at IS 'Timestamp de publication effective (si publié)';

-- Migration pour ajouter les colonnes manquantes à la table scheduled_tweets
-- Ajout de episode_id et metadata pour supporter la planification par épisode

-- Ajouter la colonne episode_id
ALTER TABLE scheduled_tweets 
ADD COLUMN IF NOT EXISTS episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE;

-- Ajouter la colonne metadata (JSONB pour stocker les informations supplémentaires)
ALTER TABLE scheduled_tweets 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Ajouter un index sur episode_id pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_scheduled_tweets_episode_id 
ON scheduled_tweets(episode_id);

-- Ajouter un index sur metadata pour les requêtes JSON
CREATE INDEX IF NOT EXISTS idx_scheduled_tweets_metadata 
ON scheduled_tweets USING GIN (metadata);

-- Mettre à jour les types dans l'enum status pour inclure 'failed'
ALTER TYPE scheduled_tweet_status RENAME TO scheduled_tweet_status_old;

CREATE TYPE scheduled_tweet_status AS ENUM (
  'pending',
  'published', 
  'cancelled',
  'failed'
);

-- Mettre à jour la colonne status
ALTER TABLE scheduled_tweets 
ALTER COLUMN status TYPE scheduled_tweet_status 
USING status::text::scheduled_tweet_status;

-- Supprimer l'ancien type
DROP TYPE scheduled_tweet_status_old;

-- Commentaires sur les nouvelles colonnes
COMMENT ON COLUMN scheduled_tweets.episode_id IS 'Référence vers l''épisode associé au tweet';
COMMENT ON COLUMN scheduled_tweets.metadata IS 'Métadonnées JSON du tweet (contenu original, hashtags, etc.)';
COMMENT ON COLUMN scheduled_tweets.status IS 'Statut du tweet: pending, published, cancelled, failed';
