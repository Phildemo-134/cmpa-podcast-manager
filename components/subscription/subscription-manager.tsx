'use client';

import { useState } from 'react';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SubscriptionManagerProps {
  subscriptionStatus?: string;
  subscriptionTier?: string;
  trialEnd?: string;
  currentPeriodEnd?: string;
}

export function SubscriptionManager({
  subscriptionStatus,
  subscriptionTier,
  trialEnd,
  currentPeriodEnd,
}: SubscriptionManagerProps) {
  const { user } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Rediriger vers le portail client Stripe
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'trialing':
        return 'text-blue-600';
      case 'past_due':
        return 'text-yellow-600';
      case 'canceled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'trialing':
        return 'Essai gratuit';
      case 'past_due':
        return 'Paiement en retard';
      case 'canceled':
        return 'Annulé';
      default:
        return 'Inconnu';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isTrialActive = subscriptionStatus === 'trialing' && trialEnd;
  const isActive = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
  const isCanceled = subscriptionStatus === 'canceled';
  const isPastDue = subscriptionStatus === 'past_due';
  const isUnpaid = subscriptionStatus === 'unpaid';

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Votre abonnement
          </h3>
          <p className="text-gray-600">
            Gérez votre plan et vos informations de facturation
          </p>
        </div>
        <div className="text-right">
          <div className={`text-sm font-medium ${getStatusColor(subscriptionStatus || '')}`}>
            {getStatusText(subscriptionStatus || '')}
          </div>
          <div className="text-xs text-gray-500">
            {subscriptionTier === 'pro' ? 'Plan Pro' : 'Plan Gratuit'}
          </div>
        </div>
      </div>

      {(isActive || isCanceled || isPastDue || isUnpaid) && (
        <div className="space-y-4 mb-6">
          {isTrialActive && trialEnd && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-blue-600 mr-2">🎁</span>
                <div>
                  <div className="font-medium text-blue-900">
                    Essai gratuit actif
                  </div>
                  <div className="text-sm text-blue-700">
                    Se termine le {formatDate(trialEnd)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {isCanceled && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-red-600 mr-2">❌</span>
                <div>
                  <div className="font-medium text-red-900">
                    Abonnement annulé
                  </div>
                  <div className="text-sm text-red-700">
                    Votre abonnement a été annulé et ne sera pas renouvelé
                  </div>
                </div>
              </div>
            </div>
          )}

          {isPastDue && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-red-600 mr-2">⚠️</span>
                <div>
                  <div className="font-medium text-yellow-900">
                    Paiement en retard
                  </div>
                  <div className="text-sm text-yellow-700">
                    Veuillez mettre à jour vos informations de paiement
                  </div>
                </div>
              </div>
            </div>
          )}

          {isUnpaid && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-orange-600 mr-2">💳</span>
                <div>
                  <div className="text-orange-900">
                    Paiement échoué
                  </div>
                  <div className="text-sm text-orange-700">
                    Veuillez vérifier vos informations de paiement
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentPeriodEnd && (isActive || isCanceled) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">📅</span>
                <div>
                  <div className="font-medium text-gray-900">
                    {isCanceled ? 'Fin de période' : 'Prochaine facturation'}
                  </div>
                  <div className="text-sm text-gray-700">
                    {formatDate(currentPeriodEnd)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {isActive && (
          <Button
            onClick={handleManageSubscription}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Chargement...' : 'Gérer l\'abonnement'}
          </Button>
        )}

        {isCanceled && (
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-500">
              Votre abonnement a été annulé
            </p>
            <Button
              asChild
              className="w-full"
            >
              <a href="/subscription">
                Réactiver l'abonnement
              </a>
            </Button>
          </div>
        )}

        {!isActive && !isCanceled && (
          <p className="text-sm text-gray-500 text-center">
            Vous n'avez pas d'abonnement actif
          </p>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-2">
          <p>
            • Votre abonnement sera automatiquement renouvelé à la fin de chaque période
          </p>
          <p>
            • Vous pouvez annuler à tout moment depuis votre tableau de bord Stripe
          </p>
          <p>
            • Les modifications prennent effet à la fin de la période de facturation en cours
          </p>
        </div>
      </div>
    </Card>
  );
}
