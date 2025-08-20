#!/usr/bin/env node

/**
 * Script de test rapide du système de planification
 * Vérifie la connexion, crée un tweet de test et teste le planificateur
 * 
 * Usage: node scripts/test-cron-job.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Configuration Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Test de connexion à Supabase
 */
async function testSupabaseConnection() {
  console.log('🔌 Test de connexion à Supabase...')
  
  try {
    const { data, error } = await supabase
      .from('scheduled_tweets')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      throw error
    }
    
    console.log('✅ Connexion Supabase réussie')
    return true
    
  } catch (error) {
    console.error('❌ Erreur de connexion Supabase:', error.message)
    return false
  }
}

/**
 * Test de création d'un tweet
 */
async function testTweetCreation() {
  console.log('\n📝 Test de création d\'un tweet...')
  
  try {
    // Récupérer un utilisateur
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .limit(1)
    
    if (userError || !users || users.length === 0) {
      throw new Error('Aucun utilisateur trouvé')
    }
    
    const user = users[0]
    console.log(`👤 Utilisateur: ${user.email}`)
    
    // Créer un tweet de test dans 1 minute
    const testDate = new Date(Date.now() + 60000) // +1 minute
    const scheduledDate = testDate.toISOString().split('T')[0]
    const scheduledTime = testDate.toTimeString().slice(0, 5)
    
    const { data: tweet, error: tweetError } = await supabase
      .from('scheduled_tweets')
      .insert({
        content: '🧪 Test rapide du système de planification CMPA',
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        user_id: user.id,
        status: 'pending'
      })
      .select()
      .single()
    
    if (tweetError) {
      throw tweetError
    }
    
    console.log('✅ Tweet de test créé avec succès')
    console.log(`   ID: ${tweet.id}`)
    console.log(`   Planifié pour: ${scheduledDate} à ${scheduledTime}`)
    
    return tweet
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du tweet:', error.message)
    return null
  }
}

/**
 * Test de récupération des tweets
 */
async function testTweetRetrieval() {
  console.log('\n🔍 Test de récupération des tweets...')
  
  try {
    const { data: tweets, error } = await supabase
      .from('scheduled_tweets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) {
      throw error
    }
    
    console.log(`✅ ${tweets.length} tweet(s) récupéré(s)`)
    
    tweets.forEach((tweet, index) => {
      console.log(`   ${index + 1}. [${tweet.status}] "${tweet.content}"`)
      console.log(`      📅 ${tweet.scheduled_date} à ${tweet.scheduled_time}`)
    })
    
    return tweets
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des tweets:', error.message)
    return []
  }
}

/**
 * Test de mise à jour du statut
 */
async function testStatusUpdate(tweetId) {
  console.log('\n🔄 Test de mise à jour du statut...')
  
  try {
    const { data, error } = await supabase
      .from('scheduled_tweets')
      .update({ status: 'cancelled' })
      .eq('id', tweetId)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    console.log('✅ Statut mis à jour avec succès')
    console.log(`   Nouveau statut: ${data.status}`)
    
    // Remettre en pending pour les vrais tests
    await supabase
      .from('scheduled_tweets')
      .update({ status: 'pending' })
      .eq('id', tweetId)
    
    console.log('   Statut remis à "pending" pour les tests')
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du statut:', error.message)
    return false
  }
}

/**
 * Test de suppression du tweet de test
 */
async function cleanupTestTweet(tweetId) {
  console.log('\n🧹 Nettoyage du tweet de test...')
  
  try {
    const { error } = await supabase
      .from('scheduled_tweets')
      .delete()
      .eq('id', tweetId)
    
    if (error) {
      throw error
    }
    
    console.log('✅ Tweet de test supprimé avec succès')
    return true
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error.message)
    return false
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🧪 Test Rapide du Système de Planification CMPA')
  console.log('=' .repeat(60))
  
  let testTweet = null
  
  try {
    // Test 1: Connexion Supabase
    const connectionOk = await testSupabaseConnection()
    if (!connectionOk) {
      console.error('\n❌ Test de connexion échoué. Arrêt des tests.')
      process.exit(1)
    }
    
    // Test 2: Création d'un tweet
    testTweet = await testTweetCreation()
    if (!testTweet) {
      console.error('\n❌ Test de création échoué. Arrêt des tests.')
      process.exit(1)
    }
    
    // Test 3: Récupération des tweets
    await testTweetRetrieval()
    
    // Test 4: Mise à jour du statut
    await testStatusUpdate(testTweet.id)
    
    // Test 5: Nettoyage
    await cleanupTestTweet(testTweet.id)
    
    console.log('\n' + '=' .repeat(60))
    console.log('🎉 Tous les tests sont passés avec succès !')
    console.log('')
    console.log('📋 Le système est prêt pour les vrais tests :')
    console.log('   1. node scripts/create-test-tweets.js')
    console.log('   2. node scripts/tweet-scheduler.js --watch')
    console.log('   3. node scripts/cleanup-test-tweets.js')
    
  } catch (error) {
    console.error('\n❌ Erreur fatale lors des tests:', error)
    
    // Nettoyer le tweet de test en cas d'erreur
    if (testTweet) {
      await cleanupTestTweet(testTweet.id)
    }
    
    process.exit(1)
  }
}

// Démarrer le script
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  testSupabaseConnection,
  testTweetCreation,
  testTweetRetrieval,
  testStatusUpdate,
  cleanupTestTweet
}
