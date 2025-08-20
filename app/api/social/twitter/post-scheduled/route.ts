import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { content, userId } = await request.json()
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Contenu du tweet requis' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      )
    }

    // Récupérer les tokens Twitter depuis Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Récupérer la connexion Twitter de l'utilisateur spécifique
    const { data: connection, error: fetchError } = await supabase
      .from('social_connections')
      .select('*')
      .eq('platform', 'twitter')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (fetchError || !connection) {
      console.error('Erreur récupération connexion Twitter:', fetchError)
      return NextResponse.json(
        { error: 'Aucune connexion Twitter active trouvée pour cet utilisateur' },
        { status: 404 }
      )
    }

    console.log(`📱 Publication sur Twitter pour l'utilisateur ${userId}`)
    console.log(`🔑 Utilisation du token: ${connection.access_token.substring(0, 20)}...`)

    // Publier le tweet via l'API Twitter
    const twitterResponse = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: content
      })
    })

    if (!twitterResponse.ok) {
      const errorData = await twitterResponse.json()
      console.error('Erreur Twitter API:', errorData)
      console.error('Status:', twitterResponse.status)
      console.error('Headers:', Object.fromEntries(twitterResponse.headers.entries()))
      
      return NextResponse.json(
        { 
          error: 'Erreur lors de la publication sur Twitter',
          details: errorData,
          status: twitterResponse.status
        },
        { status: twitterResponse.status }
      )
    }

    const tweetData = await twitterResponse.json()
    console.log(`✅ Tweet publié avec succès sur Twitter`)
    console.log(`   Tweet ID: ${tweetData.data?.id}`)
    console.log(`   Contenu: "${content}"`)
    
    return NextResponse.json({
      success: true,
      tweet: tweetData,
      message: 'Tweet publié avec succès !',
      tweetId: tweetData.data?.id
    })

  } catch (error) {
    console.error('Erreur lors de la publication du tweet planifié:', error)
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: error.message
      },
      { status: 500 }
    )
  }
}
