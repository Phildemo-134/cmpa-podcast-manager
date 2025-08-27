'use client'

import { Button } from '../../components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function UploadTestPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                Test Upload (Version Simple)
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Page de Test Upload
          </h2>
          <p className="text-gray-600 mb-4">
            Cette page de test évite les hooks problématiques pour vérifier que la structure fonctionne.
          </p>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ✅ Page de test chargée avec succès - Pas de boucle infinie détectée
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Test 1: Structure de Base
            </h3>
            <p className="text-gray-600 mb-4">
              Cette carte confirme que la page se rend correctement.
            </p>
            <Button onClick={() => alert('Test réussi !')}>
              Tester le Bouton
            </Button>
          </div>
          
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Test 2: Navigation
            </h3>
            <p className="text-gray-600 mb-4">
              Test de navigation vers d'autres pages.
            </p>
            <Button 
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Aller au Dashboard
            </Button>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            ✅ Test Réussi
          </h3>
          <p className="text-green-800">
            Si vous voyez cette page, la structure de base fonctionne correctement. 
            Le problème de boucle infinie était probablement causé par les hooks de gestion d'abonnement.
          </p>
        </div>
      </main>
    </div>
  )
}
