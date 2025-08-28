import { NextRequest, NextResponse } from 'next/server'
import { testDeepgramConfiguration, testDeepgramTranscription } from '../../../lib/test-deepgram'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test de configuration Deepgram...')
    
    // Test de la configuration
    const configResult = await testDeepgramConfiguration()
    
    if (!configResult) {
      return NextResponse.json({
        success: false,
        error: 'Configuration Deepgram invalide',
        details: 'Vérifiez que DEEPGRAM_API_KEY est définie et valide'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Configuration Deepgram valide',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Erreur lors du test de configuration:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du test de configuration',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { audioUrl } = body
    
    if (!audioUrl) {
      return NextResponse.json({
        success: false,
        error: 'URL audio requise pour le test de transcription'
      }, { status: 400 })
    }
    
    console.log('🎵 Test de transcription Deepgram...')
    
    // Test de la transcription
    const transcriptionResult = await testDeepgramTranscription(audioUrl)
    
    return NextResponse.json({
      success: true,
      message: 'Test de transcription réussi',
      result: {
        rawTextLength: transcriptionResult.raw_text?.length || 0,
        timestampsCount: transcriptionResult.timestamps?.length || 0,
        confidence: transcriptionResult.confidence,
        language: transcriptionResult.language
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Erreur lors du test de transcription:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du test de transcription',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
