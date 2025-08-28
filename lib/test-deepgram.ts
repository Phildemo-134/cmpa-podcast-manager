import { deepgramService } from './deepgram'

export async function testDeepgramConfiguration() {
  try {
    console.log('🔍 Test de la configuration Deepgram...')
    
    // Vérifier que la clé API est configurée
    const apiKey = process.env.DEEPGRAM_API_KEY
    if (!apiKey) {
      throw new Error('❌ DEEPGRAM_API_KEY n\'est pas définie')
    }
    
    if (apiKey === 'your_deepgram_api_key' || apiKey === '') {
      throw new Error('❌ DEEPGRAM_API_KEY n\'est pas correctement configurée')
    }
    
    console.log('✅ Clé API Deepgram configurée')
    console.log(`📝 Clé API: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`)
    
    // Test de validation de la clé API
    const isValid = await deepgramService.validateApiKey()
    if (isValid) {
      console.log('✅ Clé API Deepgram valide')
    } else {
      console.log('⚠️ Impossible de valider la clé API Deepgram')
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur lors du test de configuration Deepgram:', error)
    return false
  }
}

export async function testDeepgramTranscription(audioUrl: string) {
  try {
    console.log('🎵 Test de transcription Deepgram...')
    console.log(`🔗 URL audio: ${audioUrl}`)
    
    const result = await deepgramService.transcribeAudio(audioUrl, {
      model: 'nova-2',
      language: 'fr',
      smart_format: true,
      punctuate: true,
      diarize: true,
      paragraphs: true,
      utterances: true
    })
    
    console.log('✅ Transcription réussie!')
    console.log(`📝 Texte brut: ${result.raw_text?.length || 0} caractères`)
    console.log(`⏱️ Timestamps: ${result.timestamps?.length || 0} segments`)
    console.log(`🎯 Confiance: ${result.confidence}`)
    console.log(`🌍 Langue: ${result.language}`)
    
    return result
    
  } catch (error) {
    console.error('❌ Erreur lors du test de transcription:', error)
    throw error
  }
}
