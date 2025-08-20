'use client'

import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Calendar, Clock, X, Check, AlertCircle, Database, Wrench } from 'lucide-react'

interface ScheduledTweet {
  id: string
  content: string
  scheduled_date: string
  scheduled_time: string
  status: 'pending' | 'published' | 'cancelled' | 'failed'
  created_at: string
  metadata?: {
    original_content: string
    hashtags: string[]
    episode_id: string
  }
}

interface ScheduledTweetsProps {
  episodeId: string
}

export function ScheduledTweets({ episodeId }: ScheduledTweetsProps) {
  const [scheduledTweets, setScheduledTweets] = useState<ScheduledTweet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsMigration, setNeedsMigration] = useState(false)

  useEffect(() => {
    fetchScheduledTweets()
  }, [episodeId])

  const fetchScheduledTweets = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setNeedsMigration(false)

      const response = await fetch(`/api/schedule-tweet?episodeId=${episodeId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        
        // Vérifier si l'erreur est liée à la structure de la base de données
        if (errorData.error && errorData.error.includes('episode_id')) {
          setNeedsMigration(true)
          setError('La base de données nécessite une mise à jour pour supporter la planification par épisode')
        } else {
          throw new Error(errorData.error || 'Erreur lors de la récupération des tweets planifiés')
        }
        return
      }

      const { tweets } = await response.json()
      setScheduledTweets(tweets || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }

  const cancelTweet = async (tweetId: string) => {
    try {
      const response = await fetch(`/api/schedule-tweet/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tweetId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de l\'annulation')
      }

      // Mettre à jour la liste locale
      setScheduledTweets(prev => prev.map(tweet => 
        tweet.id === tweetId 
          ? { ...tweet, status: 'cancelled' as const }
          : tweet
      ))

      alert('Tweet annulé avec succès')
    } catch (err) {
      alert(`Erreur lors de l'annulation: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'published':
        return 'text-green-600 bg-green-100'
      case 'cancelled':
        return 'text-gray-600 bg-gray-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3" />
      case 'published':
        return <Check className="h-3 w-3" />
      case 'cancelled':
        return <X className="h-3 w-3" />
      case 'failed':
        return <AlertCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente'
      case 'published':
        return 'Publié'
      case 'cancelled':
        return 'Annulé'
      case 'failed':
        return 'Échec'
      default:
        return 'Inconnu'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tweets Planifiés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des tweets planifiés...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (needsMigration) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tweets Planifiés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Database className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Mise à jour de la base de données requise</h3>
            <p className="text-gray-600 mb-4">
              Pour utiliser la fonctionnalité de planification des tweets, la base de données doit être mise à jour.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-left">
              <h4 className="font-medium text-yellow-800 mb-2">Pour résoudre ce problème :</h4>
              <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
                <li>Exécutez la commande : <code className="bg-yellow-100 px-2 py-1 rounded">npm run migrate:tweets</code></li>
                <li>Redémarrez l'application</li>
                <li>La fonctionnalité sera alors disponible</li>
              </ol>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="text-blue-600 hover:text-blue-700"
              >
                <Wrench className="h-4 w-4 mr-2" />
                Réessayer après migration
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Tweets Planifiés
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {scheduledTweets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Aucun tweet planifié</p>
            <p className="text-sm mt-2">Planifiez des tweets depuis la section "Publication Réseaux Sociaux"</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              {scheduledTweets.length} tweet{scheduledTweets.length > 1 ? 's' : ''} planifié{scheduledTweets.length > 1 ? 's' : ''}
            </div>
            
            {scheduledTweets.map((tweet) => (
              <Card key={tweet.id} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-gray-900 mb-2">{tweet.content}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(tweet.scheduled_date).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {tweet.scheduled_time}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tweet.status)}`}>
                          {getStatusIcon(tweet.status)}
                          {getStatusText(tweet.status)}
                        </span>
                      </div>
                    </div>
                    
                    {tweet.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelTweet(tweet.id)}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Annuler
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
