import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '../../../../types/database'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Configuration Twitter (à remplacer par vos vraies clés)
const TWITTER_CONFIG = {
  apiKey: process.env.TWITTER_API_KEY || 'test_key',
  apiSecret: process.env.TWITTER_API_SECRET || 'test_secret',
  accessToken: process.env.TWITTER_ACCESS_TOKEN || 'test_token',
  accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || 'test_secret'
}

/**
 * Publie un tweet sur Twitter via notre API
 */
async function publishTweetToTwitter(tweet: any) {
  console.log(`🐦 Publication du tweet: "${tweet.content}"`)
  
  try {
    // Appeler notre API Twitter pour tweets planifiés
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
    
    const result = await response.json()
    console.log(`✅ Tweet publié avec succès sur Twitter`)
    console.log(`   Tweet ID: ${result.tweetId || 'N/A'}`)
    
    return { 
      success: true, 
      tweetId: result.tweetId || `local_${Date.now()}` 
    }
    
  } catch (error) {
    console.error(`❌ Échec de la publication sur Twitter: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    throw error
  }
}

/**
 * Récupère tous les tweets planifiés à publier maintenant
 */
async function getTweetsToPublish() {
  const now = new Date()
  const currentDate = now.toISOString().split('T')[0]
  const currentTime = now.toTimeString().slice(0, 5)
  
  console.log(`🔍 Recherche des tweets à publier le ${currentDate} à ${currentTime}`)
  
  try {
    const { data: tweets, error } = await supabase
      .from('scheduled_tweets')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_date', currentDate)
      .lte('scheduled_time', currentTime)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true })
    
    if (error) {
      console.error('❌ Erreur lors de la récupération des tweets:', error)
      return []
    }
    
    console.log(`📋 ${tweets.length} tweet(s) trouvé(s) à publier`)
    return tweets || []
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des tweets:', error)
    return []
  }
}

/**
 * Traite un tweet planifié : publication + mise à jour du statut
 */
async function processTweet(tweet: any) {
  console.log(`🚀 Publication du tweet ID: ${tweet.id}`)
  console.log(`📝 Contenu: ${tweet.content}`)
  console.log(`📅 Planifié pour: ${tweet.scheduled_date} à ${tweet.scheduled_time}`)
  
  try {
    // Publier le tweet sur Twitter
    const publishResult = await publishTweetToTwitter(tweet)
    
    if (publishResult.success) {
      // Mettre à jour le statut en base
      const { error: updateError } = await supabase
        .from('scheduled_tweets')
        .update({ 
          status: 'published',
          published_at: new Date().toISOString(),
          twitter_id: publishResult.tweetId
        })
        .eq('id', tweet.id)
      
      if (updateError) {
        console.error('❌ Erreur lors de la mise à jour du statut:', updateError)
        throw updateError
      }
      
      console.log(`✅ Statut mis à jour: published`)
      return { success: true, tweetId: publishResult.tweetId }
    }
    
  } catch (error) {
    console.error(`❌ Erreur lors du traitement du tweet ${tweet.id}:`, error)
    
    // Marquer le tweet comme échoué
    try {
      await supabase
        .from('scheduled_tweets')
        .update({ 
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Erreur inconnue'
        })
        .eq('id', tweet.id)
    } catch (updateError) {
      console.error('❌ Erreur lors de la mise à jour du statut d\'erreur:', updateError)
    }
    
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
  }
}

/**
 * Fonction principale du cron job
 */
async function runScheduler() {
  console.log(`⏰ [${new Date().toLocaleDateString('fr-FR')}, ${new Date().toLocaleTimeString('fr-FR')}] Démarrage du planificateur de tweets`)
  console.log('============================================================')
  
  try {
    // Récupérer les tweets à publier
    const tweetsToPublish = await getTweetsToPublish()
    
    if (tweetsToPublish.length === 0) {
      console.log('✨ Aucun tweet à publier pour le moment')
      return
    }
    
    // Traiter chaque tweet
    let successCount = 0
    let errorCount = 0
    
    for (const tweet of tweetsToPublish) {
      const result = await processTweet(tweet)
      
      if (result.success) {
        successCount++
      } else {
        errorCount++
      }
      
      console.log('────────────────────────────────────────')
    }
    
    console.log(`🎉 Traitement terminé: ${successCount} tweet(s) traité(s) avec succès, ${errorCount} échec(s)`)
    
  } catch (error) {
    console.error('❌ Erreur générale du planificateur:', error)
  }
  
  console.log('============================================================')
}

export async function GET(request: NextRequest) {
  // Vérifier que c'est bien Vercel qui appelle (optionnel mais recommandé)
  const authHeader = request.headers.get('authorization')
  
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  try {
    await runScheduler()
    return NextResponse.json({ 
      success: true, 
      message: 'Cron job exécuté avec succès',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution du cron job:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de l\'exécution du cron job',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
