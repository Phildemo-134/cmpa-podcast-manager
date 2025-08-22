-- Migration pour convertir scheduled_tweets vers scheduled_at timestamptz
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer une table temporaire avec la nouvelle structure
CREATE TABLE IF NOT EXISTS public.scheduled_tweets_new (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) <= 280),
    scheduled_at TIMESTAMPTZ NOT NULL,
    status scheduled_tweet_status NOT NULL DEFAULT 'pending',
    published_at TIMESTAMPTZ,
    episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Migrer les données existantes (si la table existe déjà)
DO $$
BEGIN
    -- Vérifier si l'ancienne table existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'scheduled_tweets') THEN
        -- Vérifier si les anciennes colonnes existent
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'scheduled_tweets' AND column_name = 'scheduled_date') THEN
            -- Migrer les données de l'ancienne structure vers la nouvelle
            INSERT INTO public.scheduled_tweets_new (
                id, user_id, content, scheduled_at, status, published_at, 
                episode_id, metadata, created_at, updated_at
            )
            SELECT 
                id, user_id, content, 
                (scheduled_date || ' ' || scheduled_time)::TIMESTAMPTZ AT TIME ZONE 'UTC',
                status, published_at, episode_id, metadata, created_at, updated_at
            FROM public.scheduled_tweets;
            
            RAISE NOTICE 'Données migrées avec succès';
        ELSE
            RAISE NOTICE 'Table scheduled_tweets existe déjà avec la nouvelle structure';
        END IF;
    END IF;
END $$;

-- 3. Supprimer l'ancienne table si elle existe
DROP TABLE IF EXISTS public.scheduled_tweets;

-- 4. Renommer la nouvelle table
ALTER TABLE public.scheduled_tweets_new RENAME TO scheduled_tweets;

-- 5. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_scheduled_tweets_user_id ON public.scheduled_tweets(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_tweets_episode_id ON public.scheduled_tweets(episode_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_tweets_scheduled_at ON public.scheduled_tweets(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_tweets_status ON public.scheduled_tweets(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_tweets_created_at ON public.scheduled_tweets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scheduled_tweets_metadata ON public.scheduled_tweets USING GIN (metadata);

-- 6. Activer RLS (Row Level Security)
ALTER TABLE public.scheduled_tweets ENABLE ROW LEVEL SECURITY;

-- 7. Créer les politiques RLS
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

-- 8. Créer la fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Créer le trigger pour updated_at
DROP TRIGGER IF EXISTS update_scheduled_tweets_updated_at ON public.scheduled_tweets;
CREATE TRIGGER update_scheduled_tweets_updated_at 
    BEFORE UPDATE ON public.scheduled_tweets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Ajouter des commentaires
COMMENT ON TABLE public.scheduled_tweets IS 'Table pour stocker les tweets planifiés des utilisateurs';
COMMENT ON COLUMN public.scheduled_tweets.content IS 'Contenu du tweet (max 280 caractères)';
COMMENT ON COLUMN public.scheduled_tweets.scheduled_at IS 'Date et heure de publication planifiée en UTC';
COMMENT ON COLUMN public.scheduled_tweets.status IS 'Statut du tweet: pending, published, cancelled, failed';
COMMENT ON COLUMN public.scheduled_tweets.published_at IS 'Timestamp de publication effective (si publié)';
COMMENT ON COLUMN public.scheduled_tweets.episode_id IS 'Référence vers l''épisode associé au tweet';
COMMENT ON COLUMN public.scheduled_tweets.metadata IS 'Métadonnées JSON du tweet (contenu original, hashtags, etc.)';

-- 11. Vérifier que la table a été créée correctement
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'scheduled_tweets' 
AND table_schema = 'public'
ORDER BY ordinal_position;
