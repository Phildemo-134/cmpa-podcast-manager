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
    const prompt = `Tu es un expert en analyse de contenu audio et en création de timestamps pour podcasts. Ta mission est d'analyser la transcription fournie et de créer des timestamps organisés et clairs pour chaque sujet ou section abordée.
N'inclus aucune phrase du type:  "voici les timestamps" ou toute autre phrase explicative des timestamps.
Règles importantes :
1. Analyse la transcription pour identifier les sujets principaux et les transitions
2. Crée des timestamps au format "[MM:SS] - Sujet/Description"
3. Organise les timestamps chronologiquement
4. Sois précis dans la détection des changements de sujets
5. Utilise des descriptions courtes mais claires pour chaque section
6. Identifie au moins 8-12 sections principales
7. Inclus les introductions, conclusions et transitions importantes
8. Format de sortie : un timestamp par ligne, sans numérotation

Transcription de l'épisode :
${transcription.optimized_text || transcription.raw_text}

Titre de l'épisode : ${episode.title}

Génère maintenant des timestamps organisés et clairs pour cet épisode :`

    // Appeler Claude Sonnet 3.5
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 800,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const generatedTimestamps = message.content[0].type === 'text' 
      ? message.content[0].text 
      : ''

    if (!generatedTimestamps) {
      return NextResponse.json(
        { error: 'Erreur lors de la génération des timestamps' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      timestamps: generatedTimestamps.trim(),
    })

  } catch (error) {
    console.error('Erreur lors de la génération des timestamps:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
