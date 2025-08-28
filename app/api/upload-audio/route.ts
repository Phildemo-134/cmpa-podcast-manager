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
  let episodeId: string = ''
  
  try {
    console.log('🚀 Début de l\'upload audio...')
    
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ Token d\'authentification manquant')
      return NextResponse.json(
        { error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('❌ Erreur d\'authentification:', authError)
      return NextResponse.json(
        { error: 'Token d\'authentification invalide' },
        { status: 401 }
      )
    }

    console.log(`✅ Utilisateur authentifié: ${user.id}`)

    // Récupérer les données de la requête
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const timestamps = formData.get('timestamps') as string
    const videoUrl = formData.get('videoUrl') as string

    console.log('📝 Données reçues:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      title,
      hasDescription: !!description,
      hasTimestamps: !!timestamps,
      hasVideoUrl: !!videoUrl
    })

    if (!file) {
      console.error('❌ Fichier audio manquant')
      return NextResponse.json(
        { error: 'Fichier audio manquant' },
        { status: 400 }
      )
    }

    if (!title?.trim()) {
      console.error('❌ Titre de l\'épisode manquant')
      return NextResponse.json(
        { error: 'Titre de l\'épisode manquant' },
        { status: 400 }
      )
    }

    // Validation du fichier
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/aac', 'audio/ogg']
    const maxSize = 500 * 1024 * 1024 // 500MB

    if (!allowedTypes.includes(file.type)) {
      console.error('❌ Type de fichier non supporté:', file.type)
      return NextResponse.json(
        { error: 'Type de fichier non supporté. Utilisez MP3, WAV, M4A, AAC ou OGG.' },
        { status: 400 }
      )
    }

    if (file.size > maxSize) {
      console.error('❌ Fichier trop volumineux:', file.size, 'bytes')
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Taille maximum : 500MB.' },
        { status: 400 }
      )
    }

    console.log('✅ Validation du fichier réussie')

    // Calculer la durée du fichier audio
    const duration = await getAudioDuration(file)
    console.log(`⏱️ Durée calculée: ${duration} secondes`)
    
    // Créer l'épisode dans la base de données d'abord
    console.log('💾 Création de l\'épisode dans la base de données...')
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
          status: 'uploaded',
          s3_key: '', // Sera mis à jour après l'upload S3
        }
      ])
      .select()
      .single()

    if (episodeError) {
      console.error('❌ Erreur création épisode:', episodeError)
      return NextResponse.json(
        { error: `Erreur création épisode: ${episodeError.message}` },
        { status: 500 }
      )
    }

    console.log(`✅ Épisode créé avec l'ID: ${episode.id}`)
    episodeId = episode.id // Stocker l'ID de l'épisode créé

    // Upload vers S3
    console.log('☁️ Upload vers S3...')
    const s3Result = await uploadAudioToS3(file, user.id, episode.id)
    console.log('✅ Upload S3 réussi:', s3Result)

    // Mettre à jour l'épisode avec les informations S3
    console.log('💾 Mise à jour de l\'épisode avec les infos S3...')
    const { error: updateError } = await supabase
      .from('episodes')
      .update({
        audio_file_url: s3Result.url,
        s3_key: s3Result.key,
        status: 'completed'
      })
      .eq('id', episode.id)

    if (updateError) {
      console.error('❌ Erreur mise à jour épisode:', updateError)
      // Si la mise à jour échoue, on supprime l'épisode créé
      await supabase.from('episodes').delete().eq('id', episode.id)
      return NextResponse.json(
        { error: `Erreur mise à jour épisode: ${updateError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Épisode mis à jour avec succès')

    const result = {
      success: true,
      episode: {
        ...episode,
        audio_file_url: s3Result.url,
        s3_key: s3Result.key,
        status: 'completed',
        duration: duration
      }
    }

    console.log('🎉 Upload terminé avec succès')
    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ Erreur upload audio:', error)
    
    // Nettoyer l'épisode créé en cas d'erreur
    if (episodeId) {
      try {
        await supabase.from('episodes').delete().eq('id', episodeId)
        console.log('🧹 Épisode nettoyé après erreur')
      } catch (cleanupError) {
        console.error('❌ Erreur lors du nettoyage:', cleanupError)
      }
    }
    
    return NextResponse.json(
      { 
        error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
      },
      { status: 500 }
    )
  }
}
