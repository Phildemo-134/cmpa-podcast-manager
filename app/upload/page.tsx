'use client'

import { AudioUpload } from '../../components/upload/audio-upload'
import { Button } from '../../components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface UserSubscription {
  subscription_status: string;
  subscription_tier: string;
}

export default function UploadPage() {
  const router = useRouter()
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function checkAuthAndSubscription() {
      try {
        // Vérifier l'authentification
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!isMounted) return
        
        if (!session?.user) {
          router.push('/auth')
          return
        }

        setUser(session.user)

        // Récupérer le statut d'abonnement
        const { data, error: subError } = await supabase
          .from('users')
          .select('subscription_status, subscription_tier')
          .eq('id', session.user.id)
          .single()

        if (!isMounted) return

        if (subError) {
          setError('Erreur lors de la récupération du statut d\'abonnement')
        } else {
          setUserSubscription(data)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError('Une erreur inattendue est survenue')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    checkAuthAndSubscription()

    return () => {
      isMounted = false
    }
  }, [router])

  // État de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de la page upload...</p>
          </div>
        </div>
      </div>
    )
  }

  // Pas d'utilisateur
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Redirection vers la page de connexion...</p>
            <Button onClick={() => router.push('/auth')}>
              Se connecter
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Erreur
  if (error) {
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
                  Erreur
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Erreur de chargement
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Recharger la page
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Vérifier l'abonnement
  const hasActiveSubscription = userSubscription?.subscription_status === 'active' || 
                              userSubscription?.subscription_status === 'trialing'

  // Pas d'abonnement actif
  if (!hasActiveSubscription) {
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
                  Ajouter un épisode
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Fonctionnalité Premium
              </h3>
              <p className="text-gray-600 mb-4">
                Cette fonctionnalité nécessite un abonnement actif.
              </p>
              <Button
                onClick={() => router.push('/settings')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Voir les plans d'abonnement
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Page principale avec abonnement actif
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
  )
}
