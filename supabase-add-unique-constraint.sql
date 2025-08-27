-- Script pour ajouter la contrainte unique sur stripe_subscription_id
-- Exécutez ce script dans votre dashboard Supabase SQL Editor

-- 1. Vérifier si la contrainte existe déjà
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
WHERE 
    tc.constraint_type = 'UNIQUE' 
    AND tc.table_name = 'subscriptions'
    AND kcu.column_name = 'stripe_subscription_id';

-- 2. Si aucune contrainte n'existe, l'ajouter
-- (Décommentez la ligne suivante si nécessaire)
-- ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_stripe_subscription_id_unique UNIQUE (stripe_subscription_id);

-- 3. Vérifier la structure actuelle de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'subscriptions'
ORDER BY 
    ordinal_position;

-- 4. Vérifier les index existants
SELECT 
    indexname,
    indexdef
FROM 
    pg_indexes
WHERE 
    tablename = 'subscriptions';

-- 5. Nettoyer les doublons existants (à exécuter AVANT d'ajouter la contrainte)
-- Garder seulement le plus récent pour chaque stripe_subscription_id
WITH ranked_subscriptions AS (
  SELECT 
    *,
    ROW_NUMBER() OVER (
      PARTITION BY stripe_subscription_id 
      ORDER BY created_at DESC
    ) as rn
  FROM subscriptions
)
DELETE FROM subscriptions 
WHERE id IN (
  SELECT id 
  FROM ranked_subscriptions 
  WHERE rn > 1
);

-- 6. Ajouter la contrainte unique (à exécuter APRÈS le nettoyage)
-- ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_stripe_subscription_id_unique UNIQUE (stripe_subscription_id);

-- 7. Vérifier que la contrainte est active
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
WHERE 
    tc.constraint_type = 'UNIQUE' 
    AND tc.table_name = 'subscriptions'
    AND kcu.column_name = 'stripe_subscription_id';
