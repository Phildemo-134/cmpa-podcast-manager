import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '../../../../types/database'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { tweetId } = await request.json()

    if (!tweetId) {
      return NextResponse.json(
        { error: 'ID du tweet requis' },
        { status: 400 }
      )
    }

    // Vérifier que le tweet existe et n'est pas déjà publié
    const { data: existingTweet, error: fetchError } = await supabase
      .from('scheduled_tweets')
      .select('*')
      .eq('id', tweetId)
      .single()

    if (fetchError || !existingTweet) {
      return NextResponse.json(
        { error: 'Tweet non trouvé' },
        { status: 404 }
      )
    }

    if (existingTweet.status === 'published') {
      return NextResponse.json(
        { error: 'Impossible d\'annuler un tweet déjà publié' },
        { status: 400 }
      )
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      status: 'cancelled'
    }

    // Ajouter updated_at si la colonne existe
    try {
      const { error: checkError } = await supabase
        .from('scheduled_tweets')
        .select('updated_at')
        .limit(1)

      if (!checkError) {
        updateData.updated_at = new Date().toISOString()
      }
    } catch (columnError) {
              if (process.env.NODE_ENV === 'development') {
          if (process.env.NODE_ENV === 'development') {
        console.log('Colonne updated_at non disponible');
      }
        }
    }

    // Mettre à jour le statut du tweet
    const { data, error } = await supabase
      .from('scheduled_tweets')
      .update(updateData)
      .eq('id', tweetId)
      .select()
      .single()

    if (error) {
      console.error('Erreur Supabase:', error)
      return NextResponse.json(
        { error: 'Erreur lors de l\'annulation du tweet' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      tweet: data 
    })

  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
