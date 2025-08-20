#!/usr/bin/env node

/**
 * Script de test de l'API Twitter
 * Vérifie que la publication sur Twitter fonctionne
 * 
 * Usage: node scripts/test-twitter-api.js
 */

const { createClient } = require('@supabase/supabase-js')
const { URLS } = require('./config')
require('dotenv').config({ path: '.env.local' })

// Configuration Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Test de l'API Twitter
 */
async function testTwitterAPI() {
  try {
    console.log('🧪 Test de l\'API Twitter')
    console.log('=' .repeat(40))
    
    // 1. Récupérer un utilisateur
    console.log('1️⃣ Récupération d\'un utilisateur...')
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .limit(1)
    
    if (userError || !users || users.length === 0) {
      throw new Error('Aucun utilisateur trouvé')
    }
    
    const user = users[0]
    console.log(`   ✅ Utilisateur: ${user.email} (ID: ${user.id})`)
    
    // 2. Vérifier la connexion Twitter
    console.log('\n2️⃣ Vérification de la connexion Twitter...')
    const { data: connection, error: connError } = await supabase
      .from('social_connections')
      .select('*')
      .eq('platform', 'twitter')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()
    
    if (connError || !connection) {
      throw new Error('Aucune connexion Twitter active trouvée')
    }
    
    console.log(`   ✅ Connexion Twitter trouvée`)
    console.log(`   📱 Username: ${connection.platform_username}`)
    console.log(`   🔑 Token: ${connection.access_token.substring(0, 20)}...`)
    
    // 3. Test de l'API Twitter
    console.log('\n3️⃣ Test de publication sur Twitter...')
    const testContent = `🧪 Test de l'API Twitter Podcast Manager - ${new Date().toLocaleString('fr-FR')}`
    
    const response = await fetch(URLS.TWITTER_POST_SCHEDULED, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: testContent,
        userId: user.id
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Erreur API: ${errorData.error} (${response.status})`)
    }
    
    const result = await response.json()
    console.log(`   ✅ Tweet publié avec succès !`)
    console.log(`   🐦 Tweet ID: ${result.tweetId}`)
    console.log(`   📝 Contenu: "${testContent}"`)
    
    console.log('\n' + '=' .repeat(40))
    console.log('🎉 Test de l\'API Twitter réussi !')
    console.log('📱 Vérifiez votre compte Twitter pour voir le tweet de test')
    
    return true
    
  } catch (error) {
    console.error('\n❌ Test de l\'API Twitter échoué:')
    console.error(`   ${error.message}`)
    
    if (error.message.includes('fetch')) {
      console.error(`\n💡 Vérifiez que votre serveur Next.js est démarré sur le port ${process.env.NEXTJS_PORT || 3000}`)
      console.error('   npm run dev')
    }
    
    if (error.message.includes('connexion Twitter')) {
      console.error('\n💡 Vérifiez que vous avez connecté votre compte Twitter')
      console.error('   Allez sur /settings et connectez Twitter')
    }
    
    return false
  }
}

/**
 * Fonction principale
 */
async function main() {
  try {
    await testTwitterAPI()
  } catch (error) {
    console.error('Erreur fatale:', error)
    process.exit(1)
  }
}

// Démarrer le script
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { testTwitterAPI }
