import { Clock, FileAudio, Calendar, User, Tag, Link } from 'lucide-react'
import { Episode } from '../../types/index'

interface EpisodeMetadataProps {
  episode: Episode
}

export function EpisodeMetadata({ episode }: EpisodeMetadataProps) {
  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds || seconds === 0) return '--:--'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes) return '--'
    const mb = bytes / 1024 / 1024
    return `${mb.toFixed(1)} MB`
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '--'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileExtension = (url: string) => {
    const extension = url.split('.').pop()?.toUpperCase()
    return extension || 'AUDIO'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Durée */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Clock className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Durée</p>
          <p className="text-lg font-semibold text-gray-700">{formatDuration(episode.duration)}</p>
        </div>
      </div>

      {/* Taille du fichier */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="p-2 bg-green-100 rounded-lg">
          <FileAudio className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Taille</p>
          <p className="text-lg font-semibold text-gray-700">{formatFileSize(episode.file_size)}</p>
        </div>
      </div>

      {/* Date de création */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Calendar className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Créé le</p>
          <p className="text-sm text-gray-700">{formatDate(episode.created_at)}</p>
        </div>
      </div>

      {/* Format du fichier */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Tag className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Format</p>
          <p className="text-lg font-semibold text-gray-700">{getFileExtension(episode.audio_file_url)}</p>
        </div>
      </div>

      {/* URL vidéo si disponible */}
      {episode.video_url && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="p-2 bg-red-100 rounded-lg">
            <Link className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Vidéo</p>
            <a 
              href={episode.video_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline truncate block"
            >
              Voir la vidéo
            </a>
          </div>
        </div>
      )}

      {/* Dernière modification */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <User className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Modifié le</p>
          <p className="text-sm text-gray-700">{formatDate(episode.updated_at)}</p>
        </div>
      </div>
    </div>
  )
}
