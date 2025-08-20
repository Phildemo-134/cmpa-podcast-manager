#!/usr/bin/env node

/**
 * Script de création de tweets de test
 * Crée des tweets planifiés dans le futur proche pour tester le cron job
 * 
 * Usage: node scripts/create-test-tweets.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Configuration Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Crée un tweet de test planifié
 */
async function createTestTweet(content, scheduledDate, scheduledTime, userId) {
  try {
    const { data, error } = await supabase
      .from('scheduled_tweets')
      .insert({
        content,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        user_id: userId,
        status: 'pending'
      })
      .select()
      .single()
    
    if (error) {
      console.error('❌ Erreur lors de la création du tweet:', error)
      return null
    }
    
    console.log(`✅ Tweet créé: "${content}"`)
    console.log(`   Planifié pour: ${scheduledDate} à ${scheduledTime}`)
    console.log(`   ID: ${data.id}`)
    return data
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du tweet:', error)
    return null
  }
}

/**
 * Récupère le premier utilisateur disponible
 */
async function getFirstUser() {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email')
      .limit(1)
    
    if (error || !users || users.length === 0) {
      console.error('❌ Aucun utilisateur trouvé dans la base')
      return null
    }
    
    console.log(`👤 Utilisateur trouvé: ${users[0].email}`)
    return users[0]
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error)
    return null
  }
}

/**
 * Génère des dates de test dans le futur proche
 */
function generateTestDates() {
  const now = new Date()
  const dates = []
  
  // Tweet dans 1 minute
  const in1Min = new Date(now.getTime() + 1 * 60 * 1000)
  dates.push({
    date: in1Min.toISOString().split('T')[0],
    time: in1Min.toTimeString().slice(0, 5),
    label: 'dans 1 minute'
  })
  
  // Tweet dans 2 minutes
  const in2Min = new Date(now.getTime() + 2 * 60 * 1000)
  dates.push({
    date: in2Min.toISOString().split('T')[0],
    time: in2Min.toTimeString().slice(0, 5),
    label: 'dans 2 minutes'
  })
  
  // Tweet dans 5 minutes
  const in5Min = new Date(now.getTime() + 5 * 60 * 1000)
  dates.push({
    date: in5Min.toISOString().split('T')[0],
    time: in5Min.toTimeString().slice(0, 5),
    label: 'dans 5 minutes'
  })
  
  return dates
}

/**
 * Contenu des tweets de test
 */
const testTweets = [
  "🎙️ Test du planificateur de tweets Podcast Manager ! Premier tweet automatique.",
  "🚀 La planification de tweets fonctionne parfaitement ! Deuxième test.",
  "✨ Système de publication automatique opérationnel. Troisième et dernier test."
]

/**
 * Fonction principale
 */
async function main() {
  console.log('🧪 Création de tweets de test pour le cron job')
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
    
    // Récupérer un utilisateur
    const user = await getFirstUser()
    if (!user) {
      console.error('❌ Impossible de continuer sans utilisateur')
      process.exit(1)
    }
    
    // Générer les dates de test
    const testDates = generateTestDates()
    
    console.log('\n📅 Création des tweets de test...')
    console.log('')
    
    // Créer les tweets de test
    let createdCount = 0
    for (let i = 0; i < testTweets.length && i < testDates.length; i++) {
      const tweet = testTweets[i]
      const dateInfo = testDates[i]
      
      const result = await createTestTweet(
        tweet,
        dateInfo.date,
        dateInfo.time,
        user.id
      )
      
      if (result) {
        createdCount++
        console.log(`   ${dateInfo.label}`)
      }
      
      console.log('')
    }
    
    console.log('=' .repeat(50))
    console.log(`🎉 ${createdCount} tweet(s) de test créé(s) avec succès !`)
    console.log('')
    console.log('📋 Pour tester le cron job:')
    console.log('   1. Attendez que l\'heure de publication arrive')
    console.log('   2. Exécutez: node scripts/tweet-scheduler.js')
    console.log('   3. Ou en mode surveillance: node scripts/tweet-scheduler.js --watch')
    console.log('')
    console.log('⏰ Prochain tweet à publier dans 1 minute')
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  }
}

// Démarrer le script
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { createTestTweet, generateTestDates }
