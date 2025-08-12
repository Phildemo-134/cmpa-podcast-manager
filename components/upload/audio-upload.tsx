'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileAudio, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface UploadedFile {
  file: File
  id: string
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}

export function AudioUpload() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [timestamps, setTimestamps] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const router = useRouter()

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/aac', 'audio/ogg']
    const maxSize = 500 * 1024 * 1024 // 500MB

    if (!allowedTypes.includes(file.type)) {
      return 'Type de fichier non supporté. Utilisez MP3, WAV, M4A, AAC ou OGG.'
    }

    if (file.size > maxSize) {
      return 'Fichier trop volumineux. Taille maximum : 500MB.'
    }

    return null
  }

  const handleFiles = useCallback((files: FileList) => {
    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'uploading' as const
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id))
  }

  const uploadToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substr(2, 9)}.${fileExt}`
    const filePath = `audio/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('podcast-audio')
      .upload(filePath, file)

    if (uploadError) {
      throw new Error(`Erreur d'upload: ${uploadError.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('podcast-audio')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const createEpisode = async (audioUrl: string, file: File) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('Utilisateur non connecté')

    const { data: episode, error } = await supabase
      .from('episodes')
      .insert([
        {
          user_id: user.id,
          title: title || file.name.replace(/\.[^/.]+$/, ''),
          description: description || null,
          audio_file_url: audioUrl,
          file_size: file.size,
          timestamps: timestamps || null,
          video_url: videoUrl || null,
          status: 'uploading'
        }
      ])
      .select()
      .single()

    if (error) throw new Error(`Erreur création épisode: ${error.message}`)
    return episode
  }

  const handleUpload = async () => {
    if (!title.trim() || uploadedFiles.length === 0) {
      alert('Veuillez saisir un titre et sélectionner au moins un fichier audio.')
      return
    }

    setIsUploading(true)

    try {
      for (const uploadedFile of uploadedFiles) {
        // Validate file
        const validationError = validateFile(uploadedFile.file)
        if (validationError) {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === uploadedFile.id 
                ? { ...f, status: 'error' as const, error: validationError }
                : f
            )
          )
          continue
        }

        // Upload to Supabase storage
        const audioUrl = await uploadToSupabase(uploadedFile.file)
        
        // Create episode in database
        const episode = await createEpisode(audioUrl, uploadedFile.file)
        
        // Update file status
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, status: 'success' as const, progress: 100 }
              : f
          )
        )
      }

      // Redirect to dashboard after successful upload
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (error) {
      console.error('Upload error:', error)
      alert(`Erreur lors de l'upload: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Ajouter un nouvel épisode</CardTitle>
        <CardDescription>
          Uploadez votre fichier audio et ajoutez les métadonnées de base
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Episode Details */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Titre de l'épisode *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de votre épisode"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description (optionnel)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de votre épisode"
            />
          </div>

          <div>
            <Label htmlFor="timestamps">Timestamps (optionnel)</Label>
            <Input
              id="timestamps"
              value={timestamps}
              onChange={(e) => setTimestamps(e.target.value)}
              placeholder="00:00 - Introduction, 05:30 - Premier sujet..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: MM:SS - Description du segment
            </p>
          </div>

          <div>
            <Label htmlFor="video_url">URL Vidéo (optionnel)</Label>
            <Input
              id="video_url"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Lien vers la version vidéo de l'épisode
            </p>
          </div>
        </div>

        {/* File Upload */}
        <div className="space-y-4">
          <Label>Fichier audio *</Label>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Glissez-déposez votre fichier audio ici, ou
            </p>
            <Button
              variant="outline"
              onClick={() => document.getElementById('file-input')?.click()}
              disabled={isUploading}
            >
              Sélectionner un fichier
            </Button>
            <input
              id="file-input"
              type="file"
              accept="audio/*"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-2">
              Formats supportés : MP3, WAV, M4A, AAC, OGG (max 500MB)
            </p>
          </div>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <Label>Fichiers sélectionnés</Label>
            {uploadedFiles.map((uploadedFile) => (
              <div
                key={uploadedFile.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <FileAudio className="h-5 w-5 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {uploadedFile.status === 'uploading' && (
                    <div className="text-sm text-gray-600">
                      {uploadedFile.progress}%
                    </div>
                  )}
                  
                  {uploadedFile.status === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  
                  {uploadedFile.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadedFile.id)}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={isUploading || uploadedFiles.length === 0 || !title.trim()}
          className="w-full"
        >
          {isUploading ? 'Upload en cours...' : 'Créer l\'épisode'}
        </Button>
      </CardContent>
    </Card>
  )
}
