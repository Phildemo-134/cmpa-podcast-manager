#!/usr/bin/env tsx

/**
 * Script de test pour vérifier la configuration S3
 * Usage: npm run test:s3
 */

import { uploadAudioToS3, getSignedAudioUrl, checkAudioExists } from './s3'

async function testS3Configuration() {
  console.log('🧪 Test de la configuration S3...\n')

  // Vérifier les variables d'environnement
  const requiredEnvVars = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_BUCKET',
    'AWS_REGION'
  ]

  console.log('📋 Vérification des variables d\'environnement:')
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar]
    if (value) {
      console.log(`  ✅ ${envVar}: ${envVar.includes('KEY') ? '***' : value}`)
    } else {
      console.log(`  ❌ ${envVar}: Manquant`)
      process.exit(1)
    }
  }

  console.log('\n🔍 Test de connexion S3...')

  try {
    // Test de création d'un fichier temporaire
    const testFile = new File(['test audio content'], 'test.mp3', { type: 'audio/mpeg' })
    const testUserId = 'test-user-123'
    const testEpisodeId = 'test-episode-456'

    console.log('  📤 Test d\'upload...')
    const uploadResult = await uploadAudioToS3(testFile, testUserId, testEpisodeId)
    console.log(`  ✅ Upload réussi: ${uploadResult.key}`)

    console.log('  🔍 Test de vérification d\'existence...')
    const exists = await checkAudioExists(uploadResult.key)
    console.log(`  ✅ Fichier existe: ${exists}`)

    console.log('  🔗 Test de génération d\'URL signée...')
    const signedUrl = await getSignedAudioUrl(uploadResult.key, 3600)
    console.log(`  ✅ URL signée générée: ${signedUrl.substring(0, 50)}...`)

    console.log('\n🎉 Tous les tests S3 sont passés avec succès!')
    console.log('\n📊 Informations du bucket:')
    console.log(`  Bucket: ${uploadResult.bucket}`)
    console.log(`  Région: ${process.env.AWS_REGION}`)
    console.log(`  Clé de test: ${uploadResult.key}`)

  } catch (error) {
    console.error('\n❌ Erreur lors du test S3:')
    console.error(error)
    process.exit(1)
  }
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testS3Configuration().catch(console.error)
}
