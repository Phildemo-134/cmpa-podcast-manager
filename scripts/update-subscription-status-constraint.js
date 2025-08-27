const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateSubscriptionStatusConstraint() {
  console.log('🔧 Mise à jour de la contrainte subscription_status...');

  try {
    // Vérifier la structure actuelle de la table
    console.log('Vérification de la structure actuelle...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('users')
      .select('subscription_status')
      .limit(1);

    if (tableError) {
      throw new Error(`Impossible d'accéder à la table users: ${tableError.message}`);
    }

    console.log('✅ Table users accessible');

    // Mettre à jour les utilisateurs existants avec des statuts invalides
    console.log('Mise à jour des utilisateurs avec des statuts invalides...');
    const { error: updateError } = await supabase
      .from('users')
      .update({ subscription_status: 'free' })
      .not('subscription_status', 'in', ['free', 'active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired']);

    if (updateError) {
      console.log('Note: Aucun utilisateur à mettre à jour ou erreur:', updateError.message);
    } else {
      console.log('✅ Utilisateurs mis à jour si nécessaire');
    }

    console.log('✅ Mise à jour terminée !');
    console.log('Note: La contrainte de base de données doit être mise à jour manuellement via SQL');
    console.log('Exécutez le contenu de supabase-subscription-status-constraint-update.sql dans votre base de données');

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    process.exit(1);
  }
}

// Exécuter le script
updateSubscriptionStatusConstraint();
