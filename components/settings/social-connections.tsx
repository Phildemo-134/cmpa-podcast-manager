'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Twitter, Linkedin, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { TwitterConnectButton } from './twitter-connect-button'
import { useSupabaseAuth } from '@/hooks/use-supabase-auth'
import { createClient } from '@supabase/supabase-js'

interface SocialConnection {
  id: string
  platform: 'twitter' | 'linkedin'
  platform_username: string
  is_active: boolean
  permissions: string[]
  updated_at: string
}

export function SocialConnections() {
  const { user, isLoading: isLoadingAuth, error, refreshSession } = useSupabaseAuth()
  const [connections, setConnections] = useState<SocialConnection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  
  // Références pour éviter les boucles infinies
  const isFetching = useRef(false)
  const hasInitialFetch = useRef(false)
 
  // Vérifier les paramètres d'URL pour les messages
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const error = urlParams.get('error')
    
    if (success === 'twitter_connected') {
      setMessage({ type: 'success', text: 'Compte Twitter connecté avec succès !' })
      // Nettoyer l'URL
      window.history.replaceState({}, '', '/settings')
      // Recharger les connexions après un délai pour laisser le temps à la base de données
      setTimeout(() => {
        if (!isFetching.current) {
          fetchConnections()
        }
      }, 1000)
    } else if (error) {
      const errorMessages: Record<string, string> = {
        'twitter_auth_failed': 'Échec de l\'authentification Twitter',
        'invalid_callback': 'Paramètres de retour invalides',
        'config_missing': 'Configuration Twitter manquante',
        'invalid_state': 'État de sécurité invalide',
        'expired_state': 'Session expirée, veuillez réessayer',
        'token_exchange_failed': 'Échec de l\'échange de tokens',
        'user_info_failed': 'Impossible de récupérer les informations utilisateur',
        'save_failed': 'Erreur lors de la sauvegarde',
        'callback_failed': 'Erreur lors du retour OAuth2'
      }
      setMessage({ type: 'error', text: errorMessages[error] || 'Une erreur est survenue' })
      // Nettoyer l'URL
      window.history.replaceState({}, '', '/settings')
    }
  }, [])

  // Charger les connexions une seule fois quand l'utilisateur est disponible
  useEffect(() => {
    if (user && !hasInitialFetch.current && !isFetching.current) {
      hasInitialFetch.current = true
      fetchConnections()
    }
  }, [user])

  const fetchConnections = useCallback(async () => {
    if (!user || isFetching.current) {
      return
    }

    isFetching.current = true
    setIsLoading(true)

    try {
      // Créer un client Supabase côté client
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Requête directe à la base de données
      const { data: connections, error: fetchError } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', user.id)

      if (fetchError) {
        console.error('Erreur lors de la récupération des connexions:', fetchError)
        setMessage({ type: 'error', text: 'Erreur lors du chargement des connexions' })
      } else {
        setConnections(connections || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des connexions:', error)
      setMessage({ type: 'error', text: 'Erreur lors du chargement des connexions' })
    } finally {
      setIsLoading(false)
      isFetching.current = false
    }
  }, [user])

  async function disconnectSocial(platform: string) {
    if (!user) return

    try {
      // Créer un client Supabase côté client
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Supprimer directement la connexion
      const { error } = await supabase
        .from('social_connections')
        .delete()
        .eq('user_id', user.id)
        .eq('platform', platform)

      if (error) {
        console.error(`Erreur lors de la déconnexion ${platform}:`, error)
      } else {
        // Mettre à jour la liste des connexions
        setConnections(prev => prev.filter(conn => conn.platform !== platform))
      }
    } catch (error) {
      console.error(`Erreur lors de la déconnexion ${platform}:`, error)
    }
  }

  function getPlatformIcon(platform: string) {
    switch (platform) {
      case 'twitter':
        return <Twitter className="w-5 h-5" />
      case 'linkedin':
        return <Linkedin className="w-5 h-5" />
      default:
        return null
    }
  }

  function getPlatformName(platform: string) {
    switch (platform) {
      case 'twitter':
        return 'Twitter'
      case 'linkedin':
        return 'LinkedIn'
      default:
        return platform
    }
  }

  function getStatusIcon(isActive: boolean) {
    return isActive ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const twitterConnection = connections.find(conn => conn.platform === 'twitter')
  const linkedinConnection = connections.find(conn => conn.platform === 'linkedin')

  return (
    <div className="space-y-6">
      {/* Gestionnaire d'erreur d'authentification simple */}
      {authError && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-800">{authError}</span>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setAuthError(null)
                  fetchConnections()
                }} 
                size="sm" 
                variant="outline"
              >
                Réessayer
              </Button>
              <Button 
                onClick={() => {
                  setAuthError(null)
                  window.location.href = '/auth'
                }} 
                size="sm"
              >
                Se reconnecter
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Messages d'erreur et de succès */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Twitter Connection */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Twitter className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Twitter</h3>
              <p className="text-sm text-gray-600">
                Publiez automatiquement vos épisodes sur Twitter
              </p>
            </div>
          </div>
          
          {twitterConnection ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(twitterConnection.is_active)}
                <span className="text-sm text-gray-600">
                  Connecté en tant que @{twitterConnection.platform_username}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => disconnectSocial('twitter')}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Déconnecter
              </Button>
            </div>
          ) : (
            <TwitterConnectButton />
          )}
        </div>
        
        {twitterConnection && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Dernière mise à jour: {new Date(twitterConnection.updated_at).toLocaleDateString('fr-FR')}</span>
              <span>Permissions: {twitterConnection.permissions.join(', ')}</span>
            </div>
          </div>
        )}
      </Card>

      {/* LinkedIn Connection */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Linkedin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">LinkedIn</h3>
              <p className="text-sm text-gray-600">
                Publiez automatiquement vos épisodes sur LinkedIn
              </p>
            </div>
          </div>
          
          {linkedinConnection ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(linkedinConnection.is_active)}
                <span className="text-sm text-gray-600">
                  Connecté en tant que {linkedinConnection.platform_username}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => disconnectSocial('linkedin')}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Déconnecter
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              disabled
              className="opacity-50 cursor-not-allowed"
            >
              Bientôt disponible
            </Button>
          )}
        </div>
        
        {linkedinConnection && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Dernière mise à jour: {new Date(linkedinConnection.updated_at).toLocaleDateString('fr-FR')}</span>
              <span>Permissions: {linkedinConnection.permissions.join(', ')}</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
