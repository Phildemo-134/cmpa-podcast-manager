'use client'

import { Button } from '../../components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function UploadMinimalPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
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
                Page Upload Minimaliste
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ✅ Page de Test Fonctionnelle
          </h2>
          <p className="text-gray-600 mb-6">
            Cette page minimaliste fonctionne sans problème. Si vous la voyez, la structure de base est correcte.
          </p>
          
          <div className="space-y-4">
            <Button 
              onClick={() => alert('Test réussi !')}
              className="bg-green-600 hover:bg-green-700"
            >
              Tester l'Interaction
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="ml-4"
            >
              Aller au Dashboard
            </Button>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              🎯 Cette page confirme que le problème n'est pas dans la structure de base, 
              mais probablement dans les hooks ou la logique d'authentification.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
