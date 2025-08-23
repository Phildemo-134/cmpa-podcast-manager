import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { FileText, Copy, Check, Download, Eye, EyeOff, User, Edit2, Save, X, Sparkles } from 'lucide-react'
import { Transcription } from '../../types/index'
import { SpeakerEditor, SpeakerEditorHandle } from './speaker-editor'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
  const [optimizedText, setOptimizedText] = useState<string | null>(null)
  const [showOptimizedText, setShowOptimizedText] = useState(false)
  
  // Nouveaux états pour l'édition de la transcription optimisée
  const [isEditingOptimized, setIsEditingOptimized] = useState(false)
  const [isSavingOptimized, setIsSavingOptimized] = useState(false)
  const [editableOptimizedText, setEditableOptimizedText] = useState<string>('')
  
  const speakerEditorRef = useRef<SpeakerEditorHandle>(null)

  // Afficher automatiquement la transcription optimisée si elle existe en base
  useEffect(() => {
    if (transcription.cleaned_text) {
      setOptimizedText(transcription.cleaned_text)
      setShowOptimizedText(true)
      setEditableOptimizedText(transcription.cleaned_text)
    }
  }, [transcription.cleaned_text])

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

  // Nouvelle fonction pour sauvegarder la transcription optimisée
  const handleSaveOptimized = async () => {
    if (!transcription.id) return

    setIsSavingOptimized(true)
    try {
      const { error } = await supabase
        .from('transcriptions')
        .update({
          cleaned_text: editableOptimizedText,
          updated_at: new Date().toISOString()
        })
        .eq('id', transcription.id)

      if (error) throw error

      // Mettre à jour l'état local
      setOptimizedText(editableOptimizedText)
      
      // Notifier le composant parent
      if (onTranscriptionUpdated) {
        const updatedTranscription = {
          ...transcription,
          cleaned_text: editableOptimizedText,
          updated_at: new Date().toISOString()
        }
        onTranscriptionUpdated(updatedTranscription)
      }

      setIsEditingOptimized(false)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la transcription optimisée:', error)
      alert(`Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    } finally {
      setIsSavingOptimized(false)
    }
  }

  // Fonction pour annuler l'édition de la transcription optimisée
  const handleCancelOptimized = () => {
    setEditableOptimizedText(transcription.cleaned_text || '')
    setIsEditingOptimized(false)
  }

  // Fonction pour démarrer l'édition de la transcription optimisée
  const handleStartEditOptimized = () => {
    setEditableOptimizedText(transcription.cleaned_text || '')
    setIsEditingOptimized(true)
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
      {(optimizedText || transcription.cleaned_text) && showOptimizedText && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Transcription optimisée
              </CardTitle>
              <div className="flex gap-2">
                {!isEditingOptimized ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartEditOptimized}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Éditer
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      onClick={handleSaveOptimized}
                      disabled={isSavingOptimized}
                      className="bg-sky-500 hover:bg-sky-600 text-white"
                    >
                      {isSavingOptimized ? (
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
                      onClick={handleCancelOptimized}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Annuler
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEditingOptimized ? (
              <div className="space-y-3">
                <textarea
                  value={editableOptimizedText}
                  onChange={(e) => setEditableOptimizedText(e.target.value)}
                  className="w-full h-96 p-4 bg-white border border-blue-300 rounded-lg text-sm text-gray-900 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Éditez votre transcription optimisée ici..."
                />
                <div className="text-xs text-gray-500">
                  Modifiez le texte selon vos besoins. Les changements seront sauvegardés en base de données.
                </div>
              </div>
            ) : (
              <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-900 whitespace-pre-wrap max-h-96 overflow-y-auto border border-blue-200">
                {optimizedText || transcription.cleaned_text}
              </div>
            )}
          </CardContent>
        </Card>
      )}



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
