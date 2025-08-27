-- Mise à jour de la contrainte de vérification pour subscription_status
-- pour accepter tous les statuts Stripe possibles

-- Supprimer l'ancienne contrainte
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_subscription_status_check;

-- Ajouter la nouvelle contrainte avec tous les statuts possibles
ALTER TABLE users ADD CONSTRAINT users_subscription_status_check 
CHECK (subscription_status IN (
  'free', 
  'active', 
  'trialing', 
  'past_due', 
  'canceled', 
  'unpaid', 
  'incomplete', 
  'incomplete_expired'
));

-- Mettre à jour les utilisateurs existants qui pourraient avoir des statuts invalides
UPDATE users 
SET subscription_status = 'free' 
        WHERE subscription_status NOT IN (
          'free', 
          'active', 
          'trialing', 
          'past_due', 
          'canceled', 
          'unpaid', 
          'incomplete', 
          'incomplete_expired'
        );
