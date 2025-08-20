import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '../../../../types/database'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(request: NextRequest) {
  try {
    const { tweetId, userId } = await request.json()

    if (!tweetId || !userId) {
      return NextResponse.json(
        { error: 'ID du tweet et ID utilisateur sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur est propriétaire du tweet
    const { data: tweet, error: fetchError } = await supabase
      .from('scheduled_tweets')
      .select('user_id, status')
      .eq('id', tweetId)
      .single()

    if (fetchError || !tweet) {
      return NextResponse.json(
        { error: 'Tweet non trouvé' },
        { status: 404 }
      )
    }

    if (tweet.user_id !== userId) {
      return NextResponse.json(
        { error: 'Non autorisé à supprimer ce tweet' },
        { status: 403 }
      )
    }

    // Supprimer le tweet
    const { error: deleteError } = await supabase
      .from('scheduled_tweets')
      .delete()
      .eq('id', tweetId)

    if (deleteError) {
      console.error('Erreur Supabase lors de la suppression:', deleteError)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du tweet' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Tweet supprimé avec succès' 
    })

  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
