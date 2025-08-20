'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Loader2, RefreshCw, Twitter, Copy, Check } from 'lucide-react'

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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyTweet(tweet, index)}
                      className="shrink-0"
                    >
                      {copiedIndex === index ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
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
