'use client'

import { useSupabaseAuth } from '../../hooks/use-supabase-auth'
import { Header } from '../../components/ui/header'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function TestAuthPage() {
  const { user, isLoading } = useSupabaseAuth()
  const [renderCount, setRenderCount] = useState(0)

  useEffect(() => {
    setRenderCount(prev => prev + 1)
    console.log('🔄 TestAuthPage - Rendu #', renderCount + 1)
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="test-auth" />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Test de la Page d'Authentification
            </h2>
            <p className="text-gray-600">
              Vous êtes connecté. La page d'authentification devrait vous rediriger automatiquement.
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              🔐 Utilisateur Connecté
            </h3>
            <div className="space-y-2 text-sm text-yellow-700">
              <p><strong>Email :</strong> {user.email}</p>
              <p><strong>ID :</strong> {user.id}</p>
              <p><strong>Nombre de rendus :</strong> {renderCount}</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              🧪 Test de Redirection
            </h3>
            <p className="text-blue-700 mb-4">
              Vous devriez être automatiquement redirigé vers le dashboard.
            </p>
            
            <div className="flex gap-4">
              <Link 
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Aller au Dashboard
              </Link>
              <Link 
                href="/auth"
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Tester la Page Auth
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="test-auth" />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Test de la Page d'Authentification
          </h2>
          <p className="text-gray-600">
            Vous n'êtes pas connecté. Testez la page d'authentification.
          </p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            ✅ État Non Connecté
          </h3>
          <div className="space-y-2 text-sm text-green-700">
            <p><strong>État utilisateur :</strong> Non connecté</p>
            <p><strong>Nombre de rendus :</strong> {renderCount}</p>
            <p><strong>Composant :</strong> Page de test d'authentification</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            🧪 Test de la Page Auth
          </h3>
          <p className="text-blue-700 mb-4">
            Cliquez sur le bouton ci-dessous pour tester la page d'authentification.
          </p>
          
          <div className="flex gap-4">
            <Link 
              href="/auth"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Tester la Page Auth
            </Link>
            <Link 
              href="/test-signout"
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Tester la Déconnexion
            </Link>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            📝 Instructions de Test
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>1. Cliquez sur "Tester la Page Auth"</p>
            <p>2. Vous devriez voir le formulaire de connexion/inscription</p>
            <p>3. Pas de page blanche - le contenu devrait s'afficher</p>
            <p>4. Testez la connexion ou l'inscription</p>
            <p>5. Regardez la console pour les logs de débogage</p>
          </div>
        </div>
      </main>
    </div>
  )
}
