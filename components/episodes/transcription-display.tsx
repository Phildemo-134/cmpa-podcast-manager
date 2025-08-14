import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { FileText, Copy, Check, Download, Eye, EyeOff } from 'lucide-react'
import { Transcription } from '../../types/database'

interface TranscriptionDisplayProps {
  transcription: Transcription
  onTimestampClick?: (timestamp: { start: number; end: number; text: string }) => void
  currentTime?: number
}

export function TranscriptionDisplay({ 
  transcription, 
  onTimestampClick,
  currentTime = 0 
}: TranscriptionDisplayProps) {
  const [copied, setCopied] = useState(false)
  const [showRawText, setShowRawText] = useState(true)
  const [showTimestamps, setShowTimestamps] = useState(true)

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(transcription.raw_text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erreur lors de la copie:', error)
    }
  }

  const handleDownloadText = () => {
    const blob = new Blob([transcription.raw_text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcription-${transcription.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const isTimestampActive = (timestamp: { start: number; end: number }) => {
    return currentTime >= timestamp.start && currentTime <= timestamp.end
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRawText(!showRawText)}
        >
          {showRawText ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {showRawText ? 'Masquer le texte' : 'Afficher le texte'}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTimestamps(!showTimestamps)}
        >
          {showTimestamps ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {showTimestamps ? 'Masquer timestamps' : 'Afficher timestamps'}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyText}
        >
          {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
          {copied ? 'Copié !' : 'Copier'}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadText}
        >
          <Download className="h-4 w-4 mr-2" />
          Télécharger
        </Button>
      </div>

      {/* Texte brut */}
      {showRawText && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Transcription brute
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-800 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {transcription.raw_text || 'Aucun texte disponible'}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timestamps */}
      {showTimestamps && transcription.timestamps && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Timestamps détaillés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Array.isArray(transcription.timestamps) ? (
                transcription.timestamps.map((timestamp, index) => {
                  // Type guard pour vérifier que le timestamp a la bonne structure
                  if (!timestamp || typeof timestamp !== 'object' || !('start' in timestamp) || !('end' in timestamp) || !('text' in timestamp)) {
                    return null
                  }
                  
                  const typedTimestamp = timestamp as { start: number; end: number; text: string; speaker?: string }
                  
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        isTimestampActive(typedTimestamp)
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => onTimestampClick?.(typedTimestamp)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm text-gray-600 mb-1">
                            {formatTime(typedTimestamp.start)} - {formatTime(typedTimestamp.end)}
                            {typedTimestamp.speaker && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                Speaker {typedTimestamp.speaker}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-800">{typedTimestamp.text}</p>
                        </div>
                        {onTimestampClick && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation()
                              onTimestampClick(typedTimestamp)
                            }}
                          >
                            ▶️
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                }).filter(Boolean)
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Aucun timestamp disponible
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métadonnées de la transcription */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informations de la transcription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Type:</span>
              <span className="ml-2 text-gray-600 capitalize">
                {transcription.type}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Statut:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                transcription.processing_status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : transcription.processing_status === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {transcription.processing_status}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Créée le:</span>
              <span className="ml-2 text-gray-600">
                {new Date(transcription.created_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
            {transcription.updated_at && (
              <div>
                <span className="font-medium text-gray-700">Mise à jour:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(transcription.updated_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
