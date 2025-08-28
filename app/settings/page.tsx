'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { SocialConnections } from '../../components/settings/social-connections';
import { Header } from '../../components/ui/header';
import { Paywall } from '@/components/subscription/paywall';
import { SubscriptionManager } from '@/components/subscription/subscription-manager';
import { SubscriptionRedirectNotification } from '@/components/subscription/subscription-redirect-notification';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { AuthGuard } from '@/components/auth/auth-guard';
import { getUserSubscriptionStatus, hasActiveSubscription } from '../../lib/supabase-helpers';
import { logError } from '../../lib/error-handler';

interface UserSubscription {
  subscription_status: string;
  subscription_tier: string;
  trial_end?: string;
  current_period_end?: string;
}

export default function SettingsPage() {
  const { user } = useSupabaseAuth();
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserSubscription() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Utiliser la fonction utilitaire sécurisée
        const userData = await getUserSubscriptionStatus(user.id);
        setUserSubscription(userData);
      } catch (catchError: unknown) {
        // Utiliser l'utilitaire de gestion d'erreurs
        const errorMessage = logError('Error in fetchUserSubscription', catchError, 'Une erreur inattendue est survenue');
        console.error('Error in fetchUserSubscription:', errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserSubscription();
  }, [user]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="settings" />
        
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Réglages
                </h2>
                <p className="text-gray-600">
                  Gérez vos connexions aux réseaux sociaux, vos préférences et votre abonnement
                </p>
              </div>

              {/* Notification de redirection pour les utilisateurs non abonnés */}
              <SubscriptionRedirectNotification />

              {/* Section Connexions sociales - Visible uniquement pour les abonnements actifs */}
              {userSubscription && (userSubscription.subscription_status === 'active' || userSubscription.subscription_status === 'trialing') && (
                <div className="mb-12">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Connexions aux réseaux sociaux
                  </h3>
                  <Suspense fallback={<div>Chargement...</div>}>
                    <SocialConnections />
                  </Suspense>
                </div>
              )}

              {/* Section Abonnement */}
              <div className="mb-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Plans et abonnement
                </h3>
                {userSubscription && (userSubscription.subscription_status === 'active' || userSubscription.subscription_status === 'trialing') ? (
                  <SubscriptionManager
                    subscriptionStatus={userSubscription?.subscription_status}
                    subscriptionTier={userSubscription?.subscription_tier}
                    currentPeriodEnd={userSubscription?.current_period_end}
                  />
                ) : (
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
                )}
              </div>

              {/* Section Déconnexion */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Compte
                </h3>
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Connecté en tant que</p>
                    <p className="font-medium text-gray-900">{user?.email}</p>
                  </div>
                  <SignOutButton />
                </div>
              </div>
            </main>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
