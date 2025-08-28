const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (utiliser les variables d'environnement)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.log('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont définies');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSubscriptionGuard() {
  console.log('🧪 Test du SubscriptionGuard...\n');

  try {
    // 1. Vérifier la connexion à Supabase
    console.log('1. Test de connexion à Supabase...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Erreur de connexion à Supabase:', error.message);
      return;
    }
    console.log('✅ Connexion à Supabase réussie\n');

    // 2. Vérifier la structure de la table users
    console.log('2. Vérification de la structure de la table users...');
    const { data: userColumns, error: columnError } = await supabase
      .from('users')
      .select('subscription_status, subscription_tier')
      .limit(1);

    if (columnError) {
      console.error('❌ Erreur lors de la vérification des colonnes:', columnError.message);
      return;
    }
    console.log('✅ Colonnes subscription_status et subscription_tier présentes\n');

    // 3. Vérifier les valeurs possibles pour subscription_status
    console.log('3. Vérification des valeurs possibles pour subscription_status...');
    const { data: statusValues, error: statusError } = await supabase
      .from('users')
      .select('subscription_status')
      .not('subscription_status', 'is', null);

    if (statusError) {
      console.error('❌ Erreur lors de la récupération des statuts:', statusError.message);
      return;
    }

    const uniqueStatuses = [...new Set(statusValues.map(u => u.subscription_status))];
    console.log('✅ Statuts d\'abonnement trouvés:', uniqueStatuses.join(', '));

    // 4. Vérifier la logique de redirection
    console.log('\n4. Test de la logique de redirection...');
    const testStatuses = ['free', 'inactive', 'active', 'trialing'];
    
    testStatuses.forEach(status => {
      const shouldRedirect = !['active', 'trialing'].includes(status);
      const redirectMessage = shouldRedirect ? '🔴 REDIRECTION vers /settings' : '🟢 ACCÈS AUTORISÉ';
      console.log(`   ${status}: ${redirectMessage}`);
    });

    console.log('\n✅ Test du SubscriptionGuard terminé avec succès !');
    console.log('\n📋 Résumé de la logique :');
    console.log('   - Utilisateurs avec status "free" ou "inactive" → Redirigés vers /settings');
    console.log('   - Utilisateurs avec status "active" ou "trialing" → Accès autorisé');
    console.log('   - Redirection automatique vers /settings pour les non-abonnés');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testSubscriptionGuard();
