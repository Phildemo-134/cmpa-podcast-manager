'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, Volume2, Download } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface EpisodeAudioPlayerProps {
  episode: {
    id: string
    title: string
    s3_key: string | null
    audio_file_url: string
    duration?: number | null
  }
}

export function EpisodeAudioPlayer({ episode }: EpisodeAudioPlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)

  useEffect(() => {
    if (episode.s3_key) {
      generateSignedUrl()
    } else {
      setAudioUrl(episode.audio_file_url)
    }
  }, [episode])

  const generateSignedUrl = async () => {
    if (!episode.s3_key) return

    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Session utilisateur non trouvée')
      }

      const response = await fetch(`/api/audio-url?key=${encodeURIComponent(episode.s3_key)}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la génération de l\'URL signée')
      }

      const { url } = await response.json()
      setAudioUrl(url)
    } catch (error) {
      console.error('Erreur génération URL signée:', error)
      // Fallback vers l'URL directe si disponible
      setAudioUrl(episode.audio_file_url)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlayPause = () => {
    const audio = document.getElementById('audio-player') as HTMLAudioElement
    if (audio) {
      if (isPlaying) {
        audio.pause()
      } else {
        audio.play()
      }
    }
  }

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = e.currentTarget
    setCurrentTime(audio.currentTime)
    setDuration(audio.duration)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = document.getElementById('audio-player') as HTMLAudioElement
    if (audio) {
      const time = parseFloat(e.target.value)
      audio.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value)
    setVolume(volume)
    const audio = document.getElementById('audio-player') as HTMLAudioElement
    if (audio) {
      audio.volume = volume
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a')
      link.href = audioUrl
      link.download = `${episode.title}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-gray-600">Chargement de l'audio...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!audioUrl) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-center text-gray-500">Aucun fichier audio disponible</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Contrôles de lecture */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={handlePlayPause}
              variant="outline"
              size="lg"
              className="w-16 h-16 rounded-full"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>
            
            <Button
              onClick={handleDownload}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Télécharger</span>
            </Button>
          </div>

          {/* Barre de progression */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Contrôle du volume */}
          <div className="flex items-center space-x-2">
            <Volume2 className="h-4 w-4 text-gray-600" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Élément audio caché */}
          <audio
            id="audio-player"
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onLoadedMetadata={handleTimeUpdate}
            preload="metadata"
          />
        </div>
      </CardContent>
    </Card>
  )
}
