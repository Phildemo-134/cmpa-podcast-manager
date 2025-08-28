import { useState, useEffect } from 'react';
import { useSupabaseAuth } from './use-supabase-auth';
import { formatErrorMessage } from '../lib/error-handler';
import { getUserSubscriptionStatus, getSubscriptionDetails, hasActiveSubscription } from '../lib/supabase-helpers';

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

        // Utiliser les fonctions utilitaires sécurisées
        const userData = await getUserSubscriptionStatus(user.id);
        
        if (!userData) {
          // Utilisateur non trouvé, utiliser des valeurs par défaut
          const subscriptionInfo: Subscription = {
            id: '',
            status: 'free',
            tier: 'free',
            isActive: false,
            isTrialing: false,
          };
          setSubscription(subscriptionInfo);
          return;
        }

        // Récupérer les détails de l'abonnement si actif ou en cours de traitement
        let subscriptionDetails = null;
        if (hasActiveSubscription(userData.subscription_status)) {
          subscriptionDetails = await getSubscriptionDetails(user.id);
        }

        const subscriptionInfo: Subscription = {
          id: subscriptionDetails?.id || '',
          status: userData.subscription_status || 'free',
          tier: userData.subscription_tier || 'free',
          trialEnd: subscriptionDetails?.trial_end || undefined,
          currentPeriodEnd: subscriptionDetails?.current_period_end || undefined,
          isActive: hasActiveSubscription(userData.subscription_status),
          isTrialing: userData.subscription_status === 'trialing',
        };

        setSubscription(subscriptionInfo);
      } catch (err) {
        // Utiliser l'utilitaire de gestion d'erreurs
        const errorMessage = formatErrorMessage(err, 'Une erreur est survenue lors de la récupération de l\'abonnement');
        setError(errorMessage);
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
