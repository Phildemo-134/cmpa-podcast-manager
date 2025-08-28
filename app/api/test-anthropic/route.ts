import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test de configuration Anthropic...')
    
    // Vérifier que la clé API est configurée
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('❌ ANTHROPIC_API_KEY n\'est pas définie')
    }
    
    if (apiKey === 'your_anthropic_api_key' || apiKey === '') {
      throw new Error('❌ ANTHROPIC_API_KEY n\'est pas correctement configurée')
    }
    
    console.log('✅ Clé API Anthropic configurée')
    console.log(`📝 Clé API: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`)
    
    // Créer une instance Anthropic
    const anthropic = new Anthropic({
      apiKey: apiKey,
    })
    
    // Test simple avec Claude
    console.log('🤖 Test d\'appel à Claude...')
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: 'Réponds simplement "Test réussi" en français.'
        }
      ]
    })
    
    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('❌ Réponse invalide de Claude')
    }
    
    console.log('✅ Test d\'appel à Claude réussi')
    console.log(`📄 Réponse: ${content.text}`)
    
    return NextResponse.json({
      success: true,
      message: 'Configuration Anthropic valide',
      testResponse: content.text,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Erreur lors du test de configuration Anthropic:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du test de configuration Anthropic',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt } = body
    
    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: 'Prompt requis pour le test'
      }, { status: 400 })
    }
    
    console.log('🧪 Test de génération avec Anthropic...')
    
    // Vérifier la configuration
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey || apiKey === 'your_anthropic_api_key' || apiKey === '') {
      throw new Error('ANTHROPIC_API_KEY non configurée')
    }
    
    const anthropic = new Anthropic({
      apiKey: apiKey,
    })
    
    // Test avec le prompt fourni
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
    
    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Réponse invalide de Claude')
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test de génération réussi',
      response: content.text,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Erreur lors du test de génération:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du test de génération',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
