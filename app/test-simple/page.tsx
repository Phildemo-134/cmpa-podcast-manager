'use client'

import { ProtectedRoute } from '../../components/auth/protected-route'
import { Header } from '../../components/ui/header'

export default function TestSimplePage() {
  return (
    <ProtectedRoute requireActiveSubscription={false}>
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="test-simple" />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Test Simple - Authentification Uniquement
            </h2>
            <p className="text-gray-600">
              Cette page ne vérifie que l'authentification, pas l'abonnement.
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              ✅ Test Réussi
            </h3>
            <p className="text-blue-700">
              Si vous voyez cette page, l'authentification fonctionne correctement.
            </p>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              📝 Note
            </h3>
            <p className="text-yellow-700 text-sm">
              Cette page utilise <code>requireActiveSubscription={false}</code> pour tester
              uniquement l'authentification sans vérification d'abonnement.
            </p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
