'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  FileAudio, 
  Mic,
  FileText,
  RefreshCw,
  Loader2,
  AlertCircle,
  Edit2,
  Users
} from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { TimestampDisplay } from '../../../components/episodes/timestamp-display'
import { EpisodeMetadata } from '../../../components/episodes/episode-metadata'
import { EpisodeStatus } from '../../../components/episodes/episode-status'
import { TranscriptionDisplay } from '../../../components/episodes/transcription-display'
import { createClient } from '@supabase/supabase-js'
import { Episode, Transcription } from '../../../types/database'
import { SpeakerEditor } from '../../../components/episodes/speaker-editor'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)



export default function EpisodeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const episodeId = params.id as string
  
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [transcription, setTranscription] = useState<Transcription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isSaving, setIsSaving] = useState(false) // New state for saving
  const [isEditingSpeakers, setIsEditingSpeakers] = useState(false) // New state for speakers editing

  const [currentTime, setCurrentTime] = useState(0)
  
  // Form states
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editVideoUrl, setEditVideoUrl] = useState('')
  
  // Audio ref
  const audioRef = useRef<HTMLAudioElement>(null)

  const fetchEpisodeData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non connecté')

      // Fetch episode
      const { data: episodeData, error: episodeError } = await supabase
        .from('episodes')
        .select('*')
        .eq('id', episodeId)
        .eq('user_id', user.id)
        .single()

      if (episodeError) throw episodeError
      setEpisode(episodeData)
      setEditTitle(episodeData.title)
      setEditDescription(episodeData.description || '')
      setEditVideoUrl(episodeData.video_url || '')

      // Fetch transcription if exists
      const { data: transcriptionData, error: transcriptionError } = await supabase
        .from('transcriptions')
        .select('*')
        .eq('episode_id', episodeId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (transcriptionData && !transcriptionError) {
        setTranscription(transcriptionData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de l\'épisode')
    } finally {
      setIsLoading(false)
    }
  }, [episodeId])

  // Fonction pour mettre à jour la transcription après édition des speakers
  const handleTranscriptionUpdated = (updatedTranscription: Transcription) => {
    console.log('🔍 handleTranscriptionUpdated appelé avec:', updatedTranscription)
    console.log('🔍 Ancienne transcription:', transcription)
    console.log('🔍 Nouveaux timestamps:', updatedTranscription.timestamps)
    
    setTranscription(updatedTranscription)
    
    console.log('🔍 Transcription mise à jour dans l\'état local')
  }

  useEffect(() => {
    if (episodeId) {
      fetchEpisodeData()
    }
  }, [episodeId, fetchEpisodeData])

  const handleSave = async () => {
    if (!episode) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('episodes')
        .update({
          title: editTitle,
          description: editDescription || null,
          video_url: editVideoUrl || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', episode.id)

      if (error) throw error

      setEpisode(prev => prev ? {
        ...prev,
        title: editTitle,
        description: editDescription || null,
        video_url: editVideoUrl || null
      } : null)
      
      setIsEditing(false)
    } catch (err) {
      alert(`Erreur lors de la sauvegarde: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSpeakers = async () => {
    if (!transcription) return

    setIsSaving(true)
    try {
      // Cette fonction sera appelée par le composant SpeakerEditor
      // via onTranscriptionUpdated
      setIsEditingSpeakers(false)
    } catch (err) {
      alert(`Erreur lors de la sauvegarde des speakers: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleTranscribe = async () => {
    if (!episode) return

    setIsTranscribing(true)
    try {
      // Appeler l'API de transcription
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ episodeId: episode.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la transcription')
      }

      await response.json()
      
      // Mettre à jour l'interface
      setEpisode(prev => prev ? { ...prev, status: 'transcribing' } : null)
      
      // Démarrer le polling pour vérifier le statut
      startTranscriptionPolling(episode.id)

    } catch (err) {
      alert(`Erreur lors de la transcription: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
      setIsTranscribing(false)
    }
  }

  const startTranscriptionPolling = (episodeId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/transcribe?episodeId=${episodeId}`)
        
        if (response.ok) {
          const { transcription } = await response.json()
          
          if (transcription.processing_status === 'completed') {
            // Transcription terminée
            setTranscription(transcription)
            setEpisode(prev => prev ? { ...prev, status: 'completed' } : null)
            setIsTranscribing(false)
            clearInterval(pollInterval)
          } else if (transcription.processing_status === 'error') {
            // Erreur de transcription
            setEpisode(prev => prev ? { ...prev, status: 'error' } : null)
            setIsTranscribing(false)
            clearInterval(pollInterval)
          }
          // Si 'pending' ou 'processing', continuer le polling
        }
      } catch {
        // Erreur lors du polling
        // En cas d'erreur, arrêter le polling après quelques tentatives
        clearInterval(pollInterval)
        setIsTranscribing(false)
      }
    }, 5000) // Vérifier toutes les 5 secondes

    // Arrêter le polling après 10 minutes maximum
    setTimeout(() => {
      clearInterval(pollInterval)
      setIsTranscribing(false)
    }, 10 * 60 * 1000)
  }





  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <span className="text-gray-600">Chargement de l'épisode...</span>
        </div>
      </div>
    )
  }

  if (error || !episode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur</h3>
            <p className="text-gray-600 mb-4">{error || 'Épisode non trouvé'}</p>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Retour au dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                Détails de l'épisode
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Episode Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Titre</Label>
                        <Input
                          id="title"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="mt-1"
                          placeholder="Description de l'épisode"
                        />
                      </div>
                      <div>
                        <Label htmlFor="videoUrl">URL Vidéo (optionnel)</Label>
                        <Input
                          id="videoUrl"
                          value={editVideoUrl}
                          onChange={(e) => setEditVideoUrl(e.target.value)}
                          className="mt-1"
                          placeholder="https://youtube.com/..."
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <CardTitle className="text-2xl">{episode.title}</CardTitle>
                      {episode.description && (
                        <CardDescription className="text-base mt-2">
                          {episode.description}
                        </CardDescription>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave} size="sm">
                        <Save className="h-4 w-4 mr-1" />
                        Sauvegarder
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setIsEditing(false)
                          setEditTitle(episode.title)
                          setEditDescription(episode.description || '')
                          setEditVideoUrl(episode.video_url || '')
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <EpisodeStatus status={episode.status} errorMessage={episode.error_message} />
              </div>
              
              <EpisodeMetadata episode={episode} />
            </CardContent>
          </Card>

          {/* Audio Player */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileAudio className="h-5 w-5" />
                Lecteur Audio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <audio 
                ref={audioRef}
                controls 
                className="w-full"
                src={episode.audio_file_url}
                onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
              >
                Votre navigateur ne supporte pas l'élément audio.
              </audio>
            </CardContent>
          </Card>

          {/* Transcription Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Transcription
                </CardTitle>
                {!transcription && episode.status !== 'transcribing' && (
                  <Button 
                    onClick={handleTranscribe}
                    disabled={isTranscribing}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isTranscribing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Transcription en cours...
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        Générer la transcription
                      </>
                    )}
                  </Button>
                )}
                {transcription && (
                  <Button 
                    variant="outline"
                    onClick={handleTranscribe}
                    disabled={isTranscribing}
                  >
                    {isTranscribing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Régénérer en cours...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Régénérer
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {episode.status === 'transcribing' && !transcription && (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Transcription en cours...</p>
                </div>
              )}
              
              {transcription && transcription.processing_status === 'completed' && (
                <>
                  <TranscriptionDisplay
                    key={transcription.updated_at || transcription.created_at}
                    transcription={transcription}
                    onTimestampClick={(timestamp) => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = timestamp.start
                        audioRef.current.play()
                      }
                    }}
                    currentTime={currentTime}
                    onTranscriptionUpdated={handleTranscriptionUpdated}
                  />
                  
                  {/* Gestion des Speakers - Intégrée dans la section transcription */}
                  {/* This block is now moved to the main card */}
                </>
              )}
              
              {transcription && transcription.processing_status === 'error' && (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600">Erreur lors de la transcription</p>
                </div>
              )}
              
              {!transcription && episode.status !== 'transcribing' && (
                <div className="text-center py-8 text-gray-500">
                  <Mic className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Aucune transcription disponible</p>
                  <p className="text-sm mt-2">Cliquez sur "Générer la transcription" pour commencer</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Info */}
          {episode.video_url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎥 Vidéo associée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a 
                  href={episode.video_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {episode.video_url}
                </a>
              </CardContent>
            </Card>
          )}

          {/* Error Message */}
          {episode.status === 'error' && episode.error_message && (
            <Card className="border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Erreur de traitement</span>
                </div>
                <p className="text-red-600">{episode.error_message}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
