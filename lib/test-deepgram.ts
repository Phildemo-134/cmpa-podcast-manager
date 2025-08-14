import { deepgramService } from './deepgram'

async function testDeepgram() {
  try {
    console.log('🧪 Test du service Deepgram...')
    
    // Vérifier la configuration
    console.log('📋 Configuration:')
    console.log('- API Key configurée:', !!process.env.DEEPGRAM_API_KEY)
    
    // Test de validation de l'API key
    console.log('\n🔑 Validation de l\'API key...')
    const isValid = await deepgramService.validateApiKey()
    console.log('- API Key valide:', isValid)
    
    // Test avec un fichier audio d'exemple (si disponible)
    if (process.env.TEST_AUDIO_URL) {
      console.log('\n🎵 Test de transcription...')
      console.log('- URL audio de test:', process.env.TEST_AUDIO_URL)
      
      const result = await deepgramService.transcribeAudio(
        process.env.TEST_AUDIO_URL,
        {
          model: 'nova-2',
          language: 'fr',
          smart_format: true,
          punctuate: true,
          diarize: true,
          utterances: true
        }
      )
      
      console.log('\n✅ Transcription réussie!')
      console.log('- Texte extrait:', result.raw_text.substring(0, 100) + '...')
      console.log('- Nombre de timestamps:', result.timestamps.length)
      console.log('- Confiance:', result.confidence)
      console.log('- Langue détectée:', result.language)
      
      if (result.timestamps.length > 0) {
        console.log('\n📝 Premier timestamp:')
        console.log('- Début:', result.timestamps[0].start, 's')
        console.log('- Fin:', result.timestamps[0].end, 's')
        console.log('- Texte:', result.timestamps[0].text)
        console.log('- Speaker:', result.timestamps[0].speaker || 'Non spécifié')
      }
    } else {
      console.log('\n⚠️  Pas d\'URL audio de test configurée')
      console.log('   Ajoutez TEST_AUDIO_URL dans votre .env pour tester la transcription')
    }
    
    console.log('\n🎉 Test terminé avec succès!')
    
  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error)
    process.exit(1)
  }
}

// Exécuter le test si le fichier est appelé directement
if (require.main === module) {
  testDeepgram()
}

export { testDeepgram }
