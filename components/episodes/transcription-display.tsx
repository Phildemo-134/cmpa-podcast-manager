import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { FileText, Copy, Check, Download, Eye, EyeOff, User, Edit2, Save, X, Sparkles, Loader2 } from 'lucide-react'
import { Transcription } from '../../types/database'
import { SpeakerEditor, SpeakerEditorHandle } from './speaker-editor'

interface TranscriptionDisplayProps {
  transcription: Transcription
  onTimestampClick?: (timestamp: { start: number; end: number; text: string }) => void
  currentTime?: number
  onTranscriptionUpdated?: (updatedTranscription: Transcription) => void
}

export function TranscriptionDisplay({ 
  transcription, 
  onTimestampClick,
  currentTime = 0,
  onTranscriptionUpdated
}: TranscriptionDisplayProps) {
  const [copied, setCopied] = useState(false)
  const [showRawText, setShowRawText] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizedText, setOptimizedText] = useState<string | null>(null)
  const [showOptimizedText, setShowOptimizedText] = useState(false)
  const speakerEditorRef = useRef<SpeakerEditorHandle>(null)

  // Fonction pour sauvegarder les speakers
  const handleSave = async () => {
    if (speakerEditorRef.current) {
      setIsSaving(true)
      try {
        await speakerEditorRef.current.handleSave()
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handleCancel = () => {
    if (speakerEditorRef.current) {
      speakerEditorRef.current.handleCancel()
    }
    setIsEditing(false)
  }

  // Fonction pour obtenir le nom personnalisé d'un speaker
  const getSpeakerDisplayName = (speakerId: string): string => {
    if (!speakerId) return 'Speaker inconnu'
    
    // Retourner directement le nom du speaker tel qu'il est stocké
    // (peut être "Speaker 1" ou un nom personnalisé comme "Jean")
    return speakerId
  }

  // Fonction pour générer une transcription brute formatée avec les noms des speakers
  const getFormattedRawText = (): string => {
    if (!transcription.timestamps || !Array.isArray(transcription.timestamps)) {
      return transcription.raw_text || 'Aucun texte disponible'
    }

    // Construire le texte formaté à partir des timestamps avec format [00:00] Speaker1 : texte
    return transcription.timestamps
      .map((timestamp: any) => {
        if (timestamp.speaker && timestamp.text) {
          const speakerName = getSpeakerDisplayName(timestamp.speaker)
          const timeFormatted = formatTime(timestamp.start)
          return `[${timeFormatted}] ${speakerName} : ${timestamp.text}`
        }
        return timestamp.text || ''
      })
      .filter(Boolean)
      .join('\n')
  }

  const handleCopyText = async () => {
    try {
      const textToCopy = getFormattedRawText()
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erreur lors de la copie:', error)
    }
  }

  const handleDownloadText = () => {
    const textToDownload = getFormattedRawText()
    const blob = new Blob([textToDownload], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcription-${transcription.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleOptimize = async () => {
    setIsOptimizing(true)
    try {
      const response = await fetch('/api/optimize-transcription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          transcriptionText: getFormattedRawText() 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de l\'optimisation')
      }

      const { optimizedText } = await response.json()
      setOptimizedText(optimizedText)
      setShowOptimizedText(true)
    } catch (error) {
      console.error('Erreur lors de l\'optimisation:', error)
      alert(`Erreur lors de l'optimisation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    } finally {
      setIsOptimizing(false)
    }
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

        <Button
          variant="outline"
          size="sm"
          onClick={handleOptimize}
          disabled={isOptimizing}
          className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
        >
          {isOptimizing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Optimisation...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Optimiser
            </>
          )}
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
              {getFormattedRawText()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transcription optimisée */}
      {optimizedText && showOptimizedText && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Transcription optimisée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-900 whitespace-pre-wrap max-h-96 overflow-y-auto border border-blue-200">
              {optimizedText}
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

      {/* Gestion des Speakers - Intégrée après les informations de la transcription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Gestion des Speakers
            </CardTitle>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Éditer les noms
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-sky-500 hover:bg-sky-600 text-white"
                  >
                    {isSaving ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Sauvegarder
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SpeakerEditor
            ref={speakerEditorRef}
            key={transcription.updated_at || transcription.created_at}
            transcription={transcription}
            onTranscriptionUpdated={onTranscriptionUpdated}
            isEditing={isEditing}
            onEditChange={setIsEditing}
          />
        </CardContent>
      </Card>
    </div>
  )
}
