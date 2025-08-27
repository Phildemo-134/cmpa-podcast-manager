const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSubscriptionConstraints() {
  console.log('🔍 Vérification des contraintes de la table subscriptions...');

  try {
    // Vérifier la structure actuelle
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Erreur lors de la récupération des abonnements:', error);
      return;
    }

    console.log('📊 Structure actuelle de la table:');
    if (subscriptions.length > 0) {
      console.log('Colonnes disponibles:', Object.keys(subscriptions[0]));
    }

    // Vérifier les doublons potentiels
    const { data: duplicates, error: dupError } = await supabase
      .rpc('check_duplicate_subscriptions');

    if (dupError) {
      console.log('ℹ️  Fonction RPC non disponible, vérification manuelle...');
      
      // Vérification manuelle des doublons
      const { data: allSubs, error: allError } = await supabase
        .from('subscriptions')
        .select('stripe_subscription_id, count')
        .select('stripe_subscription_id');

      if (allError) {
        console.error('❌ Erreur lors de la vérification manuelle:', allError);
        return;
      }

      // Compter les occurrences
      const counts = {};
      allSubs.forEach(sub => {
        counts[sub.stripe_subscription_id] = (counts[sub.stripe_subscription_id] || 0) + 1;
      });

      const duplicates = Object.entries(counts).filter(([id, count]) => count > 1);
      
      if (duplicates.length > 0) {
        console.log('⚠️  Doublons détectés:');
        duplicates.forEach(([id, count]) => {
          console.log(`  - ${id}: ${count} occurrences`);
        });
      } else {
        console.log('✅ Aucun doublon détecté');
      }
    } else {
      console.log('✅ Vérification RPC réussie');
    }

    // Vérifier les contraintes de base de données
    console.log('\n🔒 Vérification des contraintes...');
    
    // Test d'insertion avec un ID Stripe existant
    const { data: testSub } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .limit(1);

    if (testSub && testSub.length > 0) {
      const existingId = testSub[0].stripe_subscription_id;
      console.log(`🧪 Test avec l'ID existant: ${existingId}`);
      
      // Essayer d'insérer un doublon (cela devrait échouer)
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: 'test-user-id',
          stripe_subscription_id: existingId,
          stripe_price_id: 'test-price',
          status: 'test',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date().toISOString(),
        });

      if (insertError) {
        console.log('✅ Contrainte unique active:', insertError.message);
      } else {
        console.log('⚠️  ATTENTION: Contrainte unique non active !');
      }
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécuter le script
checkSubscriptionConstraints()
  .then(() => {
    console.log('🎉 Vérification terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
