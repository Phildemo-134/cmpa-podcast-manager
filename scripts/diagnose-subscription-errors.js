const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.log('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont définies');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnoseSubscriptionErrors() {
  console.log('🔍 Diagnostic des erreurs d\'abonnement...\n');

  try {
    // 1. Vérifier la structure de la table users
    console.log('1. Vérification de la structure de la table users...');
    const { data: userColumns, error: userColumnsError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (userColumnsError) {
      console.error('❌ Erreur lors de la vérification de la structure users:', userColumnsError.message);
    } else {
      console.log('✅ Structure de la table users accessible');
      if (userColumns && userColumns.length > 0) {
        const columns = Object.keys(userColumns[0]);
        console.log('   Colonnes disponibles:', columns.join(', '));
      }
    }

    // 2. Vérifier s'il y a des utilisateurs avec des doublons
    console.log('\n2. Vérification des doublons potentiels...');
    const { data: duplicateUsers, error: duplicateError } = await supabase
      .from('users')
      .select('id, email, subscription_status, subscription_tier, created_at')
      .order('created_at', { ascending: false });

    if (duplicateError) {
      console.error('❌ Erreur lors de la vérification des doublons:', duplicateError.message);
    } else if (duplicateUsers) {
      console.log(`✅ ${duplicateUsers.length} utilisateurs trouvés`);
      
      // Vérifier les doublons par email
      const emailCounts = {};
      duplicateUsers.forEach(user => {
        emailCounts[user.email] = (emailCounts[user.email] || 0) + 1;
      });

      const duplicates = Object.entries(emailCounts).filter(([email, count]) => count > 1);
      if (duplicates.length > 0) {
        console.log('⚠️  Doublons détectés par email:');
        duplicates.forEach(([email, count]) => {
          console.log(`   ${email}: ${count} occurrences`);
        });
      } else {
        console.log('✅ Aucun doublon par email détecté');
      }

      // Afficher quelques utilisateurs pour inspection
      console.log('\n   Derniers utilisateurs créés:');
      duplicateUsers.slice(0, 5).forEach(user => {
        console.log(`   - ${user.email} (${user.subscription_status}) - ${user.created_at}`);
      });
    }

    // 3. Vérifier la table subscriptions
    console.log('\n3. Vérification de la table subscriptions...');
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .limit(10);

    if (subError) {
      console.error('❌ Erreur lors de la vérification des subscriptions:', subError.message);
    } else if (subscriptions) {
      console.log(`✅ ${subscriptions.length} abonnements trouvés`);
      if (subscriptions.length > 0) {
        console.log('   Structure d\'un abonnement:', Object.keys(subscriptions[0]));
      }
    }

    // 4. Test de requête avec .single() sur un utilisateur spécifique
    console.log('\n4. Test de requête .single()...');
    if (duplicateUsers && duplicateUsers.length > 0) {
      const testUserId = duplicateUsers[0].id;
      console.log(`   Test avec l'utilisateur ID: ${testUserId}`);
      
      try {
        const { data: singleUser, error: singleError } = await supabase
          .from('users')
          .select('subscription_status, subscription_tier')
          .eq('id', testUserId)
          .single();

        if (singleError) {
          console.log(`   ❌ Erreur .single(): ${singleError.message}`);
          if (singleError.message.includes('multiple rows')) {
            console.log('   💡 Problème: Plusieurs lignes retournées pour un seul ID');
          }
        } else {
          console.log(`   ✅ Requête .single() réussie:`, singleUser);
        }
      } catch (err) {
        console.log(`   ❌ Exception lors du test .single(): ${err.message}`);
      }
    }

    // 5. Vérifier les contraintes de base de données
    console.log('\n5. Vérification des contraintes...');
    console.log('   💡 Vérifiez que la colonne "id" de la table users est bien une clé primaire unique');
    console.log('   💡 Vérifiez qu\'il n\'y a pas de contraintes cassées');

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.message);
  }
}

// Exécuter le diagnostic
diagnoseSubscriptionErrors();
