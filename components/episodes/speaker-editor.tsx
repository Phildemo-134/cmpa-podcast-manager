import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Edit2, Save, X, User } from 'lucide-react'
import { Transcription } from '../../types/database'

interface SpeakerEditorProps {
  transcription: Transcription
  onTranscriptionUpdated?: (updatedTranscription: Transcription) => void
}

export function SpeakerEditor({ transcription, onTranscriptionUpdated }: SpeakerEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
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
    
    console.log('🔍 Speakers uniques détectés:', speakers)
    return speakers
  }, [transcription.timestamps])

  // Mémoriser les mappings initiaux pour éviter la boucle infinie
  const initialMappings = useMemo(() => {
    const mappings: Record<string, string> = {}
    uniqueSpeakers.forEach(speaker => {
      // Utiliser le nom actuel du speaker s'il a déjà été personnalisé
      const currentSpeakerName = (transcription.timestamps as any[])?.find(
        (t: any) => t.speaker === speaker
      )?.speaker || speaker
      
      mappings[speaker] = currentSpeakerName
    })
    console.log('🔍 Mappings initiaux mémorisés:', mappings)
    return mappings
  }, [uniqueSpeakers, transcription.timestamps])

  useEffect(() => {
    // Initialiser les mappings seulement si ils ont changé
    if (Object.keys(initialMappings).length > 0) {
      console.log('🔍 Initialisation des mappings depuis useEffect')
      setSpeakerMappings(initialMappings)
    }
  }, [initialMappings])

  // Debug: afficher les speakers détectés
  console.log('🔍 Transcription:', transcription)
  console.log('🔍 Timestamps:', transcription.timestamps)
  console.log('🔍 Speaker mappings actuels:', speakerMappings)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      console.log('🔍 Sauvegarde des speakers...', speakerMappings)
      
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
      console.log('🔍 Résultat de la sauvegarde:', result)
      
      // Mettre à jour l'interface
      if (onTranscriptionUpdated) {
        console.log('🔍 Appel de onTranscriptionUpdated avec:', result.transcription)
        onTranscriptionUpdated(result.transcription)
        
        // Mettre à jour aussi l'état local pour refléter les changements
        setSpeakerMappings(prev => {
          const updatedMappings = { ...prev }
          Object.keys(speakerMappings).forEach(key => {
            if (speakerMappings[key] !== key) {
              updatedMappings[key] = speakerMappings[key]
            }
          })
          return updatedMappings
        })
      } else {
        console.log('⚠️ onTranscriptionUpdated n\'est pas défini')
      }
      
      setIsEditing(false)
      
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error)
      alert(`Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Restaurer les valeurs originales
    const initialMappings: Record<string, string> = {}
    uniqueSpeakers.forEach(speaker => {
      initialMappings[speaker] = speaker
    })
    setSpeakerMappings(initialMappings)
    setIsEditing(false)
  }

  if (uniqueSpeakers.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Gestion des Speakers
          </CardTitle>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Éditer les noms
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
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
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Modifiez les noms des speakers pour personnaliser l'affichage dans la transcription.
            </p>
            <div className="grid gap-4">
              {uniqueSpeakers.map((speaker) => (
                <div key={speaker} className="flex items-center gap-3">
                  <div className="flex-1">
                    <Label htmlFor={`speaker-${speaker}`} className="text-sm font-medium">
                      {speaker}
                    </Label>
                    <Input
                      id={`speaker-${speaker}`}
                      value={speakerMappings[speaker] || ''}
                      onChange={(e) => {
                        console.log('🔍 onChange appelé pour', speaker, 'avec valeur:', e.target.value)
                        setSpeakerMappings(prev => {
                          const newMappings = {
                            ...prev,
                            [speaker]: e.target.value
                          }
                          console.log('🔍 Nouveaux mappings:', newMappings)
                          return newMappings
                        })
                      }}
                      placeholder="Nom personnalisé (ex: Jean, Marie, etc.)"
                      className="mt-1"
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
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              {uniqueSpeakers.length} speaker{uniqueSpeakers.length > 1 ? 's' : ''} identifié{uniqueSpeakers.length > 1 ? 's' : ''} dans cette transcription.
            </p>
            <div className="grid gap-2">
              {uniqueSpeakers.map((speaker) => (
                <div key={speaker} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{speaker}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {(transcription.timestamps as any[])?.filter((t: any) => t && typeof t === 'object' && t.speaker === speaker).length || 0} segments
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
