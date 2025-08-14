import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    // TODO: Intégrer avec un service de transcription réel
    // Pour l'instant, on simule le processus
    // Exemples de services : OpenAI Whisper, AssemblyAI, Rev.ai, etc.
    
    // Simuler le début de la transcription
    console.log(`Début de la transcription pour l'épisode ${episodeId}`)
    
    // Ici, vous pourriez :
    // 1. Appeler l'API de transcription (OpenAI Whisper, AssemblyAI, etc.)
    // 2. Uploader le fichier audio vers le service
    // 3. Récupérer l'ID de job de transcription
    // 4. Stocker cet ID pour le suivi

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
