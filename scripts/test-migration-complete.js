#!/usr/bin/env node

/**
 * Script de test pour vérifier que la migration scheduled_date/scheduled_time → scheduled_at est complète
 * 
 * Usage: node scripts/test-migration-complete.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Configuration Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Test 1: Vérifier la structure de la base de données
 */
async function testDatabaseStructure() {
  console.log('🔍 Test 1: Vérification de la structure de la base de données')
  
  try {
    // Vérifier que scheduled_at existe
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'scheduled_tweets')
      .eq('table_schema', 'public')
    
    if (error) {
      console.error('❌ Erreur lors de la vérification de la structure:', error)
      return false
    }
    
    const hasScheduledAt = columns.some(col => col.column_name === 'scheduled_at')
    const hasScheduledDate = columns.some(col => col.column_name === 'scheduled_date')
    const hasScheduledTime = columns.some(col => col.column_name === 'scheduled_time')
    
    console.log('   Colonnes trouvées:')
    columns.forEach(col => {
      console.log(`     - ${col.column_name}: ${col.data_type}`)
    })
    
    if (!hasScheduledAt) {
      console.error('❌ Colonne scheduled_at manquante')
      return false
    }
    
    if (hasScheduledDate || hasScheduledTime) {
      console.warn('⚠️  Anciennes colonnes scheduled_date/scheduled_time encore présentes')
      console.warn('   Elles peuvent être supprimées si elles ne sont plus utilisées')
    }
    
    console.log('✅ Structure de la base de données OK')
    return true
    
  } catch (error) {
    console.error('❌ Erreur lors du test de structure:', error)
    return false
  }
}

/**
 * Test 2: Créer un tweet de test avec scheduled_at
 */
async function testCreateTweet() {
  console.log('\n🔍 Test 2: Création d\'un tweet de test avec scheduled_at')
  
  try {
    // Récupérer un utilisateur
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (userError || !users || users.length === 0) {
      console.error('❌ Aucun utilisateur trouvé')
      return false
    }
    
    const userId = users[0].id
    
    // Créer un tweet de test
    const testTweet = {
      content: `Test migration ${Date.now()} - scheduled_at uniquement`,
      scheduled_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // Dans 10 minutes
      user_id: userId,
      status: 'pending'
    }
    
    const { data: tweet, error } = await supabase
      .from('scheduled_tweets')
      .insert(testTweet)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Erreur lors de la création du tweet:', error)
      return false
    }
    
    console.log('✅ Tweet créé avec succès:')
    console.log(`   ID: ${tweet.id}`)
    console.log(`   Contenu: ${tweet.content}`)
    console.log(`   Planifié pour: ${new Date(tweet.scheduled_at).toLocaleString('fr-FR')}`)
    console.log(`   Statut: ${tweet.status}`)
    
    // Nettoyer le tweet de test
    await supabase
      .from('scheduled_tweets')
      .delete()
      .eq('id', tweet.id)
    
    console.log('✅ Tweet de test supprimé')
    return true
    
  } catch (error) {
    console.error('❌ Erreur lors du test de création:', error)
    return false
  }
}

/**
 * Test 3: Vérifier la récupération des tweets programmés
 */
async function testRetrieveTweets() {
  console.log('\n🔍 Test 3: Récupération des tweets programmés')
  
  try {
    // Créer quelques tweets de test
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (!users || users.length === 0) {
      console.error('❌ Aucun utilisateur trouvé')
      return false
    }
    
    const userId = users[0].id
    const now = new Date()
    
    const testTweets = [
      {
        content: 'Tweet test 1 - passé',
        scheduled_at: new Date(now.getTime() - 60 * 1000).toISOString(), // 1 minute dans le passé
        user_id: userId,
        status: 'pending'
      },
      {
        content: 'Tweet test 2 - futur',
        scheduled_at: new Date(now.getTime() + 60 * 1000).toISOString(), // 1 minute dans le futur
        user_id: userId,
        status: 'pending'
      }
    ]
    
    // Insérer les tweets de test
    const { data: insertedTweets, error: insertError } = await supabase
      .from('scheduled_tweets')
      .insert(testTweets)
      .select()
    
    if (insertError) {
      console.error('❌ Erreur lors de l\'insertion des tweets de test:', insertError)
      return false
    }
    
    console.log(`✅ ${insertedTweets.length} tweets de test créés`)
    
    // Tester la récupération des tweets à publier (passés)
    const { data: tweetsToPublish, error: fetchError } = await supabase
      .from('scheduled_tweets')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', now.toISOString())
      .order('scheduled_at', { ascending: true })
    
    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des tweets à publier:', fetchError)
      return false
    }
    
    console.log(`✅ Récupération des tweets à publier: ${tweetsToPublish.length} trouvé(s)`)
    tweetsToPublish.forEach(tweet => {
      console.log(`   - ${tweet.content} (${new Date(tweet.scheduled_at).toLocaleString('fr-FR')})`)
    })
    
    // Nettoyer les tweets de test
    const tweetIds = insertedTweets.map(t => t.id)
    await supabase
      .from('scheduled_tweets')
      .delete()
      .in('id', tweetIds)
    
    console.log('✅ Tweets de test supprimés')
    return true
    
  } catch (error) {
    console.error('❌ Erreur lors du test de récupération:', error)
    return false
  }
}

/**
 * Test 4: Vérifier la compatibilité avec l'API
 */
async function testAPICompatibility() {
  console.log('\n🔍 Test 4: Test de compatibilité avec l\'API')
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cron/publish-scheduled-tweets`)
    
    if (!response.ok) {
      console.error(`❌ Erreur API: ${response.status} ${response.statusText}`)
      return false
    }
    
    const data = await response.json()
    console.log('✅ API cron accessible:', data.message)
    return true
    
  } catch (error) {
    console.error('❌ Erreur lors du test API:', error.message)
    return false
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🧪 Test de la Migration scheduled_date/scheduled_time → scheduled_at')
  console.log('=' .repeat(70))
  
  try {
    // Test de connexion Supabase
    const { error: testError } = await supabase
      .from('scheduled_tweets')
      .select('count', { count: 'exact', head: true })
    
    if (testError) {
      console.error('❌ Erreur de connexion à Supabase:', testError.message)
      console.error('Vérifiez vos variables d\'environnement (.env.local)')
      process.exit(1)
    }
    
    console.log('✅ Connexion à Supabase établie')
    
    // Exécuter tous les tests
    const tests = [
      testDatabaseStructure,
      testCreateTweet,
      testRetrieveTweets,
      testAPICompatibility
    ]
    
    let passedTests = 0
    let totalTests = tests.length
    
    for (const test of tests) {
      try {
        const result = await test()
        if (result) passedTests++
      } catch (error) {
        console.error(`❌ Test a échoué avec une erreur:`, error)
      }
    }
    
    console.log('\n' + '=' .repeat(70))
    console.log(`🎉 Résultats des tests: ${passedTests}/${totalTests} réussis`)
    
    if (passedTests === totalTests) {
      console.log('✅ Tous les tests sont passés ! La migration est complète et fonctionnelle.')
      process.exit(0)
    } else {
      console.log('⚠️  Certains tests ont échoué. Vérifiez les erreurs ci-dessus.')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  }
}

// Démarrer le script
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { 
  testDatabaseStructure, 
  testCreateTweet, 
  testRetrieveTweets, 
  testAPICompatibility 
}
