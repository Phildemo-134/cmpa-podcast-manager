'use client'

import { useState } from 'react'
import { Twitter, Send, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

interface TwitterTestPostProps {
  isConnected: boolean
}

export function TwitterTestPost({ isConnected }: TwitterTestPostProps) {
  const [message, setMessage] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [result, setResult] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const handlePost = async () => {
    if (!message.trim()) {
      setResult({
        type: 'error',
        message: 'Veuillez entrer un message'
      })
      return
    }

    setIsPosting(true)
    setResult(null)

    try {
      const response = await fetch('/api/social/twitter/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message.trim() })
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          type: 'success',
          message: data.message || 'Tweet publié avec succès !'
        })
        setMessage('') // Vider le champ après succès
      } else {
        setResult({
          type: 'error',
          message: data.error || 'Erreur lors de la publication'
        })
      }
    } catch (error) {
      console.error('Erreur lors de la publication:', error)
      setResult({
        type: 'error',
        message: 'Erreur de connexion au serveur'
      })
    } finally {
      setIsPosting(false)
    }
  }

  if (!isConnected) {
    return null
  }

  return (
    <Card className="p-4 bg-blue-50 border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <Twitter className="w-5 h-5 text-blue-600" />
        <h4 className="font-medium text-blue-900">Tester la publication Twitter</h4>
      </div>
      
      <div className="space-y-3">
        <div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Entrez votre message de test..."
            className="w-full p-3 border border-blue-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            maxLength={280}
          />
          <div className="text-xs text-blue-600 mt-1">
            {message.length}/280 caractères
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handlePost}
            disabled={isPosting || !message.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isPosting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {isPosting ? 'Publication...' : 'Publier le tweet'}
          </Button>

          {message && (
            <Button
              variant="outline"
              onClick={() => setMessage('')}
              size="sm"
            >
              Effacer
            </Button>
          )}
        </div>

        {result && (
          <div className={`p-3 rounded-lg border ${
            result.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {result.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{result.message}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
