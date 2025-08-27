const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupDuplicateSubscriptions() {
  console.log('🔍 Recherche des abonnements en double...');

  try {
    // Trouver les abonnements avec le même stripe_subscription_id
    const { data: duplicates, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur lors de la récupération des abonnements:', error);
      return;
    }

    // Grouper par stripe_subscription_id
    const grouped = duplicates.reduce((acc, sub) => {
      if (!acc[sub.stripe_subscription_id]) {
        acc[sub.stripe_subscription_id] = [];
      }
      acc[sub.stripe_subscription_id].push(sub);
      return acc;
    }, {});

    // Identifier les doublons
    const toDelete = [];
    for (const [stripeId, subs] of Object.entries(grouped)) {
      if (subs.length > 1) {
        console.log(`📋 Doublons trouvés pour ${stripeId}:`);
        subs.forEach((sub, index) => {
          console.log(`  ${index + 1}. ID: ${sub.id}, Créé: ${sub.created_at}, Statut: ${sub.status}`);
        });

        // Garder le plus récent, supprimer les autres
        const sorted = subs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const toKeep = sorted[0];
        const toRemove = sorted.slice(1);

        console.log(`✅ Garder: ID ${toKeep.id} (le plus récent)`);
        toRemove.forEach(sub => {
          console.log(`🗑️  Supprimer: ID ${sub.id}`);
          toDelete.push(sub.id);
        });
      }
    }

    if (toDelete.length === 0) {
      console.log('✅ Aucun doublon trouvé !');
      return;
    }

    console.log(`\n🗑️  Suppression de ${toDelete.length} abonnements en double...`);

    // Supprimer les doublons
    const { error: deleteError } = await supabase
      .from('subscriptions')
      .delete()
      .in('id', toDelete);

    if (deleteError) {
      console.error('❌ Erreur lors de la suppression:', deleteError);
      return;
    }

    console.log('✅ Nettoyage terminé avec succès !');
    console.log(`📊 ${toDelete.length} abonnements supprimés`);

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécuter le script
cleanupDuplicateSubscriptions()
  .then(() => {
    console.log('🎉 Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
