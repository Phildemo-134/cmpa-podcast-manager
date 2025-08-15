import { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Edit2, Save, X, Users, User } from 'lucide-react'
import { Transcription } from '../../types/database'

interface SpeakerEditorProps {
  transcription: Transcription
  onTranscriptionUpdated?: (updatedTranscription: Transcription) => void
  isEditing: boolean
  onEditChange: (editing: boolean) => void
}

export interface SpeakerEditorHandle {
  handleSave: () => Promise<void>
  handleCancel: () => void
}

export const SpeakerEditor = forwardRef<SpeakerEditorHandle, SpeakerEditorProps>(({ 
  transcription, 
  onTranscriptionUpdated, 
  isEditing, 
  onEditChange
}, ref) => {
  const [speakerMappings, setSpeakerMappings] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Extraire les speakers uniques des timestamps
  const uniqueSpeakers = useMemo(() => {
    const speakers = Array.from(
      new Set(
        (transcription.timestamps as any[])
          ?.filter((t: any) => t && typeof t === 'object' && t.speaker && typeof t.speaker === 'string')
          .map((t: any) => t.speaker as string)
          .filter(Boolean)
      )
    ).sort()
    
    return speakers
  }, [transcription.timestamps])

  // Mémoriser les mappings initiaux pour éviter la boucle infinie
  const initialMappings = useMemo(() => {
    const mappings: Record<string, string> = {}
    uniqueSpeakers.forEach(speaker => {
      // Utiliser directement le nom du speaker tel qu'il apparaît dans les timestamps
      // (qui peut déjà être un nom personnalisé)
      mappings[speaker] = speaker
    })
    return mappings
  }, [uniqueSpeakers, transcription.timestamps])

  useEffect(() => {
    // Réinitialiser les mappings quand la transcription change
    setSpeakerMappings(initialMappings)
  }, [initialMappings, transcription.updated_at])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/transcribe/update-speakers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcriptionId: transcription.id,
          speakerMappings
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde')
      }

      const result = await response.json()
      
      // Mettre à jour l'interface
      if (onTranscriptionUpdated) {
        onTranscriptionUpdated(result.transcription)
      }
      
      onEditChange(false)
      
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error)
      alert(`Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Restaurer les valeurs originales
    setSpeakerMappings(initialMappings)
    onEditChange(false)
  }

  // Exposer les méthodes handleSave et handleCancel via la ref
  useImperativeHandle(ref, () => ({
    handleSave,
    handleCancel
  }), [speakerMappings])

  if (uniqueSpeakers.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {isEditing ? (
        // MODE ÉDITION - avec champs de saisie et boutons Sauvegarder/X
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Modifiez les noms des speakers pour personnaliser l'affichage dans la transcription.
          </p>
          <div className="grid gap-4">
            {uniqueSpeakers.map((speaker) => (
              <div key={speaker} className="flex items-center gap-3">
                <div className="flex-1">
                  <Label htmlFor={`speaker-${speaker}`} className="text-sm font-medium text-gray-900">
                    {speaker}
                  </Label>
                  <Input
                    id={`speaker-${speaker}`}
                    value={speakerMappings[speaker] || ''}
                    onChange={(e) => {
                      setSpeakerMappings(prev => ({
                        ...prev,
                        [speaker]: e.target.value
                      }))
                    }}
                    placeholder="Nom personnalisé (ex: Jean, Marie, etc.)"
                    className="mt-1 border-gray-300 focus:border-blue-400 focus:ring-blue-400 focus:ring-2 focus:ring-opacity-50 transition-colors"
                  />
                </div>
                <div className="text-xs text-gray-500 w-20 text-right">
                  {(transcription.timestamps as any[])?.filter((t: any) => t && typeof t === 'object' && t.speaker === speaker).length || 0} segments
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // MODE LECTURE - affichage simple avec bouton Éditer
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            {uniqueSpeakers.length} speaker{uniqueSpeakers.length > 1 ? 's' : ''} identifié{uniqueSpeakers.length > 1 ? 's' : ''} dans cette transcription.
          </p>
          <div className="space-y-2">
            {uniqueSpeakers.map((speaker) => (
              <div key={speaker} className="bg-sky-50 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-900">{speaker}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {(transcription.timestamps as any[])?.filter((t: any) => t && typeof t === 'object' && t.speaker === speaker).length || 0} segments
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
})

SpeakerEditor.displayName = 'SpeakerEditor'
