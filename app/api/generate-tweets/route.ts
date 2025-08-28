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
    // Vérifier la configuration Anthropic
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required')
    }

    if (process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key' || process.env.ANTHROPIC_API_KEY === '') {
      throw new Error('ANTHROPIC_API_KEY is not properly configured. Please set a valid API key.')
    }

    const { episodeId } = await request.json()

    if (!episodeId) {
      return NextResponse.json(
        { error: 'ID de l\'épisode requis' },
        { status: 400 }
      )
    }

    console.log(`🎯 Génération de tweets pour l'épisode: ${episodeId}`)

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

    console.log(`📝 Transcription trouvée, statut: ${transcription.processing_status}`)

    // Préparer le prompt pour Claude
    const prompt = `Tu es un expert en marketing digital et réseaux sociaux. Tu dois créer entre 10 et 15 tweets pour promouvoir un épisode de podcast.

ÉPISODE: ${episode.title}
DESCRIPTION: ${episode.description || 'Aucune description disponible'}

TRANSCRIPTION:
${transcription.raw_text || transcription.cleaned_text || 'Aucune transcription disponible'}

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

    console.log(`🤖 Appel de Claude avec le prompt...`)

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

    console.log(`✅ Réponse reçue de Claude`)

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Réponse invalide de Claude: type non-text')
    }

    console.log(`📄 Réponse brute de Claude:`, content.text.substring(0, 500) + '...')

    // Parser la réponse JSON
    let tweets
    try {
      // Extraire le JSON de la réponse
      const jsonMatch = content.text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        console.error('❌ Aucun JSON trouvé dans la réponse')
        console.error('Réponse complète:', content.text)
        throw new Error('Format de réponse invalide: aucun JSON trouvé')
      }
      
      const jsonString = jsonMatch[0]
      console.log(`🔍 JSON extrait:`, jsonString.substring(0, 300) + '...')
      
      tweets = JSON.parse(jsonString)
      
      // Validation des tweets
      if (!Array.isArray(tweets)) {
        throw new Error('Format de tweets invalide: pas un tableau')
      }

      console.log(`✅ ${tweets.length} tweets parsés avec succès`)

      tweets = tweets.map((tweet, index) => {
        if (!tweet.content || !tweet.hashtags) {
          throw new Error(`Tweet ${index + 1}: structure invalide (content ou hashtags manquants)`)
        }
        
        // Vérifier la limite de caractères
        if (tweet.content.length > 200) {
          throw new Error(`Tweet ${index + 1} trop long: ${tweet.content.length} caractères`)
        }
        
        return {
          content: tweet.content,
          hashtags: Array.isArray(tweet.hashtags) ? tweet.hashtags : [tweet.hashtags]
        }
      })

      console.log(`✅ Validation des tweets terminée`)

    } catch (parseError) {
      console.error('❌ Erreur de parsing:', parseError)
      console.error('Réponse brute de Claude:', content.text)
      throw new Error(`Erreur lors du parsing de la réponse: ${parseError instanceof Error ? parseError.message : 'Erreur inconnue'}`)
    }

    return NextResponse.json({ tweets })

  } catch (error) {
    console.error('❌ Erreur lors de la génération des tweets:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la génération des tweets' },
      { status: 500 }
    )
  }
}
