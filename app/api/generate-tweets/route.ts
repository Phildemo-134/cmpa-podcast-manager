import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

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
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (transcriptionError || !transcription) {
      return NextResponse.json(
        { error: 'Transcription non trouvée' },
        { status: 404 }
      )
    }

    if (transcription.processing_status !== 'completed') {
      return NextResponse.json(
        { error: 'La transcription n\'est pas encore terminée' },
        { status: 400 }
      )
    }

    // Préparer le prompt pour Claude
    const prompt = `Tu es un expert en marketing digital et réseaux sociaux. Tu dois créer entre 10 et 15 tweets pour promouvoir un épisode de podcast.

ÉPISODE: ${episode.title}
DESCRIPTION: ${episode.description || 'Aucune description disponible'}

TRANSCRIPTION:
${transcription.transcript}

INSTRUCTIONS:
1. Crée entre 10 et 15 tweets maximum
2. Chaque tweet doit faire moins de 200 caractères (incluant les espaces)
3. Reprends le contenu, le ton et le style de la transcription
4. Adapte le contenu pour Twitter/X
5. Utilise des hashtags pertinents (2-3 par tweet maximum)
6. Varie les approches: questions, citations, conseils, insights, etc.
7. Garde le ton professionnel mais accessible
8. Évite les répétitions entre les tweets

FORMAT DE RÉPONSE:
Retourne uniquement un tableau JSON avec cette structure:
[
  {
    "content": "Contenu du tweet avec moins de 200 caractères",
    "hashtags": ["hashtag1", "hashtag2"]
  }
]

Assure-toi que le JSON soit valide et que chaque tweet respecte la limite de caractères.`

    // Appeler Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Réponse invalide de Claude')
    }

    // Parser la réponse JSON
    let tweets
    try {
      // Extraire le JSON de la réponse
      const jsonMatch = content.text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('Format de réponse invalide')
      }
      
      tweets = JSON.parse(jsonMatch[0])
      
      // Validation des tweets
      if (!Array.isArray(tweets)) {
        throw new Error('Format de tweets invalide')
      }

      tweets = tweets.map(tweet => {
        if (!tweet.content || !tweet.hashtags) {
          throw new Error('Structure de tweet invalide')
        }
        
        // Vérifier la limite de caractères
        if (tweet.content.length > 200) {
          throw new Error(`Tweet trop long: ${tweet.content.length} caractères`)
        }
        
        return {
          content: tweet.content,
          hashtags: Array.isArray(tweet.hashtags) ? tweet.hashtags : [tweet.hashtags]
        }
      })

    } catch (parseError) {
      console.error('Erreur de parsing:', parseError)
      console.error('Réponse brute de Claude:', content.text)
      throw new Error('Erreur lors du parsing de la réponse')
    }

    return NextResponse.json({ tweets })

  } catch (error) {
    console.error('Erreur lors de la génération des tweets:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la génération des tweets' },
      { status: 500 }
    )
  }
}
