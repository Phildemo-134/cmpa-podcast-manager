#!/usr/bin/env node

/**
 * Script pour exécuter manuellement le cron job de publication des tweets
 * 
 * Usage: node scripts/run-cron-job.js
 */

require('dotenv').config({ path: '.env.local' })

const CRON_SECRET_KEY = process.env.CRON_SECRET_KEY
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

if (!CRON_SECRET_KEY) {
  console.error('❌ CRON_SECRET_KEY manquante dans .env.local')
  console.error('Ajoutez CRON_SECRET_KEY=votre_clé_secrète dans .env.local')
  process.exit(1)
}

if (!APP_URL) {
  console.error('❌ NEXT_PUBLIC_APP_URL manquante dans .env.local')
  console.error('Ajoutez NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app dans .env.local')
  process.exit(1)
}

async function runCronJob() {
  console.log('🚀 Exécution manuelle du cron job de publication des tweets')
  console.log(`📍 URL: ${APP_URL}/api/cron/publish-scheduled-tweets`)
  console.log('⏰ Démarrage...')
  
  try {
    const response = await fetch(`${APP_URL}/api/cron/publish-scheduled-tweets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Erreur HTTP: ${response.status} ${response.statusText}`)
      console.error('Réponse:', errorText)
      process.exit(1)
    }
    
    const result = await response.json()
    
    console.log('✅ Cron job exécuté avec succès !')
    console.log('📊 Résultats:')
    console.log(`   - Message: ${result.message}`)
    console.log(`   - Tweets publiés: ${result.publishedCount}`)
    console.log(`   - Tweets échoués: ${result.failedCount}`)
    console.log(`   - Total traité: ${result.totalProcessed}`)
    
    if (result.publishedCount > 0) {
      console.log('🎉 Des tweets ont été publiés avec succès !')
    } else if (result.totalProcessed === 0) {
      console.log('✨ Aucun tweet à publier pour le moment')
    } else {
      console.log('⚠️  Aucun tweet n\'a pu être publié')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution du cron job:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Assurez-vous que votre application est démarrée (npm run dev)')
    }
    
    process.exit(1)
  }
}

// Exécuter le cron job
runCronJob()
