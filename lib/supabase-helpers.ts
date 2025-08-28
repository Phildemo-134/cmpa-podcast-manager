import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Récupère un utilisateur unique de manière sécurisée
 * Utilise maybeSingle() pour éviter les erreurs de multiple rows
 */
export async function getUserSafely(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('subscription_status, subscription_tier, email, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Erreur Supabase lors de la récupération de l\'utilisateur:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception lors de la récupération de l\'utilisateur:', err);
    return null;
  }
}

/**
 * Récupère le statut d'abonnement d'un utilisateur de manière sécurisée
 */
export async function getUserSubscriptionStatus(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('subscription_status, subscription_tier')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Erreur Supabase lors de la récupération du statut d\'abonnement:', error.message);
      return {
        subscription_status: 'free',
        subscription_tier: 'free'
      };
    }

    return data || {
      subscription_status: 'free',
      subscription_tier: 'free'
    };
  } catch (err) {
    console.error('Exception lors de la récupération du statut d\'abonnement:', err);
    return {
      subscription_status: 'free',
      subscription_tier: 'free'
    };
  }
}

/**
 * Vérifie si un utilisateur a un abonnement actif
 */
export function hasActiveSubscription(subscriptionStatus: string): boolean {
  return ['active', 'trialing'].includes(subscriptionStatus);
}

/**
 * Récupère les détails d'un abonnement de manière sécurisée
 */
export async function getSubscriptionDetails(userId: string) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Erreur Supabase lors de la récupération des détails d\'abonnement:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception lors de la récupération des détails d\'abonnement:', err);
    return null;
  }
}
