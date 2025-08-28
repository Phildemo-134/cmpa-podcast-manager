'use client'

import { useRouter } from 'next/navigation'
import { useSupabaseAuth } from '../../hooks/use-supabase-auth'
import { Button } from '../ui/button'
import { LogOut } from 'lucide-react'
import { useState } from 'react'

export function SignOutButton() {
  const router = useRouter()
  const { signOut: authSignOut } = useSupabaseAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignOut() {
    try {
      setIsSigningOut(true)
      
      // Utiliser la fonction signOut du hook useSupabaseAuth
      await authSignOut()
      
      // Attendre un peu pour que l'état soit mis à jour
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Rediriger vers la page d'accueil
      router.push('/')
      
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      {isSigningOut ? 'Déconnexion...' : 'Se déconnecter'}
    </Button>
  )
}
