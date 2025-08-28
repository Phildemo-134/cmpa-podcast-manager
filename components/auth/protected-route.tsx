'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSupabaseAuth } from '../../hooks/use-supabase-auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface UserSubscription {
  subscription_status: string;
  subscription_tier: string;
}

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  requireActiveSubscription?: boolean
}

export function ProtectedRoute({ 
  children, 
  redirectTo = '/auth',
  requireActiveSubscription = false
}: ProtectedRouteProps) {
  const { user, isLoading } = useSupabaseAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null)
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectTo)
    }
  }, [user, isLoading, router, redirectTo])

  // Vérifier l'abonnement si requis
  useEffect(() => {
    if (!requireActiveSubscription || !user || isLoading) return

    let isMounted = true

    async function checkSubscription() {
      setIsSubscriptionLoading(true)
      try {
        const { data, error } = await supabase
          .from('users')
          .select('subscription_status, subscription_tier')
          .eq('id', user.id)
          .single()

        if (!isMounted) return

        if (error) {
          console.error('Erreur lors de la vérification de l\'abonnement:', error)
          // En cas d'erreur, considérer qu'il n'y a pas d'abonnement actif
          setUserSubscription({ subscription_status: 'inactive', subscription_tier: 'free' })
        } else {
          setUserSubscription(data)
        }
      } catch (err) {
        console.error('Erreur inattendue lors de la vérification de l\'abonnement:', err)
        setUserSubscription({ subscription_status: 'inactive', subscription_tier: 'free' })
      } finally {
        if (isMounted) {
          setIsSubscriptionLoading(false)
        }
      }
    }

    checkSubscription()

    return () => {
      isMounted = false
    }
  }, [user, isLoading, requireActiveSubscription])

  // État de chargement global
  if (isLoading || (requireActiveSubscription && isSubscriptionLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Si l'utilisateur n'est pas connecté, ne rien afficher (redirection en cours)
  if (!user) {
    return null
  }

  // Si on requiert un abonnement actif, vérifier le statut
  if (requireActiveSubscription && userSubscription) {
    const hasActiveSubscription = userSubscription.subscription_status === 'active' || 
                                userSubscription.subscription_status === 'trialing'

    // Si pas d'abonnement actif et qu'on n'est pas déjà sur la page des réglages
    if (!hasActiveSubscription && pathname !== '/settings') {
      // Redirection vers la page des réglages
      router.push('/settings')
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirection vers les réglages...</p>
          </div>
        </div>
      )
    }
  }

  // Si l'utilisateur est connecté et a un abonnement actif (si requis), afficher le contenu protégé
  return <>{children}</>
}
