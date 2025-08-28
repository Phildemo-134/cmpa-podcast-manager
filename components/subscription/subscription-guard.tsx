'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSupabaseAuth } from '@/hooks/use-supabase-auth'
import { useSubscription } from '@/hooks/use-subscription'

interface SubscriptionGuardProps {
  children: React.ReactNode
  redirectTo?: string
  showLoader?: boolean
}

export function SubscriptionGuard({ 
  children, 
  redirectTo = '/settings',
  showLoader = true
}: SubscriptionGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading: authLoading } = useSupabaseAuth()
  const { subscription, isLoading: subscriptionLoading } = useSubscription()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // Si l'authentification ou la vérification d'abonnement est en cours, attendre
    if (authLoading || subscriptionLoading) {
      return
    }

    // Si pas d'utilisateur, ne rien faire (ProtectedRoute s'en charge)
    if (!user) {
      return
    }

    // Vérifier si l'utilisateur a un abonnement actif ou en essai
    const hasActiveSubscription = subscription?.isActive || subscription?.isTrialing

    // Si pas d'abonnement actif et qu'on n'est pas déjà sur la page de redirection
    if (!hasActiveSubscription && pathname !== redirectTo) {
      setIsRedirecting(true)
      router.push(redirectTo)
    }
  }, [user, subscription, authLoading, subscriptionLoading, pathname, redirectTo, router])

  // État de chargement
  if (authLoading || subscriptionLoading) {
    if (showLoader) {
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
    return null
  }

  // Pas d'utilisateur
  if (!user) {
    return null
  }

  // Si redirection en cours
  if (isRedirecting) {
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

  // Vérifier l'abonnement
  const hasActiveSubscription = subscription?.isActive || subscription?.isTrialing

  // Si pas d'abonnement actif et qu'on n'est pas sur la page de redirection
  if (!hasActiveSubscription && pathname !== redirectTo) {
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
