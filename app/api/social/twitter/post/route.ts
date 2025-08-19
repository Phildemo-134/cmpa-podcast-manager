import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message requis' },
        { status: 400 }
      )
    }

    // Récupérer les tokens Twitter depuis Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Récupérer la connexion Twitter de l'utilisateur
    const { data: connections, error: fetchError } = await supabase
      .from('social_connections')
      .select('*')
      .eq('platform', 'twitter')
      .eq('is_active', true)
      .single()

    if (fetchError || !connections) {
      return NextResponse.json(
        { error: 'Aucune connexion Twitter active trouvée' },
        { status: 404 }
      )
    }

    // Publier le tweet via l'API Twitter
    const twitterResponse = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connections.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: message
      })
    })

    if (!twitterResponse.ok) {
      const errorData = await twitterResponse.json()
      console.error('Erreur Twitter API:', errorData)
      return NextResponse.json(
        { error: 'Erreur lors de la publication sur Twitter' },
        { status: twitterResponse.status }
      )
    }

    const tweetData = await twitterResponse.json()
    
    return NextResponse.json({
      success: true,
      tweet: tweetData,
      message: 'Tweet publié avec succès !'
    })

  } catch (error) {
    console.error('Erreur lors de la publication du tweet:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
