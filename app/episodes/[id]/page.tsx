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
  Users,
  Youtube,
  Music,
  FileText as FileTextIcon,
  Sparkles,
  CheckCircle,
  Clock,
  Cpu,
  Upload
} from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { CollapsibleField } from '../../../components/ui/collapsible-field'
import { TimestampDisplay } from '../../../components/episodes/timestamp-display'
import { EpisodeMetadata } from '../../../components/episodes/episode-metadata'
import { EpisodeStatus } from '../../../components/episodes/episode-status'
import { TranscriptionDisplay } from '../../../components/episodes/transcription-display'
import { createClient } from '@supabase/supabase-js'
import { Episode, Transcription } from '../../../types/index'
import { SpeakerEditor } from '../../../components/episodes/speaker-editor'
import { StatusDropdown } from '../../../components/episodes/status-dropdown'
import { TweetGenerator } from '../../../components/episodes/tweet-generator'
import { ScheduledTweets } from '../../../components/episodes/scheduled-tweets'
import { youtubeAcces, youtubeAbonnement, spotifyAcces, spotifyAbonnement } from '../../../lib/donnees-publication'
import { ProtectedRoute } from '../../../components/auth/protected-route'
import { SubscriptionGuard } from '../../../components/subscription'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Configuration des statuts pour affichage discret
const statusConfig = {
  draft: { label: 'Brouillon', color: 'text-gray-600', bg: 'bg-gray-50', icon: Clock },
  uploaded: { label: 'Uploadé', color: 'text-blue-600', bg: 'bg-blue-50', icon: Upload },
  transcribing: { label: 'Transcription', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: FileAudio },
  transcribed: { label: 'Transcrit', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
  optimizing: { label: 'Optimisation', color: 'text-purple-600', bg: 'bg-purple-50', icon: Cpu },
  optimized: { label: 'Optimisé', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
  generating_content: { label: 'Génération contenu', color: 'text-purple-600', bg: 'bg-purple-50', icon: Cpu },
  completed: { label: 'Terminé', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
  published: { label: 'Publié', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
  failed: { label: 'Échec', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle },
  error: { label: 'Erreur', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle }
}



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
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false) // New state for description generation
  const [isGeneratingTimestamps, setIsGeneratingTimestamps] = useState(false) // New state for timestamps generation
  const [isOptimizing, setIsOptimizing] = useState(false) // New state for optimization

  const [currentTime, setCurrentTime] = useState(0)
  
  // Form states
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editTimestamps, setEditTimestamps] = useState('')
  const [editVideoUrl, setEditVideoUrl] = useState('')
  
  // Audio ref
  const audioRef = useRef<HTMLAudioElement>(null)
  
  // Fonction pour calculer et sauvegarder la durée
  const updateEpisodeDuration = async (duration: number) => {
    if (!episode || episode.duration === duration) return
    
    try {
      const { error } = await supabase
        .from('episodes')
        .update({
          duration: duration,
          updated_at: new Date().toISOString()
        })
        .eq('id', episode.id)

      if (!error) {
        setEpisode(prev => prev ? { ...prev, duration: duration } : null)
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la durée:', err)
    }
  }

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
      setEditTimestamps(episodeData.timestamps || '')
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
    if (process.env.NODE_ENV === 'development') {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 handleTranscriptionUpdated appelé avec:', updatedTranscription);
      }
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Ancienne transcription:', transcription);
      }
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Nouveaux timestamps:', updatedTranscription.timestamps);
      }
    }
    
    setTranscription(updatedTranscription)
    
          if (process.env.NODE_ENV === 'development') {
        if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Transcription mise à jour dans l\'état local');
      }
      }
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
          timestamps: editTimestamps || null,
          video_url: editVideoUrl || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', episode.id)

      if (error) throw error

      setEpisode(prev => prev ? {
        ...prev,
        title: editTitle,
        description: editDescription || null,
        timestamps: editTimestamps || null,
        video_url: editVideoUrl || null
      } : null)
      
      setIsEditing(false)
    } catch (err) {
      alert(`Erreur lors de la sauvegarde: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateDescription = async () => {
    if (!episode || !transcription) return

    setIsGeneratingDescription(true)
    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ episodeId: episode.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la génération de la description')
      }

      const { description } = await response.json()
      
      // Mettre à jour le champ de description
      setEditDescription(description)
      
    } catch (err) {
      alert(`Erreur lors de la génération de la description: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
    } finally {
      setIsGeneratingDescription(false)
    }
  }

  const handleGenerateTimestamps = async () => {
    if (!episode || !transcription) return

    setIsGeneratingTimestamps(true)
    try {
      const response = await fetch('/api/generate-timestamps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ episodeId: episode.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la génération des timestamps')
      }

      const { timestamps } = await response.json()
      
      // Mettre à jour le champ de timestamps
      setEditTimestamps(timestamps)
      
    } catch (err) {
      alert(`Erreur lors de la génération des timestamps: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
    } finally {
      setIsGeneratingTimestamps(false)
    }
  }

  const handleOptimizeTranscription = async () => {
    if (!episode || !transcription) return

    setIsOptimizing(true)
    try {
      // Générer le texte formaté pour l'optimisation
      const formattedText = Array.isArray(transcription.timestamps)
        ? transcription.timestamps
            .map((timestamp: any) => {
              if (timestamp.speaker && timestamp.text) {
                const timeFormatted = formatTime(timestamp.start)
                return `[${timeFormatted}] ${timestamp.speaker} : ${timestamp.text}`
              }
              return timestamp.text || ''
            })
            .filter(Boolean)
            .join('\n')
        : ''

      const response = await fetch('/api/optimize-transcription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          transcriptionText: formattedText,
          transcriptionId: transcription.id 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de l\'optimisation')
      }

      const { optimizedText } = await response.json()
      
      // Mettre à jour la transcription avec le texte optimisé
      const updatedTranscription = {
        ...transcription,
        cleaned_text: optimizedText,
        updated_at: new Date().toISOString()
      }
      
      setTranscription(updatedTranscription)
      
      // Notifier le composant parent
      if (handleTranscriptionUpdated) {
        handleTranscriptionUpdated(updatedTranscription)
      }
      
      alert('Transcription optimisée avec succès !')
      
    } catch (err) {
      alert(`Erreur lors de l'optimisation: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
    } finally {
      setIsOptimizing(false)
    }
  }

  // Fonction utilitaire pour formater le temps
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
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

  const handleStatusChange = async (newStatus: 'draft' | 'uploaded' | 'transcribing' | 'transcribed' | 'optimizing' | 'optimized' | 'generating_content' | 'completed' | 'published' | 'failed' | 'error') => {
    if (!episode) return

    try {
      const { error } = await supabase
        .from('episodes')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', episode.id)

      if (error) throw error

      setEpisode(prev => prev ? { ...prev, status: newStatus } : null)
    } catch (err) {
      alert(`Erreur lors de la mise à jour du status: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
      throw err
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
            setEpisode(prev => prev ? { ...prev, status: 'published' } : null)
            setIsTranscribing(false)
            clearInterval(pollInterval)
          } else if (transcription.processing_status === 'error') {
            // Erreur de transcription
            setEpisode(prev => prev ? { ...prev, status: 'failed' } : null)
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

  // Fonction pour copier le contenu formaté pour YouTube
  const handleCopyToYoutube = async () => {
    if (!episode) return

    const content = [
      youtubeAcces,
      '',
      episode.description || '',
      '',
      'TIMESTAMPS',
      episode.timestamps || '',
      '',
      youtubeAbonnement
    ].filter(Boolean).join('\n')

    try {
      await navigator.clipboard.writeText(content)
      alert('Contenu copié pour YouTube !')
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
      alert('Erreur lors de la copie dans le presse-papier')
    }
  }

  // Fonction pour copier le contenu formaté pour Spotify
  const handleCopyToSpotify = async () => {
    if (!episode) return

    // Formater la description en HTML si elle existe
    const formattedDescription = episode.description 
      ? `<p>${episode.description.replace(/\n/g, '</p><p>')}</p>`
      : ''

    // Formater les timestamps en HTML si ils existent
    const formattedTimestamps = episode.timestamps
      ? `<p><strong>TIMESTAMPS</strong></p><p>${episode.timestamps.split('\n').filter(line => line.trim()).join('<br/>')}</p>`
      : ''

    const content = [
      spotifyAcces,
      '',
      formattedDescription,
      '<br/>',
      formattedTimestamps,
      '<br/>',
      spotifyAbonnement
    ].filter(Boolean).join('\n')

    try {
      await navigator.clipboard.writeText(content)
      alert('Contenu copié pour Spotify !')
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
      alert('Erreur lors de la copie dans le presse-papier')
    }
  }

  // Fonction pour copier le contenu formaté pour le Blog (Markdown)
  const handleCopyToBlog = async () => {
    if (!episode) return

    // Formater la description en Markdown si elle existe
    const formattedDescription = episode.description 
      ? episode.description.split('\n').map(line => line.trim()).filter(Boolean).join('\n\n')
      : ''

    // Formater les timestamps en Markdown si ils existent
    const formattedTimestamps = episode.timestamps
      ? `## Timestamps\n\n${episode.timestamps.split('\n').map(line => line.trim()).filter(Boolean).join('\n')}`
      : ''

    const content = [
      formattedDescription,
      '',
      formattedTimestamps
    ].filter(Boolean).join('\n')

    try {
      await navigator.clipboard.writeText(content)
      alert('Contenu copié pour le Blog !')
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
      alert('Erreur lors de la copie dans le presse-papier')
    }
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
    <ProtectedRoute requireActiveSubscription={false}>
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
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="description">Description</Label>
                            {transcription && transcription.processing_status === 'completed' && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleGenerateDescription}
                                disabled={isGeneratingDescription}
                                className="text-sm"
                              >
                                {isGeneratingDescription ? (
                                  <>
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    Génération...
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    Générer
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                          <textarea
                            id="description"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Description de l'épisode"
                            rows={15}
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="timestamps">Timestamps</Label>
                            {transcription && transcription.processing_status === 'completed' && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleGenerateTimestamps}
                                disabled={isGeneratingTimestamps}
                                className="text-sm"
                              >
                                {isGeneratingTimestamps ? (
                                  <>
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    Génération...
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    Générer
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                          <textarea
                            id="timestamps"
                            value={editTimestamps}
                            onChange={(e) => setEditTimestamps(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Format: 00:00 - Introduction, 05:30 - Discussion principale, etc."
                            rows={15}
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
                        
                        {/* Boutons de copie pour les plateformes */}
                        <div className="pt-4 border-t">
                          <Label className="text-sm font-medium text-gray-700 mb-3 block">
                            Copier pour publication
                          </Label>
                          <div className="flex gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleCopyToYoutube}
                              className="flex-1"
                            >
                              <Youtube className="h-4 w-4 mr-2" />
                              Copier sur YouTube
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleCopyToSpotify}
                              className="flex-1"
                            >
                              <Music className="h-4 w-4 mr-2" />
                              Copier sur Spotify
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleCopyToBlog}
                              className="flex-1"
                            >
                              <FileTextIcon className="h-4 w-4 mr-2" />
                              Copier pour Blog
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-2xl">{episode.title}</CardTitle>
                          
                          {/* Statut discret à côté du titre */}
                          {episode.status && (() => {
                            const status = statusConfig[episode.status as keyof typeof statusConfig]
                            if (!status) return null
                            const StatusIcon = status.icon
                            return (
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                <div className="flex items-center gap-1">
                                  <StatusIcon className="h-3 w-3" />
                                  {status.label}
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                        
                        {/* Description rétractable */}
                        {episode.description && (
                          <div className="mt-8">
                            <CollapsibleField title="Description" defaultExpanded={false}>
                              <div className="text-sm text-gray-600 whitespace-pre-line">
                                {episode.description}
                              </div>
                            </CollapsibleField>
                          </div>
                        )}
                        
                        {/* Timestamps rétractables */}
                        {episode.timestamps && (
                          <div className="mt-6">
                            <CollapsibleField title="Timestamps" defaultExpanded={false}>
                              <div className="text-sm text-gray-600 whitespace-pre-line">
                                {episode.timestamps}
                              </div>
                            </CollapsibleField>
                          </div>
                        )}
                        
                        {/* Boutons de copie pour les plateformes */}
                        {(episode.description || episode.timestamps) && (
                          <div className="mt-6 pt-4 border-t">
                            <Label className="text-sm font-medium text-gray-700 mb-3 block">
                              Copier pour publication
                            </Label>
                            <div className="flex gap-3">
                              <Button
                                variant="outline"
                                onClick={handleCopyToYoutube}
                                className="flex-1"
                              >
                                <Youtube className="h-4 w-4 mr-2" />
                                Copier sur YouTube
                              </Button>
                              <Button
                                variant="outline"
                                onClick={handleCopyToSpotify}
                                className="flex-1"
                              >
                                <Music className="h-4 w-4 mr-2" />
                                Copier sur Spotify
                              </Button>
                              <Button
                                variant="outline"
                                onClick={handleCopyToBlog}
                                className="flex-1"
                              >
                                <FileTextIcon className="h-4 w-4 mr-2" />
                                Copier pour Blog
                              </Button>
                            </div>
                          </div>
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
                            setEditTimestamps(episode.timestamps || '')
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
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Modifier le statut
                  </Label>
                  <StatusDropdown
                    currentStatus={episode.status || 'draft'}
                    onStatusChange={handleStatusChange}
                    isUpdating={isSaving}
                  />
                </div>
                
                {/* Affichage des erreurs si nécessaire */}
                {episode.status === 'failed' && episode.error_message && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center gap-2 text-red-600 mb-1">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Erreur de traitement</span>
                    </div>
                    <p className="text-sm text-red-600">{episode.error_message}</p>
                  </div>
                )}
                
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
                  onLoadedMetadata={() => {
                    if (audioRef.current && audioRef.current.duration && !isNaN(audioRef.current.duration)) {
                      const duration = Math.round(audioRef.current.duration)
                      updateEpisodeDuration(duration)
                    }
                  }}
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
                    <div className="flex gap-2">
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
                      <Button 
                        variant="outline"
                        onClick={handleOptimizeTranscription}
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

            {/* Publication Réseaux Sociaux */}
            <TweetGenerator 
              episodeId={episode.id}
              hasTranscription={!!transcription && transcription.processing_status === 'completed'}
            />

            {/* Tweets Planifiés */}
            <ScheduledTweets episodeId={episode.id} />

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
            {episode.status === 'failed' && episode.error_message && (
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
    </ProtectedRoute>
  )
}
