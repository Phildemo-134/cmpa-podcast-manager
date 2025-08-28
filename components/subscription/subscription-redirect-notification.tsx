'use client'

import { useEffect, useState } from 'react'
import { useSubscription } from '@/hooks/use-subscription'
import { usePathname } from 'next/navigation'

interface SubscriptionRedirectNotificationProps {
  className?: string
}

export function SubscriptionRedirectNotification({ 
  className = '' 
}: SubscriptionRedirectNotificationProps) {
  const { subscription } = useSubscription()
  const pathname = usePathname()
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    // Afficher la notification si l'utilisateur est sur la page des réglages
    // et qu'il n'a pas d'abonnement actif
    if (pathname === '/settings' && subscription) {
      const hasActiveSubscription = subscription.isActive || subscription.isTrialing
      setShowNotification(!hasActiveSubscription)
    }
  }, [pathname, subscription])

  if (!showNotification) {
    return null
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">
            Accès limité détecté
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>
              Vous avez été redirigé vers cette page car votre compte ne dispose pas d'un abonnement actif. 
              Pour accéder à toutes les fonctionnalités du CMPA Podcast Manager, veuillez souscrire à un plan.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
