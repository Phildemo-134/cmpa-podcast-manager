import { useState, useEffect } from 'react'
import { createClient, User, Session } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Récupérer la session initiale
    const getInitialSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Erreur lors de la récupération de la session:', sessionError)
          setError(sessionError.message)
        } else if (session) {
          setSession(session)
          setUser(session.user)
        }
      } catch (err) {
        console.error('Erreur inattendue:', err)
        setError('Erreur inattendue lors de la vérification de la session')
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Changement d\'état d\'authentification:', event, session?.user?.email)
        
        if (session) {
          setSession(session)
          setUser(session.user)
          setError(null)
        } else {
          setSession(null)
          setUser(null)
        }
        
        setIsLoading(false)
      }
    )

    // Nettoyer l'abonnement
    return () => subscription.unsubscribe()
  }, [])

  // Fonction pour se déconnecter
  const signOut = async () => {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Erreur lors de la déconnexion:', error)
        setError(error.message)
      } else {
        setUser(null)
        setSession(null)
      }
    } catch (err) {
      console.error('Erreur inattendue lors de la déconnexion:', err)
      setError('Erreur inattendue lors de la déconnexion')
    }
  }

  // Fonction pour rafraîchir la session
  const refreshSession = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Erreur lors du rafraîchissement de la session:', error)
        setError(error.message)
      } else if (session) {
        setSession(session)
        setUser(session.user)
        setError(null)
      } else {
        setUser(null)
        setSession(null)
      }
    } catch (err) {
      console.error('Erreur inattendue lors du rafraîchissement:', err)
      setError('Erreur inattendue lors du rafraîchissement de la session')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    user,
    session,
    isLoading,
    error,
    signOut,
    refreshSession,
    isAuthenticated: !!user
  }
}
