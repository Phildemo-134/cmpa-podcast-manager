const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testWebhookConfig() {
  console.log('🔍 Test de la configuration des webhooks Stripe\n');

  // Vérification des variables d'environnement
  console.log('📋 Variables d\'environnement :');
  console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Configuré' : '❌ Manquant');
  console.log('STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? '✅ Configuré' : '❌ Manquant');
  console.log('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Configuré' : '❌ Manquant');
  
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    console.log('   Format:', process.env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_') ? '✅ Correct' : '❌ Incorrect');
    console.log('   Longueur:', process.env.STRIPE_WEBHOOK_SECRET.length, 'caractères');
  }

  // Test de connexion Stripe
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const Stripe = require('stripe');
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      
      console.log('\n🔌 Test de connexion Stripe :');
      const account = await stripe.accounts.retrieve();
      console.log('✅ Connexion Stripe réussie');
      console.log('   Mode:', process.env.STRIPE_SECRET_KEY.startsWith('sk_live_') ? 'Production' : 'Test');
      console.log('   Compte:', account.business_profile?.name || account.id);
    } catch (error) {
      console.log('❌ Erreur de connexion Stripe:', error.message);
    }
  }

  // Test de connexion Supabase
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      console.log('\n🗄️ Test de connexion Supabase :');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      
      const { data, error } = await supabase.from('subscriptions').select('count').limit(1);
      if (error) throw error;
      console.log('✅ Connexion Supabase réussie');
    } catch (error) {
      console.log('❌ Erreur de connexion Supabase:', error.message);
    }
  }

  console.log('\n📝 Recommandations :');
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.log('1. Configurez STRIPE_WEBHOOK_SECRET dans votre dashboard Vercel');
    console.log('2. Récupérez la valeur depuis Stripe → Developers → Webhooks');
  }
  
  if (process.env.STRIPE_WEBHOOK_SECRET && !process.env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')) {
    console.log('1. Vérifiez que STRIPE_WEBHOOK_SECRET commence par "whsec_"');
  }
  
  console.log('\n3. Vérifiez que l\'URL du webhook dans Stripe pointe vers :');
  console.log('   https://votre-app.vercel.app/api/stripe/webhook');
}

testWebhookConfig().catch(console.error);
