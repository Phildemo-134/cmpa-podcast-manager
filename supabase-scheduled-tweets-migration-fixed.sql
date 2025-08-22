-- Migration corrigée pour créer la table scheduled_tweets
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer d'abord le type d'énumération s'il n'existe pas
DO $$ BEGIN
    CREATE TYPE scheduled_tweet_status AS ENUM (
        'pending',
        'published', 
        'cancelled',
        'failed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Créer la table scheduled_tweets avec la structure complète
CREATE TABLE IF NOT EXISTS public.scheduled_tweets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) <= 280),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    status scheduled_tweet_status NOT NULL DEFAULT 'pending',
    published_at TIMESTAMP WITH TIME ZONE,
    episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_scheduled_tweets_user_id ON public.scheduled_tweets(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_tweets_episode_id ON public.scheduled_tweets(episode_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_tweets_scheduled_datetime ON public.scheduled_tweets(scheduled_date, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_scheduled_tweets_status ON public.scheduled_tweets(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_tweets_created_at ON public.scheduled_tweets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scheduled_tweets_metadata ON public.scheduled_tweets USING GIN (metadata);

-- 4. Activer RLS (Row Level Security)
ALTER TABLE public.scheduled_tweets ENABLE ROW LEVEL SECURITY;

-- 5. Créer les politiques RLS
DROP POLICY IF EXISTS "Users can view their own scheduled tweets" ON public.scheduled_tweets;
CREATE POLICY "Users can view their own scheduled tweets" ON public.scheduled_tweets
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own scheduled tweets" ON public.scheduled_tweets;
CREATE POLICY "Users can insert their own scheduled tweets" ON public.scheduled_tweets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own scheduled tweets" ON public.scheduled_tweets;
CREATE POLICY "Users can update their own scheduled tweets" ON public.scheduled_tweets
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own scheduled tweets" ON public.scheduled_tweets;
CREATE POLICY "Users can delete their own scheduled tweets" ON public.scheduled_tweets
    FOR DELETE USING (auth.uid() = user_id);

-- 6. Créer la fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Créer le trigger pour updated_at
DROP TRIGGER IF EXISTS update_scheduled_tweets_updated_at ON public.scheduled_tweets;
CREATE TRIGGER update_scheduled_tweets_updated_at 
    BEFORE UPDATE ON public.scheduled_tweets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Ajouter des commentaires
COMMENT ON TABLE public.scheduled_tweets IS 'Table pour stocker les tweets planifiés des utilisateurs';
COMMENT ON COLUMN public.scheduled_tweets.content IS 'Contenu du tweet (max 280 caractères)';
COMMENT ON COLUMN public.scheduled_tweets.scheduled_date IS 'Date de publication planifiée';
COMMENT ON COLUMN public.scheduled_tweets.scheduled_time IS 'Heure de publication planifiée';
COMMENT ON COLUMN public.scheduled_tweets.status IS 'Statut du tweet: pending, published, cancelled, failed';
COMMENT ON COLUMN public.scheduled_tweets.published_at IS 'Timestamp de publication effective (si publié)';
COMMENT ON COLUMN public.scheduled_tweets.episode_id IS 'Référence vers l''épisode associé au tweet';
COMMENT ON COLUMN public.scheduled_tweets.metadata IS 'Métadonnées JSON du tweet (contenu original, hashtags, etc.)';

-- 9. Vérifier que la table a été créée correctement
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'scheduled_tweets' 
AND table_schema = 'public'
ORDER BY ordinal_position;
