import { deepgramService } from './deepgram'

async function testDiarization() {
  try {
    console.log('🧪 Test de la diarisation Deepgram...')
    
    // Test avec une URL audio (remplacez par une vraie URL de test)
    const testAudioUrl = process.env.TEST_AUDIO_URL || 'https://example.com/test-audio.mp3'
    
    console.log('📡 URL audio de test:', testAudioUrl)
    
    const result = await deepgramService.transcribeAudio(testAudioUrl, {
      model: 'nova-2',
      language: 'fr',
      smart_format: true,
      punctuate: true,
      diarize: true,
      paragraphs: true,
      utterances: true, // Important pour la diarisation
    })
    
    console.log('✅ Transcription réussie !')
    console.log('📝 Texte brut:', result.raw_text.substring(0, 200) + '...')
    console.log('🎯 Nombre de timestamps:', result.timestamps.length)
    
    // Afficher les premiers timestamps avec speakers
    console.log('\n🔊 Premiers timestamps avec speakers:')
    result.timestamps.slice(0, 5).forEach((timestamp, index) => {
      console.log(`${index + 1}. [${timestamp.start}s - ${timestamp.end}s] ${timestamp.speaker || 'Speaker inconnu'}: ${timestamp.text.substring(0, 100)}...`)
    })
    
    // Vérifier la présence de speakers
    const speakersWithText = result.timestamps.filter(t => t.speaker && t.text.trim())
    console.log(`\n👥 Nombre de segments avec speakers identifiés: ${speakersWithText.length}`)
    
    if (speakersWithText.length > 0) {
      console.log('🎉 La diarisation fonctionne correctement !')
    } else {
      console.log('⚠️  Aucun speaker identifié. Vérifiez la configuration.')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

// Exécuter le test si le fichier est appelé directement
if (require.main === module) {
  testDiarization()
}

export { testDiarization }
