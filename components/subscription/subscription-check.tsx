'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface UserSubscription {
  subscription_status: string;
  subscription_tier: string;
}

interface SubscriptionCheckProps {
  children: React.ReactNode
  redirectTo?: string
}

export function SubscriptionCheck({ 
  children, 
  redirectTo = '/settings'
}: SubscriptionCheckProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    let isMounted = true

    async function checkSubscription() {
      try {
        // Vérifier l'authentification
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!isMounted) return
        
        if (!session?.user) {
          // Si pas d'utilisateur, rediriger vers l'auth
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
          console.error('Erreur lors de la récupération du statut d\'abonnement:', subError)
          // En cas d'erreur, on considère qu'il n'y a pas d'abonnement actif
          setUserSubscription({ subscription_status: 'inactive', subscription_tier: 'free' })
        } else {
          setUserSubscription(data)
        }
      } catch (err) {
        console.error('Erreur inattendue:', err)
        // En cas d'erreur, on considère qu'il n'y a pas d'abonnement actif
        setUserSubscription({ subscription_status: 'inactive', subscription_tier: 'free' })
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    checkSubscription()

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
            <p className="text-gray-600">Vérification de l'abonnement...</p>
          </div>
        </div>
      </div>
    )
  }

  // Pas d'utilisateur
  if (!user) {
    return null
  }

  // Vérifier l'abonnement
  const hasActiveSubscription = userSubscription?.subscription_status === 'active' || 
                              userSubscription?.subscription_status === 'trialing'

  // Si pas d'abonnement actif et qu'on n'est pas déjà sur la page des réglages
  if (!hasActiveSubscription && pathname !== redirectTo) {
    // Redirection vers la page des réglages
    router.push(redirectTo)
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirection vers les réglages...</p>
          </div>
        </div>
      </div>
    )
  }

  // Si on a un abonnement actif ou qu'on est sur la page des réglages, afficher le contenu
  return <>{children}</>
}
