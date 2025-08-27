#!/usr/bin/env node

/**
 * Script de debug pour vérifier l'état d'un abonnement
 * Usage: node scripts/debug-subscription-status.js <email_utilisateur>
 */

const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

async function debugSubscriptionStatus(email) {
  if (!email) {
    console.error('❌ Veuillez fournir un email: node scripts/debug-subscription-status.js <email>');
    process.exit(1);
  }

  console.log(`🔍 Debug de l'abonnement pour: ${email}\n`);

  try {
    // 1. Vérifier l'utilisateur dans Supabase
    console.log('📊 1. Vérification dans Supabase...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) {
      console.error('❌ Erreur utilisateur:', userError.message);
      return;
    }

    console.log(`   ✅ Utilisateur: ${user.name} (ID: ${user.id})`);
    console.log(`   📋 Statut: ${user.subscription_status}`);
    console.log(`   🎯 Tier: ${user.subscription_tier}`);
    console.log(`   🔑 Stripe Customer ID: ${user.stripe_customer_id || 'Non défini'}`);

    // 2. Vérifier les abonnements dans la table subscriptions
    console.log('\n📊 2. Vérification dans la table subscriptions...');
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (subError) {
      console.error('❌ Erreur subscriptions:', subError.message);
    } else if (subscriptions && subscriptions.length > 0) {
      console.log(`   📋 Abonnements trouvés: ${subscriptions.length}`);
      subscriptions.forEach((sub, index) => {
        console.log(`   ${index + 1}. ID: ${sub.id}`);
        console.log(`      Statut: ${sub.status}`);
        console.log(`      Stripe ID: ${sub.stripe_subscription_id}`);
        console.log(`      Créé: ${sub.created_at}`);
        console.log(`      Période fin: ${sub.current_period_end}`);
        console.log('');
      });
    } else {
      console.log('   ❌ Aucun abonnement trouvé dans la table subscriptions');
    }

    // 3. Vérifier dans Stripe (si on a un customer ID)
    if (user.stripe_customer_id) {
      console.log('📊 3. Vérification dans Stripe...');
      try {
        const customer = await stripe.customers.retrieve(user.stripe_customer_id);
        console.log(`   ✅ Customer Stripe: ${customer.email}`);
        console.log(`   📊 Nom: ${customer.name}`);
        console.log(`   🔗 ID: ${customer.id}`);

        // Récupérer les abonnements actifs
        const stripeSubscriptions = await stripe.subscriptions.list({
          customer: user.stripe_customer_id,
          limit: 10,
        });

        if (stripeSubscriptions.data.length > 0) {
          console.log(`   📋 Abonnements Stripe: ${stripeSubscriptions.data.length}`);
          stripeSubscriptions.data.forEach((sub, index) => {
            console.log(`   ${index + 1}. ID: ${sub.id}`);
            console.log(`      Statut: ${sub.status}`);
            console.log(`      Créé: ${new Date(sub.created * 1000).toISOString()}`);
            console.log(`      Période fin: ${new Date(sub.current_period_end * 1000).toISOString()}`);
            console.log(`      Annulé: ${sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : 'Non'}`);
            console.log('');
          });
        } else {
          console.log('   ❌ Aucun abonnement actif dans Stripe');
        }

      } catch (stripeError) {
        console.error('❌ Erreur Stripe:', stripeError.message);
      }
    } else {
      console.log('📊 3. Vérification dans Stripe...');
      console.log('   ⚠️ Pas de Stripe Customer ID, impossible de vérifier');
    }

    // 4. Analyse des différences
    console.log('📊 4. Analyse des différences...');
    
    if (subscriptions && subscriptions.length > 0 && user.stripe_customer_id) {
      const latestSub = subscriptions[0];
      const stripeSub = stripeSubscriptions?.data?.[0];
      
      if (stripeSub && latestSub.stripe_subscription_id === stripeSub.id) {
        if (latestSub.status !== stripeSub.status) {
          console.log(`   ⚠️ DIFFÉRENCE DÉTECTÉE!`);
          console.log(`      Supabase: ${latestSub.status}`);
          console.log(`      Stripe: ${stripeSub.status}`);
          console.log(`   🔧 Le webhook n'a pas synchronisé les statuts!`);
        } else {
          console.log(`   ✅ Synchronisation OK: ${latestSub.status} = ${stripeSub.status}`);
        }
      } else {
        console.log(`   ⚠️ Abonnements différents entre Supabase et Stripe`);
      }
    }

    // 5. Recommandations
    console.log('\n📋 5. Recommandations...');
    if (user.subscription_status === 'active' && subscriptions && subscriptions.length > 0) {
      const latestSub = subscriptions[0];
      if (latestSub.status === 'canceled') {
        console.log('   🔧 Problème: Statut utilisateur ≠ statut abonnement');
        console.log('   💡 Solution: Utiliser le script de correction');
        console.log('   📝 Commande: npm run fix:subscription ' + email);
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Récupérer l'email depuis les arguments de ligne de commande
const email = process.argv[2];

if (!email) {
  console.log('📋 Usage: node scripts/debug-subscription-status.js <email_utilisateur>');
  console.log('📋 Exemple: node scripts/debug-subscription-status.js user@example.com');
  process.exit(1);
}

debugSubscriptionStatus(email);
