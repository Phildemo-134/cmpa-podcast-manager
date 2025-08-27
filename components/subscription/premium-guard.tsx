'use client';

import { ReactNode } from 'react';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { Paywall } from './paywall';

interface PremiumGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  showPaywall?: boolean;
}

export function PremiumGuard({ 
  children, 
  fallback, 
  showPaywall = true 
}: PremiumGuardProps) {
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const { subscription, isLoading: subscriptionLoading } = useSubscription();

  if (authLoading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return fallback || (
      <div className="text-center p-8">
        <p className="text-gray-600">Veuillez vous connecter pour accéder à cette fonctionnalité.</p>
      </div>
    );
  }

  // Vérifier si l'utilisateur a un abonnement actif ou en essai
  const hasActiveSubscription = subscription?.isActive || subscription?.isTrialing;

  if (!hasActiveSubscription && showPaywall) {
    return (
      <Paywall 
        onSuccess={() => {
          // Recharger la page après un succès
          window.location.reload();
        }}
        onCancel={() => {
          // Rediriger vers le dashboard
          window.location.href = '/dashboard';
        }}
      />
    );
  }

  if (!hasActiveSubscription && !showPaywall) {
    return fallback || (
      <div className="text-center p-8">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Fonctionnalité Premium
          </h3>
          <p className="text-gray-600 mb-4">
            Cette fonctionnalité nécessite un abonnement Pro.
          </p>
          <button
            onClick={() => window.location.href = '/settings'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voir les plans
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
