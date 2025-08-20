#!/usr/bin/env node

/**
 * Script de planification des tweets
 * Simule un cron job pour publier automatiquement les tweets planifiés
 * 
 * Usage:
 * - node scripts/tweet-scheduler.js (exécution unique)
 * - node scripts/tweet-scheduler.js --watch (surveillance continue)
 */

const { createClient } = require('@supabase/supabase-js')
const { URLS, INTERVALS } = require('./config')
require('dotenv').config({ path: '.env.local' })

// Configuration Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
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
 * Utilise la vraie connexion OAuth Twitter
 */
async function publishTweetToTwitter(tweet) {
  console.log(`🐦 Publication du tweet: "${tweet.content}"`)
  
  try {
    // Appeler notre API Twitter pour tweets planifiés
    const response = await fetch(URLS.TWITTER_POST_SCHEDULED, {
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
    console.error(`❌ Échec de la publication sur Twitter: ${error.message}`)
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
 * Publie un tweet et met à jour son statut
 */
async function publishTweet(tweet) {
  try {
    console.log(`\n🚀 Publication du tweet ID: ${tweet.id}`)
    console.log(`📝 Contenu: ${tweet.content}`)
    console.log(`📅 Planifié pour: ${tweet.scheduled_date} à ${tweet.scheduled_time}`)
    
    // Publier sur Twitter
    const result = await publishTweetToTwitter(tweet)
    
    if (result.success) {
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
      } else {
        console.log(`✅ Statut mis à jour: published`)
      }
    }
    
  } catch (error) {
    console.error(`❌ Erreur lors de la publication du tweet ${tweet.id}:`, error.message)
    
    // Optionnel: marquer comme échoué ou laisser en pending pour retry
    // await supabase
    //   .from('scheduled_tweets')
    //   .update({ status: 'failed' })
    //   .eq('id', tweet.id)
  }
}

/**
 * Exécute une vérification complète des tweets à publier
 */
async function runScheduler() {
  console.log(`\n⏰ [${new Date().toLocaleString('fr-FR')}] Démarrage du planificateur de tweets`)
  console.log('=' .repeat(60))
  
  try {
    // Récupérer les tweets à publier
    const tweetsToPublish = await getTweetsToPublish()
    
    if (tweetsToPublish.length === 0) {
      console.log('✨ Aucun tweet à publier pour le moment')
      return
    }
    
    // Publier chaque tweet
    for (const tweet of tweetsToPublish) {
      await publishTweet(tweet)
      console.log('─'.repeat(40))
    }
    
    console.log(`\n🎉 Traitement terminé: ${tweetsToPublish.length} tweet(s) traité(s)`)
    
  } catch (error) {
    console.error('❌ Erreur critique dans le planificateur:', error)
  }
  
  console.log('=' .repeat(60))
}

/**
 * Fonction principale
 */
async function main() {
  const args = process.argv.slice(2)
  const isWatchMode = args.includes('--watch')
  
  console.log('🚀 Planificateur de Tweets CMPA')
  console.log('Mode:', isWatchMode ? 'Surveillance continue' : 'Exécution unique')
  console.log('')
  
  try {
    // Test de connexion Supabase
    const { data, error } = await supabase
      .from('scheduled_tweets')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Erreur de connexion à Supabase:', error.message)
      console.error('Vérifiez vos variables d\'environnement (.env.local)')
      process.exit(1)
    }
    
    console.log('✅ Connexion à Supabase établie')
    
    if (isWatchMode) {
      console.log('👀 Mode surveillance: vérification toutes les minutes')
      console.log('Appuyez sur Ctrl+C pour arrêter')
      
      // Exécution immédiate
      await runScheduler()
      
      // Puis toutes les minutes
      setInterval(runScheduler, INTERVALS.SCHEDULER_CHECK)
      
    } else {
      // Exécution unique
      await runScheduler()
      process.exit(0)
    }
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  }
}

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n\n🛑 Arrêt du planificateur...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Arrêt du planificateur...')
  process.exit(0)
})

// Démarrer le script
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { runScheduler, publishTweet }
