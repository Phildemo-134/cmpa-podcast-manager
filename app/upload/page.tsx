'use client'

import { AudioUpload } from '../../components/upload/audio-upload'
import { Button } from '../../components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '../../components/auth/protected-route'
import { SubscriptionToastGuard } from '../../components/subscription'

export default function UploadPage() {
  const router = useRouter()

  return (
    <ProtectedRoute>
      <SubscriptionToastGuard>
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
                    Ajouter un épisode
                  </h1>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <p className="text-gray-600">
                Uploadez votre fichier audio et ajoutez les métadonnées de base
              </p>
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ Votre abonnement est actif. Vous pouvez utiliser toutes les fonctionnalités d'upload et de traitement.
                </p>
              </div>
            </div>
            
            <AudioUpload />
          </main>
        </div>
      </SubscriptionToastGuard>
    </ProtectedRoute>
  )
}
