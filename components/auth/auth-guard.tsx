'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseAuth } from '../../hooks/use-supabase-auth'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

export function AuthGuard({ children, redirectTo = '/dashboard' }: AuthGuardProps) {
  const { user, isLoading } = useSupabaseAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push(redirectTo)
    }
  }, [user, isLoading, router, redirectTo])

  // Afficher un loader pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Si l'utilisateur est connecté, ne rien afficher (redirection en cours)
  if (user) {
    return null
  }

  // Si l'utilisateur n'est pas connecté, afficher le contenu
  return <>{children}</>
}
