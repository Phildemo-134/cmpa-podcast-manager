'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSupabaseAuth } from '../../hooks/use-supabase-auth'
import { createClient } from '@supabase/supabase-js'
import { useToast } from '../ui'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface ProtectedRouteProps {
  children: React.ReactNode
  requireActiveSubscription?: boolean
}

export function ProtectedRoute({ 
  children, 
  requireActiveSubscription = true 
}: ProtectedRouteProps) {
  const { user, isLoading } = useSupabaseAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { showToast } = useToast()
  
  const [userSubscription, setUserSubscription] = useState<any>(null)
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  
  const hasCheckedSubscription = useRef(false)
  const hasAttemptedRedirect = useRef(false)
  const hasShownToast = useRef(false)

  // Vérification de l'abonnement (une seule fois)
  useEffect(() => {
    if (!requireActiveSubscription || !user || isLoading || hasCheckedSubscription.current) {
      return
    }

    hasCheckedSubscription.current = true
    setIsSubscriptionLoading(true)

    async function checkSubscription() {
      try {
        // Vérification de sécurité supplémentaire
        if (!user?.id) return
        
        const { data, error } = await supabase
          .from('users')
          .select('subscription_status, subscription_tier')
          .eq('id', user.id)
          .single()

        if (error) {
          // ✅ Gestion robuste de l'erreur avec vérification des propriétés
          // Cas spécial : si l'utilisateur n'existe pas encore, c'est normal
          if (error.code === 'PGRST116') {
            console.log('Utilisateur non trouvé dans la table users - Création du profil...')
            setUserSubscription({ subscription_status: 'inactive', subscription_tier: 'free' })
            return
          }
          
          const errorDetails = {
            message: error.message || 'Erreur inconnue',
            details: error.details || 'Aucun détail disponible',
            hint: error.hint || 'Aucune suggestion disponible',
            code: error.code || 'Aucun code d\'erreur'
          }
          
          console.error('Erreur lors de la vérification de l\'abonnement:', errorDetails)
          setUserSubscription({ subscription_status: 'inactive', subscription_tier: 'free' })
        } else if (data) {
          // ✅ Données trouvées
          setUserSubscription(data)
        } else {
          // ✅ Aucune donnée trouvée - utilisateur sans abonnement
          console.log('Aucun abonnement trouvé pour l\'utilisateur')
          setUserSubscription({ subscription_status: 'inactive', subscription_tier: 'free' })
        }
      } catch (err) {
        // ✅ Gestion des erreurs inattendues
        const errorMessage = err instanceof Error ? err.message : 'Erreur inattendue'
        console.error('Erreur inattendue lors de la vérification de l\'abonnement:', errorMessage)
        setUserSubscription({ subscription_status: 'inactive', subscription_tier: 'free' })
      } finally {
        setIsSubscriptionLoading(false)
      }
    }

    checkSubscription()
  }, [user, isLoading, requireActiveSubscription])

  // Gestion de la redirection et du toaster (une seule fois)
  useEffect(() => {
    // Conditions pour éviter les redirections multiples
    if (
      !requireActiveSubscription || 
      !userSubscription || 
      isRedirecting || 
      hasAttemptedRedirect.current ||
      pathname === '/settings'
    ) {
      return
    }

    const hasActiveSubscription = userSubscription.subscription_status === 'active' || 
                                userSubscription.subscription_status === 'trialing'

    // Si pas d'abonnement actif, afficher le toaster et rediriger
    if (!hasActiveSubscription) {
      hasAttemptedRedirect.current = true
      setIsRedirecting(true)
      
      // ✅ Afficher le toaster pour informer l'utilisateur
      if (!hasShownToast.current) {
        hasShownToast.current = true
        showToast(
          "Gérer votre abonnement pour accéder à cette page",
          "warning"
        )
      }
      
      console.log('Redirection vers /settings - Utilisateur non abonné')
      
      // Délai pour permettre au toaster de s'afficher
      setTimeout(() => {
        router.push('/settings')
      }, 2000)
    }
  }, [userSubscription, requireActiveSubscription, isRedirecting, router, pathname])

  // État de chargement global
  if (isLoading || (requireActiveSubscription && isSubscriptionLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Si l'utilisateur n'est pas connecté, ne rien afficher
  if (!user) {
    return null
  }

  // Si redirection en cours, afficher le loader avec message
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Redirection vers les réglages...</p>
          <p className="text-sm text-gray-500">Cette page nécessite un abonnement actif</p>
        </div>
      </div>
    )
  }

  // Si on attend les données d'abonnement
  if (requireActiveSubscription && !userSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Si l'utilisateur est connecté et a un abonnement actif (si requis), afficher le contenu
  return <>{children}</>
}
