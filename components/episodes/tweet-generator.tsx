'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Loader2, RefreshCw, Twitter, Copy, Check, Edit, Calendar, X, Save } from 'lucide-react'

interface Tweet {
  content: string
  hashtags: string[]
}

interface TweetGeneratorProps {
  episodeId: string
  hasTranscription: boolean
}

export function TweetGenerator({ episodeId, hasTranscription }: TweetGeneratorProps) {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editHashtags, setEditHashtags] = useState('')
  const [isScheduling, setIsScheduling] = useState<number | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')

  const generateTweets = async () => {
    if (!hasTranscription) return

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ episodeId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la génération des tweets')
      }

      const { tweets: generatedTweets } = await response.json()
      setTweets(generatedTweets)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyTweet = async (tweet: Tweet, index: number) => {
    try {
      const tweetText = `${tweet.content} ${tweet.hashtags.map(tag => `#${tag}`).join(' ')}`
      await navigator.clipboard.writeText(tweetText)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
    }
  }

  const copyAllTweets = async () => {
    if (tweets.length === 0) return

    try {
      const allTweets = tweets.map((tweet, index) => 
        `${index + 1}. ${tweet.content} ${tweet.hashtags.map(tag => `#${tag}`).join(' ')}`
      ).join('\n\n')
      
      await navigator.clipboard.writeText(allTweets)
      alert('Tous les tweets ont été copiés !')
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
    }
  }

  const startEditing = (index: number) => {
    const tweet = tweets[index]
    setEditingIndex(index)
    setEditContent(tweet.content)
    setEditHashtags(tweet.hashtags.join(', '))
  }

  const cancelEditing = () => {
    setEditingIndex(null)
    setEditContent('')
    setEditHashtags('')
  }

  const saveEdit = () => {
    if (editingIndex === null) return

    const hashtags = editHashtags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => tag.startsWith('#') ? tag.substring(1) : tag)

    const updatedTweets = [...tweets]
    updatedTweets[editingIndex] = {
      content: editContent,
      hashtags
    }
    
    setTweets(updatedTweets)
    setEditingIndex(null)
    setEditContent('')
    setEditHashtags('')
  }

  const startScheduling = (index: number) => {
    setIsScheduling(index)
    // Définir la date par défaut à demain
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setScheduleDate(tomorrow.toISOString().split('T')[0])
    setScheduleTime('12:00')
  }

  const cancelScheduling = () => {
    setIsScheduling(null)
    setScheduleDate('')
    setScheduleTime('')
  }

  const scheduleTweet = async (index: number) => {
    if (!scheduleDate || !scheduleTime) return

    try {
      const tweet = tweets[index]
      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`)
      
      // Appeler l'API de planification
      const response = await fetch('/api/schedule-tweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          episodeId,
          content: tweet.content,
          scheduledDate: scheduleDate,
          scheduledTime: scheduleTime
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la planification')
      }

      alert(`Tweet planifié pour le ${scheduledDateTime.toLocaleDateString('fr-FR')} à ${scheduledDateTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`)
      cancelScheduling()
    } catch (err) {
      alert(`Erreur lors de la planification: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
    }
  }

  if (!hasTranscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Twitter className="h-5 w-5" />
            Publication Réseaux Sociaux
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Twitter className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Génération de tweets non disponible</p>
            <p className="text-sm mt-2">Une transcription est nécessaire pour générer des tweets</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Twitter className="h-5 w-5" />
            Publication Réseaux Sociaux
          </CardTitle>
          <div className="flex gap-2">
            {tweets.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={copyAllTweets}
                className="text-sm"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copier tout
              </Button>
            )}
            <Button
              onClick={generateTweets}
              disabled={isGenerating}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Génération...
                </>
              ) : tweets.length > 0 ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Régénérer
                </>
              ) : (
                <>
                  <Twitter className="h-3 w-3 mr-1" />
                  Générer des tweets
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {tweets.length === 0 && !isGenerating && (
          <div className="text-center py-8 text-gray-500">
            <Twitter className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Aucun tweet généré</p>
            <p className="text-sm mt-2">Cliquez sur "Générer des tweets" pour commencer</p>
          </div>
        )}

        {isGenerating && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Génération des tweets en cours...</p>
          </div>
        )}

        {tweets.length > 0 && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              {tweets.length} tweet{tweets.length > 1 ? 's' : ''} généré{tweets.length > 1 ? 's' : ''}
            </div>
            
            {tweets.map((tweet, index) => (
              <Card key={index} className="border-gray-200">
                <CardContent className="p-4">
                  {editingIndex === index ? (
                    // Mode édition
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`edit-content-${index}`} className="text-sm font-medium text-gray-700">
                          Contenu du tweet
                        </Label>
                        <Input
                          id={`edit-content-${index}`}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="mt-1"
                          maxLength={200}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {editContent.length}/200 caractères
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`edit-hashtags-${index}`} className="text-sm font-medium text-gray-700">
                          Hashtags (séparés par des virgules)
                        </Label>
                        <Input
                          id={`edit-hashtags-${index}`}
                          value={editHashtags}
                          onChange={(e) => setEditHashtags(e.target.value)}
                          className="mt-1"
                          placeholder="hashtag1, hashtag2, hashtag3"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={saveEdit} size="sm" className="bg-green-600 hover:bg-green-700">
                          <Save className="h-3 w-3 mr-1" />
                          Sauvegarder
                        </Button>
                        <Button onClick={cancelEditing} variant="outline" size="sm">
                          <X className="h-3 w-3 mr-1" />
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : isScheduling === index ? (
                    // Mode planification
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Planifier la publication
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`schedule-date-${index}`} className="text-xs font-medium text-gray-700">
                            Date
                          </Label>
                          <Input
                            id={`schedule-date-${index}`}
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            className="mt-1"
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`schedule-time-${index}`} className="text-xs font-medium text-gray-700">
                            Heure
                          </Label>
                          <Input
                            id={`schedule-time-${index}`}
                            type="time"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => scheduleTweet(index)} size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Calendar className="h-3 w-3 mr-1" />
                          Planifier
                        </Button>
                        <Button onClick={cancelScheduling} variant="outline" size="sm">
                          <X className="h-3 w-3 mr-1" />
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Mode affichage normal
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-gray-900 mb-2">{tweet.content}</p>
                          <div className="flex flex-wrap gap-1">
                            {tweet.hashtags.map((hashtag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                #{hashtag}
                              </span>
                            ))}
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            {tweet.content.length}/200 caractères
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditing(index)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startScheduling(index)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Calendar className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyTweet(tweet, index)}
                          >
                            {copiedIndex === index ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
