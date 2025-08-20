#!/usr/bin/env node

/**
 * Script de nettoyage des tweets de test
 * Supprime tous les tweets de test créés pour les tests
 * 
 * Usage: node scripts/cleanup-test-tweets.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Configuration Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Supprime tous les tweets de test
 */
async function cleanupTestTweets() {
  try {
    console.log('🧹 Nettoyage des tweets de test...')
    
    // Supprimer tous les tweets de test (ceux qui contiennent "Test du planificateur")
    const { data: tweetsToDelete, error: selectError } = await supabase
      .from('scheduled_tweets')
      .select('id, content')
      .ilike('content', '%Test du planificateur%')
    
    if (selectError) {
      console.error('❌ Erreur lors de la récupération des tweets:', selectError)
      return
    }
    
    if (!tweetsToDelete || tweetsToDelete.length === 0) {
      console.log('✨ Aucun tweet de test à supprimer')
      return
    }
    
    console.log(`📋 ${tweetsToDelete.length} tweet(s) de test trouvé(s):`)
    tweetsToDelete.forEach(tweet => {
      console.log(`   - ${tweet.content}`)
    })
    
    // Supprimer les tweets
    const { error: deleteError } = await supabase
      .from('scheduled_tweets')
      .delete()
      .ilike('content', '%Test du planificateur%')
    
    if (deleteError) {
      console.error('❌ Erreur lors de la suppression:', deleteError)
      return
    }
    
    console.log(`✅ ${tweetsToDelete.length} tweet(s) de test supprimé(s) avec succès`)
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
  }
}

/**
 * Affiche le statut actuel des tweets
 */
async function showCurrentStatus() {
  try {
    const { data: tweets, error } = await supabase
      .from('scheduled_tweets')
      .select('id, content, status, scheduled_date, scheduled_time')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('❌ Erreur lors de la récupération du statut:', error)
      return
    }
    
    if (!tweets || tweets.length === 0) {
      console.log('📭 Aucun tweet planifié dans la base')
      return
    }
    
    console.log('\n📊 Statut actuel des tweets:')
    console.log('─'.repeat(60))
    
    tweets.forEach(tweet => {
      const statusIcon = tweet.status === 'published' ? '✅' : 
                        tweet.status === 'pending' ? '⏳' : '❌'
      console.log(`${statusIcon} [${tweet.status.toUpperCase()}] ${tweet.content}`)
      console.log(`   📅 ${tweet.scheduled_date} à ${tweet.scheduled_time}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'affichage du statut:', error)
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🧹 Nettoyage des Tweets de Test Podcast Manager')
  console.log('=' .repeat(50))
  
  try {
    // Vérifier la connexion Supabase
    const { error: testError } = await supabase
      .from('scheduled_tweets')
      .select('count', { count: 'exact', head: true })
    
    if (testError) {
      console.error('❌ Erreur de connexion à Supabase:', testError.message)
      console.error('Vérifiez vos variables d\'environnement (.env.local)')
      process.exit(1)
    }
    
    console.log('✅ Connexion à Supabase établie')
    
    // Afficher le statut avant nettoyage
    await showCurrentStatus()
    
    // Nettoyer les tweets de test
    await cleanupTestTweets()
    
    // Afficher le statut après nettoyage
    console.log('\n' + '=' .repeat(50))
    await showCurrentStatus()
    
    console.log('\n🎉 Nettoyage terminé !')
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  }
}

// Démarrer le script
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { cleanupTestTweets, showCurrentStatus }
