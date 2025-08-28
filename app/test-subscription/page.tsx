'use client'

import { useSubscription } from '@/hooks/use-subscription'
import { useSupabaseAuth } from '@/hooks/use-supabase-auth'
import { Header } from '../../components/ui/header'
import { ProtectedRoute } from '../../components/auth/protected-route'
import { SubscriptionGuard } from '../../components/subscription'

export default function TestSubscriptionPage() {
  const { user } = useSupabaseAuth()
  const { subscription, isLoading, error } = useSubscription()

  return (
    <ProtectedRoute>
      <SubscriptionGuard>
        <div className="min-h-screen bg-gray-50">
          <Header currentPage="test-subscription" />

          {/* Main Content */}
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Test de l'abonnement
              </h2>
              <p className="text-gray-600">
                Cette page est accessible uniquement aux utilisateurs avec un abonnement actif
              </p>
            </div>

            {/* Informations de l'utilisateur */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informations de l'utilisateur
              </h3>
              
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Chargement...</span>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800">Erreur: {error}</p>
                </div>
              ) : subscription ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="text-gray-900">{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Statut d'abonnement:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      subscription.isActive || subscription.isTrialing 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {subscription.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Niveau:</span>
                    <span className="text-gray-900">{subscription.tier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Actif:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      subscription.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {subscription.isActive ? 'Oui' : 'Non'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">En essai:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      subscription.isTrialing ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {subscription.isTrialing ? 'Oui' : 'Non'}
                    </span>
                  </div>
                  {subscription.trialEnd && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Fin de l'essai:</span>
                      <span className="text-gray-900">
                        {new Date(subscription.trialEnd).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                  {subscription.currentPeriodEnd && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Fin de la période:</span>
                      <span className="text-gray-900">
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-800">Aucune information d'abonnement disponible</p>
                </div>
              )}
            </div>

            {/* Message de succès */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Accès autorisé
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Félicitations ! Vous avez accès à cette page car votre abonnement est actif.
                      Si vous étiez un utilisateur non abonné, vous auriez été automatiquement redirigé vers la page des réglages.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </SubscriptionGuard>
    </ProtectedRoute>
  )
}
