import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '../../../types/database'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📝 Données reçues:', body)
    
    const { content, scheduledDate, scheduledTime, episodeId } = body

    // Validation des données d'entrée
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Le contenu du tweet est requis et doit être une chaîne de caractères' },
        { status: 400 }
      )
    }

    if (!scheduledDate || typeof scheduledDate !== 'string') {
      return NextResponse.json(
        { error: 'La date de planification est requise et doit être une chaîne' },
        { status: 400 }
      )
    }

    if (!scheduledTime || typeof scheduledTime !== 'string') {
      return NextResponse.json(
        { error: 'L\'heure de planification est requise et doit être une chaîne' },
        { status: 400 }
      )
    }

    // Validation de la longueur du contenu
    if (content.length > 280) {
      return NextResponse.json(
        { error: 'Le contenu du tweet ne peut pas dépasser 280 caractères' },
        { status: 400 }
      )
    }

    // Construire la date complète et vérifier qu'elle est dans le futur
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
    const now = new Date()
    
    console.log('📅 Validation de date:')
    console.log('  - Date reçue:', scheduledDate)
    console.log('  - Heure reçue:', scheduledTime)
    console.log('  - DateTime construite:', scheduledDateTime.toISOString())
    console.log('  - Maintenant:', now.toISOString())
    console.log('  - Différence (ms):', scheduledDateTime.getTime() - now.getTime())
    
    if (isNaN(scheduledDateTime.getTime())) {
      return NextResponse.json(
        { error: 'Format de date/heure invalide' },
        { status: 400 }
      )
    }
    
    if (scheduledDateTime <= now) {
      return NextResponse.json(
        { error: 'La date de planification doit être dans le futur' },
        { status: 400 }
      )
    }

    console.log('✅ Validation des données réussie')

    // Récupérer l'utilisateur à partir de l'épisode si episodeId est fourni
    let userId: string
    if (episodeId) {
      const { data: episode, error: episodeError } = await supabase
        .from('episodes')
        .select('user_id')
        .eq('id', episodeId)
        .single()

      if (episodeError) {
        console.error('❌ Erreur lors de la récupération de l\'épisode:', episodeError)
        return NextResponse.json(
          { error: 'Erreur lors de la récupération de l\'épisode' },
          { status: 500 }
        )
      }

      if (!episode) {
        return NextResponse.json(
          { error: 'Épisode non trouvé' },
          { status: 404 }
        )
      }

      userId = episode.user_id
      console.log('✅ Épisode trouvé, user_id:', userId)
    } else {
      // Si pas d'episodeId, on doit récupérer l'userId depuis le body ou l'auth
      // Pour l'instant, on va exiger episodeId ou userId dans le body
      if (!body.userId) {
        return NextResponse.json(
          { error: 'userId ou episodeId est requis' },
          { status: 400 }
        )
      }
      userId = body.userId
    }

    // Préparer les métadonnées
    const metadata = {
      originalContent: content,
      finalContent: content
    }

    // Insérer le tweet planifié
    const { data: tweet, error: insertError } = await supabase
      .from('scheduled_tweets')
      .insert({
        user_id: userId,
        content: content,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        episode_id: episodeId || null,
        metadata: metadata,
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Erreur lors de l\'insertion du tweet:', insertError)
      return NextResponse.json(
        { error: 'Erreur lors de la planification du tweet' },
        { status: 500 }
      )
    }

    console.log('✅ Tweet planifié avec succès:', tweet)

    return NextResponse.json({ 
      success: true, 
      tweet,
      message: 'Tweet planifié avec succès'
    })

  } catch (error) {
    console.error('❌ Erreur lors de la planification du tweet:', error)
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
