'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '../ui/button'
import { ExternalLink } from 'lucide-react'
import { useSupabaseAuth } from '../../hooks/use-supabase-auth'

// Configuration Supabase côté client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function TwitterConnectButton() {
  const [isConnecting, setIsConnecting] = useState(false)
  const { user, isLoading, error, refreshSession } = useSupabaseAuth()

  async function connectTwitter() {
    try {
      if (!user) {
        console.error('Aucun utilisateur connecté')
        // Essayer de rafraîchir la session d'abord
        await refreshSession()
        
        if (!user) {
          window.location.href = '/auth'
          return
        }
      }

      setIsConnecting(true)

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // Générer un state sécurisé pour la protection CSRF
      const state = crypto.randomUUID()
      
      // Stocker le state dans la base de données
      const { error: stateError } = await supabase
        .from('oauth_states')
        .insert({
          user_id: user.id,
          state: state,
          platform: 'twitter',
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
        })

      if (stateError) {
        console.error('Erreur lors du stockage du state:', stateError)
        throw new Error('Erreur lors de la préparation de la connexion')
      }

      // Générer un code challenge PKCE
      const codeVerifier = crypto.randomUUID()
      const codeChallenge = await generateCodeChallenge(codeVerifier)
      
      // Stocker le code verifier
      const { error: verifierError } = await supabase
        .from('oauth_states')
        .update({ code_verifier: codeVerifier })
        .eq('state', state)

      if (verifierError) {
        console.error('Erreur lors du stockage du code verifier:', verifierError)
      }

      // Construire l'URL d'autorisation Twitter
      const twitterAuthUrl = new URL('https://twitter.com/i/oauth2/authorize')
      twitterAuthUrl.searchParams.set('response_type', 'code')
      twitterAuthUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || '')
      twitterAuthUrl.searchParams.set('redirect_uri', `${window.location.origin}/api/auth/twitter/callback`)
      twitterAuthUrl.searchParams.set('scope', 'tweet.read tweet.write users.read offline.access')
      twitterAuthUrl.searchParams.set('state', state)
      twitterAuthUrl.searchParams.set('code_challenge_method', 'S256')
      twitterAuthUrl.searchParams.set('code_challenge', codeChallenge)

          if (process.env.NODE_ENV === 'development') {
      if (process.env.NODE_ENV === 'development') {
        console.log('Redirection vers Twitter OAuth2:', twitterAuthUrl.toString());
      }
      if (process.env.NODE_ENV === 'development') {
        console.log('Utilisateur connecté:', user.email);
      }
    }
      
      // Rediriger vers Twitter
      window.location.href = twitterAuthUrl.toString()

    } catch (error) {
      console.error('Erreur lors de la connexion Twitter:', error)
      alert('Erreur lors de la connexion Twitter. Veuillez réessayer.')
    } finally {
      setIsConnecting(false)
    }
  }

  // Fonction pour générer le code challenge PKCE
  async function generateCodeChallenge(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(codeVerifier)
    const digest = await crypto.subtle.digest('SHA-256', data)
    
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  }

  // Si en cours de chargement, afficher un bouton désactivé
  if (isLoading) {
    return (
      <Button disabled className="bg-gray-400 cursor-not-allowed">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Vérification...
      </Button>
    )
  }

  // Si pas d'utilisateur, afficher un bouton qui redirige vers la connexion
  if (!user) {
    return (
      <Button 
        onClick={() => window.location.href = '/auth'}
        className="bg-red-600 hover:bg-red-700"
      >
        Se connecter d'abord
      </Button>
    )
  }

  // Si il y a une erreur, afficher un bouton pour rafraîchir
  if (error) {
    return (
      <Button 
        onClick={refreshSession}
        className="bg-yellow-600 hover:bg-yellow-700"
      >
        Rafraîchir la session
      </Button>
    )
  }

  return (
    <Button
      onClick={connectTwitter}
      disabled={isConnecting}
      className="bg-blue-600 hover:bg-blue-700"
    >
      {isConnecting ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      ) : (
        <ExternalLink className="w-4 h-4 mr-2" />
      )}
      Se connecter
    </Button>
  )
}
