import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '../../../../types/database'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PUT(request: NextRequest) {
  try {
    const { tweetId, userId } = await request.json()

    if (!tweetId || !userId) {
      return NextResponse.json(
        { error: 'ID du tweet et ID utilisateur requis' },
        { status: 400 }
      )
    }

    // Vérifier que le tweet appartient à l'utilisateur et peut être annulé
    const { data: existingTweet, error: fetchError } = await supabase
      .from('scheduled_tweets')
      .select('*')
      .eq('id', tweetId)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single()

    if (fetchError || !existingTweet) {
      return NextResponse.json(
        { error: 'Tweet non trouvé ou ne peut pas être annulé' },
        { status: 404 }
      )
    }

    // Mettre à jour le statut du tweet
    const { data, error } = await supabase
      .from('scheduled_tweets')
      .update({ status: 'cancelled' })
      .eq('id', tweetId)
      .eq('user_id', userId)
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
