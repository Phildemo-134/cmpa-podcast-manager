import { useState, useEffect } from 'react';
import { useSupabaseAuth } from './use-supabase-auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Subscription {
  id: string;
  status: string;
  tier: string;
  trialEnd?: string;
  currentPeriodEnd?: string;
  isActive: boolean;
  isTrialing: boolean;
}

export function useSubscription() {
  const { user } = useSupabaseAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubscription() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Récupérer les informations de l'utilisateur
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('subscription_status, subscription_tier')
          .eq('id', user.id)
          .single();

        if (userError) {
          throw userError;
        }

        // Récupérer les détails de l'abonnement si actif
        let subscriptionDetails = null;
        if (userData.subscription_status === 'active' || userData.subscription_status === 'trialing') {
          const { data: subData, error: subError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', userData.subscription_status)
            .single();

          if (!subError && subData) {
            subscriptionDetails = subData;
          }
        }

        const subscriptionInfo: Subscription = {
          id: subscriptionDetails?.id || '',
          status: userData.subscription_status || 'free',
          tier: userData.subscription_tier || 'free',
          trialEnd: subscriptionDetails?.trial_end || undefined,
          currentPeriodEnd: subscriptionDetails?.current_period_end || undefined,
          isActive: userData.subscription_status === 'active' || userData.subscription_status === 'trialing',
          isTrialing: userData.subscription_status === 'trialing',
        };

        setSubscription(subscriptionInfo);
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubscription();
  }, [user]);

  const refreshSubscription = () => {
    if (user) {
      // Déclencher un nouveau fetch
      setSubscription(null);
      setIsLoading(true);
      setError(null);
    }
  };

  return {
    subscription,
    isLoading,
    error,
    refreshSubscription,
  };
}
