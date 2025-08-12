'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  FileAudio, 
  Clock, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { createClient } from '@supabase/supabase-js'
import { Episode } from '../../types/database'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const statusConfig = {
  uploading: { label: 'Upload en cours', color: 'text-blue-600', bg: 'bg-blue-50', icon: Loader2 },
  transcribing: { label: 'Transcription', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Loader2 },
  processing: { label: 'Traitement IA', color: 'text-purple-600', bg: 'bg-purple-50', icon: Loader2 },
  completed: { label: 'Terminé', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
  error: { label: 'Erreur', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle }
}

export function EpisodeList() {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchEpisodes()
  }, [])

  const fetchEpisodes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non connecté')

      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setEpisodes(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des épisodes')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteEpisode = async (episodeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet épisode ?')) return

    try {
      const { error } = await supabase
        .from('episodes')
        .delete()
        .eq('id', episodeId)

      if (error) throw error

      setEpisodes(prev => prev.filter(ep => ep.id !== episodeId))
    } catch (err) {
      alert(`Erreur lors de la suppression: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '--'
    const mb = bytes / 1024 / 1024
    return `${mb.toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getStatusConfig = (status: Episode['status']) => {
    return statusConfig[status] || statusConfig.error
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Chargement des épisodes...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchEpisodes} variant="outline">
            Réessayer
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (episodes.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-12 text-center">
          <FileAudio className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun épisode</h3>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas encore créé d'épisode. Commencez par uploader votre premier fichier audio.
          </p>
          <Button onClick={() => router.push('/upload')}>
            Créer votre premier épisode
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Vos Épisodes</h2>
        <Button onClick={() => router.push('/upload')}>
          Ajouter un épisode
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {episodes.map((episode) => {
          const status = getStatusConfig(episode.status)
          const StatusIcon = status.icon

          return (
            <Card key={episode.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{episode.title}</CardTitle>
                    {episode.description && (
                      <CardDescription className="truncate mt-1">
                        {episode.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                    <div className="flex items-center gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Episode Info */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(episode.duration)}
                    </div>
                    <div className="flex items-center gap-1">
                      <FileAudio className="h-4 w-4" />
                      {formatFileSize(episode.file_size)}
                    </div>
                  </div>

                  {/* Additional Info */}
                  {(episode.timestamps || episode.video_url) && (
                    <div className="space-y-2 text-sm">
                      {episode.timestamps && (
                        <div className="flex items-start gap-1">
                          <span className="text-gray-500">⏱️</span>
                          <span className="text-gray-600 line-clamp-2">
                            {episode.timestamps}
                          </span>
                        </div>
                      )}
                      {episode.video_url && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">🎥</span>
                          <a 
                            href={episode.video_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 truncate"
                          >
                            Voir la vidéo
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {formatDate(episode.created_at)}
                  </div>

                  {/* Error Message */}
                  {episode.status === 'error' && episode.error_message && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {episode.error_message}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/episodes/${episode.id}`)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Gérer
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteEpisode(episode.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
