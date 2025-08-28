'use client'

import { ProtectedRoute } from '../../components/auth/protected-route'
import { Header } from '../../components/ui/header'
import { useEffect, useState } from 'react'

export default function TestDashboardPage() {
  const [renderCount, setRenderCount] = useState(0)
  const [lastRender, setLastRender] = useState(Date.now())

  useEffect(() => {
    const now = Date.now()
    setRenderCount(prev => prev + 1)
    setLastRender(now)
    
    console.log(`🔄 TestDashboardPage - Rendu #${renderCount + 1} à ${new Date(now).toLocaleTimeString()}`)
    
    return () => {
      console.log(`🔄 TestDashboardPage - Démontage à ${new Date(now).toLocaleTimeString()}`)
    }
  })

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="test-dashboard" />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Test Dashboard - Protection d'Abonnement
            </h2>
            <p className="text-gray-600">
              Cette page teste le composant ProtectedRoute corrigé pour éviter les boucles infinies.
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ✅ Accès Autorisé
            </h3>
            <p className="text-green-700">
              Votre abonnement est actif. Vous pouvez accéder à toutes les fonctionnalités.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              🔍 Informations de Débogage
            </h3>
            <div className="space-y-2 text-sm text-blue-700">
              <p><strong>Nombre de rendus :</strong> {renderCount}</p>
              <p><strong>Dernier rendu :</strong> {new Date(lastRender).toLocaleTimeString()}</p>
              <p><strong>Composant :</strong> ProtectedRoute avec vérification d'abonnement</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              📝 Instructions de Test
            </h3>
            <div className="space-y-2 text-sm text-yellow-700">
              <p>1. Vérifiez que cette page se charge sans boucle infinie</p>
              <p>2. Le nombre de rendus ne doit pas augmenter indéfiniment</p>
              <p>3. Regardez la console pour les logs de débogage</p>
              <p>4. Si vous êtes non abonné, vous devriez être redirigé vers /settings</p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
