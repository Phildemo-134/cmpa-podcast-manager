import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { uploadAudioToS3 } from '@/lib/s3'

// Fonction pour calculer la durée d'un fichier audio
// Note: La durée sera calculée côté client lors de la lecture
// Pour l'instant, on retourne 0 et la durée sera mise à jour plus tard
async function getAudioDuration(file: File): Promise<number> {
  // La durée sera calculée côté client lors de la première lecture
  // ou via une API de traitement audio
  return 0
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token d\'authentification invalide' },
        { status: 401 }
      )
    }

    // Récupérer les données de la requête
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const timestamps = formData.get('timestamps') as string
    const videoUrl = formData.get('videoUrl') as string

    if (!file) {
      return NextResponse.json(
        { error: 'Fichier audio manquant' },
        { status: 400 }
      )
    }

    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Titre de l\'épisode manquant' },
        { status: 400 }
      )
    }

    // Validation du fichier
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/aac', 'audio/ogg']
    const maxSize = 500 * 1024 * 1024 // 500MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non supporté. Utilisez MP3, WAV, M4A, AAC ou OGG.' },
        { status: 400 }
      )
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Taille maximum : 500MB.' },
        { status: 400 }
      )
    }

    // Calculer la durée du fichier audio
    const duration = await getAudioDuration(file)
    
    // Créer l'épisode dans la base de données d'abord
    const { data: episode, error: episodeError } = await supabase
      .from('episodes')
      .insert([
        {
          user_id: user.id,
          title: title.trim(),
          description: description?.trim() || null,
          audio_file_url: '', // Sera mis à jour après l'upload S3
          file_size: file.size,
          duration: duration,
          timestamps: timestamps?.trim() || null,
          video_url: videoUrl?.trim() || null,
          status: 'uploading',
          s3_key: '', // Sera mis à jour après l'upload S3
        }
      ])
      .select()
      .single()

    if (episodeError) {
      console.error('Erreur création épisode:', episodeError)
      return NextResponse.json(
        { error: `Erreur création épisode: ${episodeError.message}` },
        { status: 500 }
      )
    }

    // Upload vers S3
    const s3Result = await uploadAudioToS3(file, user.id, episode.id)

    // Mettre à jour l'épisode avec les informations S3
    const { error: updateError } = await supabase
      .from('episodes')
      .update({
        audio_file_url: s3Result.url,
        s3_key: s3Result.key,
        status: 'completed'
      })
      .eq('id', episode.id)

    if (updateError) {
      console.error('Erreur mise à jour épisode:', updateError)
      // Si la mise à jour échoue, on supprime l'épisode créé
      await supabase.from('episodes').delete().eq('id', episode.id)
      return NextResponse.json(
        { error: `Erreur mise à jour épisode: ${updateError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      episode: {
        ...episode,
        audio_file_url: s3Result.url,
        s3_key: s3Result.key,
        status: 'completed',
        duration: duration
      }
    })

  } catch (error) {
    console.error('Erreur upload audio:', error)
    return NextResponse.json(
      { 
        error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
      },
      { status: 500 }
    )
  }
}
