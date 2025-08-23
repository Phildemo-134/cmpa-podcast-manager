import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '../../../../types/database'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Route API pour le cron job de publication automatique des tweets
 * Cette route peut être appelée par un service externe (GitHub Actions, AWS Lambda, etc.)
 * ou exécutée manuellement pour publier automatiquement les tweets programmés
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification du cron job (optionnel mais recommandé)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    console.log('⏰ Démarrage du cron job de publication des tweets')
    
    // Récupérer tous les tweets planifiés à publier maintenant
    const now = new Date()
    const { data: tweetsToPublish, error: fetchError } = await supabase
      .from('scheduled_tweets')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', now.toISOString())
      .order('scheduled_at', { ascending: true })

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des tweets:', fetchError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des tweets' },
        { status: 500 }
      )
    }

    if (!tweetsToPublish || tweetsToPublish.length === 0) {
      console.log('✨ Aucun tweet à publier pour le moment')
      return NextResponse.json({ 
        success: true, 
        message: 'Aucun tweet à publier',
        publishedCount: 0
      })
    }

    console.log(`📋 ${tweetsToPublish.length} tweet(s) à publier`)

    let publishedCount = 0
    let failedCount = 0

    // Traiter chaque tweet
    for (const tweet of tweetsToPublish) {
      try {
        console.log(`🚀 Publication du tweet ID: ${tweet.id}`)
        console.log(`📝 Contenu: ${tweet.content}`)
        console.log(`📅 Planifié pour: ${new Date(tweet.scheduled_at).toLocaleString('fr-FR')}`)

        // Publier sur Twitter via notre API
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/social/twitter/post-scheduled`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: tweet.content,
            userId: tweet.user_id
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`Erreur API Twitter: ${errorData.error || response.statusText}`)
        }

        // Mettre à jour le statut en base
        const { error: updateError } = await supabase
          .from('scheduled_tweets')
          .update({
            status: 'published',
            published_at: new Date().toISOString()
          })
          .eq('id', tweet.id)

        if (updateError) {
          console.error('❌ Erreur lors de la mise à jour du statut:', updateError)
          throw updateError
        }

        console.log(`✅ Tweet publié avec succès`)
        publishedCount++

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
        console.error(`❌ Erreur lors de la publication du tweet ${tweet.id}:`, errorMessage)
        
        // Marquer comme échoué
        await supabase
          .from('scheduled_tweets')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', tweet.id)
        
        failedCount++
      }
    }

    console.log(`🎉 Traitement terminé: ${publishedCount} publié(s), ${failedCount} échoué(s)`)

    return NextResponse.json({
      success: true,
      message: 'Cron job terminé avec succès',
      publishedCount,
      failedCount,
      totalProcessed: tweetsToPublish.length
    })

  } catch (error) {
    console.error('❌ Erreur critique dans le cron job:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

/**
 * Route GET pour les cron jobs Vercel
 * Les cron jobs Vercel appellent automatiquement cette méthode
 */
export async function GET() {
  try {
    console.log('⏰ Démarrage du cron job Vercel de publication des tweets')
    
    // Récupérer tous les tweets planifiés à publier maintenant
    const now = new Date()
    const { data: tweetsToPublish, error: fetchError } = await supabase
      .from('scheduled_tweets')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', now.toISOString())
      .order('scheduled_at', { ascending: true })

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des tweets:', fetchError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des tweets' },
        { status: 500 }
      )
    }

    if (!tweetsToPublish || tweetsToPublish.length === 0) {
      console.log('✨ Aucun tweet à publier pour le moment')
      return NextResponse.json({ 
        success: true, 
        message: 'Aucun tweet à publier',
        publishedCount: 0
      })
    }

    console.log(`📋 ${tweetsToPublish.length} tweet(s) à publier`)

    let publishedCount = 0
    let failedCount = 0

    // Traiter chaque tweet
    for (const tweet of tweetsToPublish) {
      try {
        console.log(`🚀 Publication du tweet ID: ${tweet.id}`)
        console.log(`📝 Contenu: ${tweet.content}`)
        console.log(`📅 Planifié pour: ${new Date(tweet.scheduled_at).toLocaleString('fr-FR')}`)

        // Publier sur Twitter via notre API
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/social/twitter/post-scheduled`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: tweet.content,
            userId: tweet.user_id
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`Erreur API Twitter: ${errorData.error || response.statusText}`)
        }

        // Mettre à jour le statut en base
        const { error: updateError } = await supabase
          .from('scheduled_tweets')
          .update({
            status: 'published',
            published_at: new Date().toISOString()
          })
          .eq('id', tweet.id)

        if (updateError) {
          console.error('❌ Erreur lors de la mise à jour du statut:', updateError)
          throw updateError
        }

        console.log(`✅ Tweet publié avec succès`)
        publishedCount++

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
        console.error(`❌ Erreur lors de la publication du tweet ${tweet.id}:`, errorMessage)
        
        // Marquer comme échoué
        await supabase
          .from('scheduled_tweets')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', tweet.id)
        
        failedCount++
      }
    }

    console.log(`🎉 Traitement terminé: ${publishedCount} publié(s), ${failedCount} échoué(s)`)

    return NextResponse.json({
      success: true,
      message: 'Cron job Vercel terminé avec succès',
      publishedCount,
      failedCount,
      totalProcessed: tweetsToPublish.length
    })

  } catch (error) {
    console.error('❌ Erreur critique dans le cron job Vercel:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
