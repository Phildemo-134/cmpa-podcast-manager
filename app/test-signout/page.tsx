'use client'

import { SignOutButton } from '../../components/auth/sign-out-button'
import { Header } from '../../components/ui/header'
import { useSupabaseAuth } from '../../hooks/use-supabase-auth'
import { useEffect, useState } from 'react'

export default function TestSignOutPage() {
  const { user, isLoading } = useSupabaseAuth()
  const [renderCount, setRenderCount] = useState(0)

  useEffect(() => {
    setRenderCount(prev => prev + 1)
    console.log('🔄 TestSignOutPage - Rendu #', renderCount + 1)
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="test-signout" />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Test de Déconnexion
            </h2>
            <p className="text-gray-600">
              Vous n'êtes pas connecté. La déconnexion a fonctionné correctement.
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ✅ Déconnexion Réussie
            </h3>
            <p className="text-green-700">
              Vous avez été déconnecté avec succès et redirigé vers cette page.
            </p>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              🔍 Informations de Débogage
            </h3>
            <div className="space-y-2 text-sm text-blue-700">
              <p><strong>Nombre de rendus :</strong> {renderCount}</p>
              <p><strong>État utilisateur :</strong> Non connecté</p>
              <p><strong>Composant :</strong> Page de test de déconnexion</p>
            </div>
          </div>

          <div className="mt-6">
            <a 
              href="/auth" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Se reconnecter
            </a>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="test-signout" />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Test de Déconnexion
          </h2>
          <p className="text-gray-600">
            Vous êtes actuellement connecté. Testez la déconnexion en cliquant sur le bouton ci-dessous.
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
            🧪 Test de Déconnexion
          </h3>
          <p className="text-blue-700 mb-4">
            Cliquez sur le bouton "Se déconnecter" ci-dessous pour tester la fonctionnalité de déconnexion.
          </p>
          
          <div className="flex items-center gap-4">
            <SignOutButton />
            <span className="text-sm text-gray-600">
              Ce bouton devrait vous déconnecter et vous rediriger
            </span>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            📝 Instructions de Test
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>1. Cliquez sur "Se déconnecter"</p>
            <p>2. Vous devriez être redirigé vers la page d'accueil</p>
            <p>3. Vérifiez que vous n'êtes plus connecté</p>
            <p>4. Regardez la console pour les logs de débogage</p>
          </div>
        </div>
      </main>
    </div>
  )
}
