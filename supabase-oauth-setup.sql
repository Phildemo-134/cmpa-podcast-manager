-- Script de configuration OAuth2 pour Podcast Manager
-- À exécuter dans l'interface SQL de Supabase

-- 1. Table pour stocker les états OAuth2 (protection CSRF)
CREATE TABLE IF NOT EXISTS oauth_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin')),
  code_verifier TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table pour stocker les connexions sociales
CREATE TABLE IF NOT EXISTS social_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  platform_user_id TEXT NOT NULL,
  platform_username TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte d'unicité : un utilisateur ne peut avoir qu'une connexion par plateforme
  UNIQUE(user_id, platform)
);

-- 3. Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_oauth_states_user_id ON oauth_states(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON oauth_states(expires_at);

CREATE INDEX IF NOT EXISTS idx_social_connections_user_id ON social_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_social_connections_platform ON social_connections(platform);
CREATE INDEX IF NOT EXISTS idx_social_connections_active ON social_connections(is_active);

-- 4. Fonction pour nettoyer automatiquement les états expirés
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM oauth_states WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 5. Déclencheur pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_social_connections_updated_at
  BEFORE UPDATE ON social_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Politique RLS (Row Level Security) pour la sécurité
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;

-- Politique pour oauth_states : l'utilisateur ne peut voir que ses propres états
CREATE POLICY "Users can only access their own oauth states" ON oauth_states
  FOR ALL USING (auth.uid() = user_id);

-- Politique pour social_connections : l'utilisateur ne peut voir que ses propres connexions
CREATE POLICY "Users can only access their own social connections" ON social_connections
  FOR ALL USING (auth.uid() = user_id);

-- 7. Commentaires pour la documentation
COMMENT ON TABLE oauth_states IS 'Table pour stocker les états OAuth2 et protéger contre les attaques CSRF';
COMMENT ON TABLE social_connections IS 'Table pour stocker les connexions OAuth2 aux réseaux sociaux';
COMMENT ON COLUMN oauth_states.state IS 'Token d''état unique pour la protection CSRF';
COMMENT ON COLUMN oauth_states.code_verifier IS 'Code verifier PKCE pour l''échange de tokens';
COMMENT ON COLUMN social_connections.access_token IS 'Token d''accès OAuth2 (chiffré en production)';
COMMENT ON COLUMN social_connections.refresh_token IS 'Token de rafraîchissement OAuth2 (chiffré en production)';
COMMENT ON COLUMN social_connections.permissions IS 'Liste des permissions accordées par la plateforme';

-- 8. Nettoyage initial des états expirés
SELECT cleanup_expired_oauth_states();

-- 9. Vérification de la création des tables
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('oauth_states', 'social_connections')
ORDER BY table_name, ordinal_position;
