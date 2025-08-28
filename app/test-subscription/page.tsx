'use client'

import { ProtectedRoute } from '../../components/auth/protected-route'
import { Header } from '../../components/ui/header'
import { useEffect } from 'react'

export default function TestSubscriptionPage() {
  useEffect(() => {
    console.log('🔄 TestSubscriptionPage - Composant monté')
    return () => {
      console.log('🔄 TestSubscriptionPage - Composant démonté')
    }
  }, [])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="test" />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Test de Protection d'Abonnement
            </h2>
            <p className="text-gray-600">
              Si vous voyez cette page, cela signifie que vous avez un abonnement actif ou êtes en période d'essai.
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ✅ Accès Autorisé
            </h3>
            <p className="text-green-700">
              Votre abonnement est actif. Vous pouvez accéder à toutes les fonctionnalités.
            </p>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              🔍 Informations de Débogage
            </h3>
            <p className="text-blue-700 text-sm">
              Cette page utilise le composant ProtectedRoute avec vérification d'abonnement.
              Si vous voyez cette page, la protection fonctionne correctement.
            </p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
