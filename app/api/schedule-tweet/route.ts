import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '../../../types/database'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { content, hashtags, scheduledAt, episodeId } = await request.json()

    if (!content || !scheduledAt || !episodeId) {
      return NextResponse.json(
        { error: 'Contenu, date de planification et ID de l\'épisode sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que la date est dans le futur
    const scheduledDateTime = new Date(scheduledAt)
    const now = new Date()
    
    if (scheduledDateTime <= now) {
      return NextResponse.json(
        { error: 'La date de planification doit être dans le futur' },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur à partir de l'épisode
    const { data: episode, error: episodeError } = await supabase
      .from('episodes')
      .select('user_id')
      .eq('id', episodeId)
      .single()

    if (episodeError || !episode) {
      return NextResponse.json(
        { error: 'Épisode non trouvé' },
        { status: 404 }
      )
    }

    // Préparer le contenu du tweet avec hashtags
    const tweetContent = hashtags && hashtags.length > 0 
      ? `${content} ${hashtags.map((tag: string) => `#${tag}`).join(' ')}`
      : content

    // Préparer les données d'insertion
    const insertData: any = {
      content: tweetContent,
      scheduled_date: scheduledDateTime.toISOString().split('T')[0],
      scheduled_time: scheduledDateTime.toTimeString().split(' ')[0],
      user_id: episode.user_id,
      status: 'pending'
    }

    // Ajouter episode_id et metadata si les colonnes existent
    try {
      // Vérifier si la colonne episode_id existe
      const { error: checkError } = await supabase
        .from('scheduled_tweets')
        .select('episode_id')
        .limit(1)

      if (!checkError) {
        insertData.episode_id = episodeId
        insertData.metadata = {
          original_content: content,
          hashtags: hashtags || [],
          episode_id: episodeId
        }
      }
    } catch (columnError) {
      console.log('Colonnes episode_id et metadata non disponibles, utilisation de la structure de base')
    }

    // Insérer le tweet planifié dans la base de données
    const { data, error } = await supabase
      .from('scheduled_tweets')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Erreur Supabase:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la sauvegarde du tweet' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      tweet: data,
      scheduledFor: scheduledDateTime.toISOString()
    })

  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const episodeId = searchParams.get('episodeId')
    const userId = searchParams.get('userId')

    if (!episodeId && !userId) {
      return NextResponse.json(
        { error: 'ID de l\'épisode ou ID utilisateur requis' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('scheduled_tweets')
      .select('*')
      .order('scheduled_date', { ascending: true })

    try {
      // Vérifier si la colonne episode_id existe
      const { error: checkError } = await supabase
        .from('scheduled_tweets')
        .select('episode_id')
        .limit(1)

      if (!checkError && episodeId) {
        // Utiliser episode_id si disponible
        query = query.eq('episode_id', episodeId)
      } else if (userId) {
        // Fallback sur user_id
        query = query.eq('user_id', userId)
      }
    } catch (columnError) {
      console.log('Colonne episode_id non disponible, utilisation de user_id')
      if (userId) {
        query = query.eq('user_id', userId)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('Erreur Supabase:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des tweets' },
        { status: 500 }
      )
    }

    return NextResponse.json({ tweets: data })

  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
