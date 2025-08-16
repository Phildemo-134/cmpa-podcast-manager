import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { episodeId } = await request.json()

    if (!episodeId) {
      return NextResponse.json(
        { error: 'ID de l\'épisode requis' },
        { status: 400 }
      )
    }

    // Récupérer l'épisode et sa transcription
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

    const { data: transcription, error: transcriptionError } = await supabase
      .from('transcriptions')
      .select('*')
      .eq('episode_id', episodeId)
      .eq('processing_status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (transcriptionError || !transcription) {
      return NextResponse.json(
        { error: 'Transcription non trouvée ou non terminée' },
        { status: 400 }
      )
    }

    // Préparer le prompt pour Claude
    const prompt = `Tu es un expert en création de contenu pour podcasts. Ta mission est de créer une description d'épisode de podcast professionnelle et engageante basée sur la transcription fournie.

Règles importantes :
1. La description doit être concise (150-200 mots maximum)
2. Elle doit captiver l'auditeur et donner envie d'écouter
3. Elle doit être adaptée pour un lecteur de podcast (Spotify, Apple Podcasts, etc.)
4. Utilise un ton professionnel pas trop marketing mais accessible
5. Inclus les points clés et sujets abordés
6. Termine par un appel à l'action subtil

Transcription de l'épisode :
${transcription.optimized_text || transcription.raw_text}

Titre de l'épisode : ${episode.title}

Génère maintenant une description optimisée pour un lecteur de podcast :`

    // Appeler Claude Sonnet 3.5
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const generatedDescription = message.content[0].type === 'text' 
      ? message.content[0].text 
      : ''

    if (!generatedDescription) {
      return NextResponse.json(
        { error: 'Erreur lors de la génération de la description' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      description: generatedDescription.trim(),
    })

  } catch (error) {
    console.error('Erreur lors de la génération de la description:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
