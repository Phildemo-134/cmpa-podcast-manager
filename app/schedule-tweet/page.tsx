'use client'

import { useState, useEffect } from 'react'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Header } from '../../components/ui/header'
import { useSupabaseAuth } from '../../hooks/use-supabase-auth'
import { ScheduledTweet } from '../../types/database'

export default function ScheduleTweetPage() {
  const { user } = useSupabaseAuth()
  const [tweetContent, setTweetContent] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scheduledTweets, setScheduledTweets] = useState<ScheduledTweet[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [error, setError] = useState('')

  // Générer la date et heure actuelles pour le min de l'input
  const now = new Date()
  const minDate = now.toISOString().split('T')[0]
  const minTime = now.toTimeString().slice(0, 5)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!tweetContent.trim() || !scheduledDate || !scheduledTime) {
      return
    }

    setIsSubmitting(true)

    try {
      if (!user) {
        setError('Vous devez être connecté pour planifier un tweet')
        return
      }

      const response = await fetch('/api/schedule-tweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: tweetContent,
          scheduledDate,
          scheduledTime,
          userId: user.id
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la planification')
      }

      const { tweet } = await response.json()
      setScheduledTweets(prev => [tweet, ...prev])
      setTweetContent('')
      setScheduledDate('')
      setScheduledTime('')
      setSuccessMessage('Tweet planifié avec succès !')
      setShowSuccess(true)
      setError('')
      
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Erreur lors de la planification:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors de la planification')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Charger les tweets existants au montage du composant
  useEffect(() => {
    if (user) {
      loadScheduledTweets()
    }
  }, [user])

  const loadScheduledTweets = async () => {
    try {
      const response = await fetch(`/api/schedule-tweet?userId=${user?.id}`)
      if (response.ok) {
        const { tweets } = await response.json()
        setScheduledTweets(tweets)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tweets:', error)
    }
  }

  const handleCancelTweet = async (id: string) => {
    try {
      const response = await fetch('/api/schedule-tweet/cancel', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tweetId: id,
          userId: user?.id
        }),
      })

      if (response.ok) {
        setScheduledTweets(prev => 
          prev.map(tweet => 
            tweet.id === id 
              ? { ...tweet, status: 'cancelled' as const }
              : tweet
          )
        )
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors de l\'annulation')
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error)
      setError('Erreur lors de l\'annulation du tweet')
    }
  }

  const handleDeleteTweet = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cette publication ?')) {
      return
    }

    try {
      const response = await fetch('/api/schedule-tweet/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tweetId: id,
          userId: user?.id
        }),
      })

      if (response.ok) {
        setScheduledTweets(prev => prev.filter(tweet => tweet.id !== id))
        setSuccessMessage('Publication supprimée avec succès !')
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setError('Erreur lors de la suppression du tweet')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'published': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'published': return 'Publié'
      case 'cancelled': return 'Annulé'
      default: return 'Inconnu'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="schedule-tweet" />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Publications
          </h2>
          <p className="text-gray-600">
            Écrivez votre tweet et planifiez sa publication pour plus tard
          </p>
        </div>

        {/* Formulaire de planification */}
        <Card className="p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="tweetContent" className="block text-sm font-medium text-gray-700 mb-2">
                Contenu du Tweet
              </Label>
              <textarea
                id="tweetContent"
                value={tweetContent}
                onChange={(e) => setTweetContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Écrivez votre tweet ici... (280 caractères max)"
                maxLength={280}
                required
              />
              <div className="mt-2 text-sm text-gray-500 text-right">
                {tweetContent.length}/280 caractères
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Date de publication
                </Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={minDate}
                  required
                />
              </div>

              <div>
                <Label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de publication
                </Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  min={minTime}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || !tweetContent.trim() || !scheduledDate || !scheduledTime}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Planification...' : 'Planifier le Tweet'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Message de succès */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Liste des tweets planifiés */}
        {scheduledTweets.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tweets Planifiés
            </h3>
            <div className="space-y-4">
              {scheduledTweets.map((tweet) => (
                <Card key={tweet.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-900 mb-2">{tweet.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          Publié le {new Date(`${tweet.scheduled_date}T${tweet.scheduled_time}`).toLocaleDateString('fr-FR')} 
                          à {tweet.scheduled_time}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tweet.status)}`}>
                          {getStatusText(tweet.status)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {tweet.status === 'pending' && (
                        <Button
                          onClick={() => handleCancelTweet(tweet.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Annuler
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDeleteTweet(tweet.id)}
                        variant="outline"
                        size="sm"
                        className="text-gray-600 border-gray-300 hover:bg-gray-50"
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {scheduledTweets.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun tweet planifié
            </h3>
            <p className="text-gray-500">
              Planifiez votre premier tweet en utilisant le formulaire ci-dessus
            </p>
          </Card>
        )}
      </main>
    </div>
  )
}
