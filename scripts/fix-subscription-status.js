#!/usr/bin/env node

/**
 * Script pour corriger manuellement le statut d'abonnement d'un utilisateur
 * Usage: node scripts/fix-subscription-status.js <email_utilisateur>
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixSubscriptionStatus(email) {
  if (!email) {
    console.error('❌ Veuillez fournir un email: node scripts/fix-subscription-status.js <email>');
    process.exit(1);
  }

  console.log(`🔍 Recherche de l'utilisateur avec l'email: ${email}`);

  try {
    // 1. Trouver l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) {
      console.error('❌ Erreur lors de la recherche de l\'utilisateur:', userError.message);
      return;
    }

    if (!user) {
      console.error('❌ Utilisateur non trouvé');
      return;
    }

    console.log(`✅ Utilisateur trouvé: ${user.name} (ID: ${user.id})`);
    console.log(`   Statut actuel: ${user.subscription_status}`);
    console.log(`   Tier actuel: ${user.subscription_tier}`);

    // 2. Vérifier les abonnements dans la table subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (subError) {
      console.error('❌ Erreur lors de la récupération des abonnements:', subError.message);
      return;
    }

    if (subscriptions && subscriptions.length > 0) {
      console.log(`📋 Abonnements trouvés: ${subscriptions.length}`);
      subscriptions.forEach((sub, index) => {
        console.log(`   ${index + 1}. ID: ${sub.id}, Statut: ${sub.status}, Créé: ${sub.created_at}`);
      });

      const latestSub = subscriptions[0];
      console.log(`\n🔄 Mise à jour du statut utilisateur vers: ${latestSub.status}`);

      // 3. Mettre à jour le statut de l'utilisateur
      const { error: updateError } = await supabase
        .from('users')
        .update({
          subscription_status: latestSub.status,
          subscription_tier: latestSub.status === 'active' || latestSub.status === 'trialing' ? 'pro' : 'free',
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('❌ Erreur lors de la mise à jour:', updateError.message);
        return;
      }

      console.log('✅ Statut utilisateur mis à jour avec succès!');
    } else {
      console.log('📋 Aucun abonnement trouvé, mise à jour vers "free"');
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          subscription_status: 'free',
          subscription_tier: 'free',
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('❌ Erreur lors de la mise à jour:', updateError.message);
        return;
      }

      console.log('✅ Statut utilisateur mis à jour vers "free"!');
    }

    // 4. Vérifier la mise à jour
    const { data: updatedUser, error: checkError } = await supabase
      .from('users')
      .select('subscription_status, subscription_tier')
      .eq('id', user.id)
      .single();

    if (!checkError && updatedUser) {
      console.log(`\n✅ Vérification - Nouveau statut:`);
      console.log(`   Statut: ${updatedUser.subscription_status}`);
      console.log(`   Tier: ${updatedUser.subscription_tier}`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Récupérer l'email depuis les arguments de ligne de commande
const email = process.argv[2];

if (!email) {
  console.log('📋 Usage: node scripts/fix-subscription-status.js <email_utilisateur>');
  console.log('📋 Exemple: node scripts/fix-subscription-status.js user@example.com');
  process.exit(1);
}

fixSubscriptionStatus(email);
