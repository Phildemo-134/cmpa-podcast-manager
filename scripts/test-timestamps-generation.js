#!/usr/bin/env node

/**
 * Script de test pour l'API de génération des timestamps
 * 
 * Usage: node scripts/test-timestamps-generation.js <episodeId>
 */

const { config } = require('dotenv')
const path = require('path')

// Charger les variables d'environnement
config({ path: path.join(__dirname, '..', '.env') })

async function testTimestampsGeneration(episodeId) {
  if (!episodeId) {
    console.error('❌ Erreur: ID de l\'épisode requis')
    console.log('Usage: node scripts/test-timestamps-generation.js <episodeId>')
    process.exit(1)
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ Erreur: ANTHROPIC_API_KEY non configurée')
    process.exit(1)
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Erreur: SUPABASE_SERVICE_ROLE_KEY non configurée')
    process.exit(1)
  }

  console.log('🧪 Test de l\'API de génération des timestamps')
  console.log(`📝 Épisode ID: ${episodeId}`)
  console.log('')

  try {
    const response = await fetch('http://localhost:3000/api/generate-timestamps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ episodeId }),
    })

    const data = await response.json()

    if (response.ok) {
      console.log('✅ Succès!')
      console.log('⏰ Timestamps générés:')
      console.log('─'.repeat(50))
      console.log(data.timestamps)
      console.log('─'.repeat(50))
      console.log(`📊 Longueur: ${data.timestamps.length} caractères`)
    } else {
      console.error('❌ Erreur:', data.error)
      console.log(`📊 Status: ${response.status}`)
    }
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message)
    console.log('💡 Assurez-vous que le serveur de développement est démarré (npm run dev)')
  }
}

// Récupérer l'ID de l'épisode depuis les arguments de ligne de commande
const episodeId = process.argv[2]

testTimestampsGeneration(episodeId)
