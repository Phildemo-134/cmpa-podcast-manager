import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { deepgramService } from '../../../lib/deepgram'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  let episodeId: string = ''
  
  try {
    const body = await request.json()
    episodeId = body.episodeId

    if (!episodeId) {
      return NextResponse.json(
        { error: 'ID de l\'épisode requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'épisode existe et récupérer ses informations
    const { data: episode, error: episodeError } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', episodeId)
      .single()

    if (episodeError || !episode) {
      return NextResponse.json(
        { error: 'Épisode non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que l'épisode a un fichier audio
    if (!episode.audio_file_url) {
      return NextResponse.json(
        { error: 'Aucun fichier audio associé à cet épisode' },
        { status: 400 }
      )
    }

    // Mettre à jour le statut de l'épisode
    const { error: updateError } = await supabase
      .from('episodes')
      .update({ 
        status: 'transcribing',
        updated_at: new Date().toISOString()
      })
      .eq('id', episodeId)

    if (updateError) {
      throw updateError
    }

    // Créer un enregistrement de transcription
    const { data: transcription, error: transcriptionError } = await supabase
      .from('transcriptions')
      .insert({
        episode_id: episodeId,
        raw_text: '',
        type: 'raw',
        processing_status: 'pending'
      })
      .select()
      .single()

    if (transcriptionError) {
      throw transcriptionError
    }

    // Effectuer la transcription avec Deepgram
    console.log(`Début de la transcription pour l'épisode ${episodeId}`)
    console.log(`URL audio: ${episode.audio_file_url}`)
    
    try {
      // Effectuer la transcription
      const transcriptionResult = await deepgramService.transcribeAudio(
        episode.audio_file_url,
        {
          model: 'nova-2',
          language: 'fr', // Détection automatique si pas spécifié
          smart_format: true,
          punctuate: true,
          diarize: true, // Désactivé car peut ne pas être disponible dans tous les plans
          utterances: true // Désactivé car peut ne pas être disponible dans tous les plans
        }
      )
      
      // Mettre à jour la transcription avec le résultat
      const { error: updateTranscriptionError } = await supabase
        .from('transcriptions')
        .update({
          raw_text: transcriptionResult.raw_text,
          cleaned_text: transcriptionResult.formatted_text,
          timestamps: transcriptionResult.timestamps,
          processing_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', transcription.id)
      
      if (updateTranscriptionError) {
        throw updateTranscriptionError
      }
      
      // Mettre à jour le statut de l'épisode
      const { error: updateEpisodeError } = await supabase
        .from('episodes')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', episodeId)
      
      if (updateEpisodeError) {
        throw updateEpisodeError
      }
      
      console.log(`Transcription terminée pour l'épisode ${episodeId}`)
      
    } catch (transcriptionError) {
      console.error('Erreur lors de la transcription Deepgram:', transcriptionError)
      
      // Mettre à jour le statut de la transcription en cas d'erreur
      await supabase
        .from('transcriptions')
        .update({
          processing_status: 'error',
          updated_at: new Date().toISOString()
        })
        .eq('id', transcription.id)
      
      // Mettre à jour le statut de l'épisode
      await supabase
        .from('episodes')
        .update({
          status: 'error',
          error_message: transcriptionError instanceof Error ? transcriptionError.message : 'Erreur lors de la transcription',
          updated_at: new Date().toISOString()
        })
        .eq('id', episodeId)
      
      throw transcriptionError
    }

    return NextResponse.json({
      success: true,
      message: 'Transcription démarrée',
      transcriptionId: transcription.id,
      episodeId: episodeId
    })

  } catch (error) {
    console.error('Erreur lors de la transcription:', error)
    
    // Mettre à jour le statut de l'épisode en cas d'erreur
    try {
      await supabase
        .from('episodes')
        .update({ 
          status: 'error',
                  error_message: error instanceof Error ? error.message : 'Erreur inconnue',
        updated_at: new Date().toISOString()
        })
        .eq('id', episodeId)
    } catch (updateError) {
      console.error('Erreur lors de la mise à jour du statut:', updateError)
    }

    return NextResponse.json(
      { 
        error: 'Erreur lors de la transcription',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const episodeId = searchParams.get('episodeId')

    if (!episodeId) {
      return NextResponse.json(
        { error: 'ID de l\'épisode requis' },
        { status: 400 }
      )
    }

    // Récupérer le statut de la transcription
    const { data: transcription, error } = await supabase
      .from('transcriptions')
      .select('*')
      .eq('episode_id', episodeId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Transcription non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      transcription
    })

  } catch (error) {
    console.error('Erreur lors de la récupération du statut:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération du statut',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
