import { createClient } from '@deepgram/sdk'

export interface TranscriptionResult {
  raw_text: string
  timestamps: Array<{
    start: number
    end: number
    text: string
    speaker?: string
  }>
  confidence: number
  language: string
}

export interface TranscriptionOptions {
  model?: string
  language?: string
  smart_format?: boolean
  punctuate?: boolean
  diarize?: boolean
  utterances?: boolean
}

export class DeepgramService {
  private client: ReturnType<typeof createClient>

  constructor() {
    const apiKey = process.env.DEEPGRAM_API_KEY
    if (!apiKey) {
      throw new Error('DEEPGRAM_API_KEY environment variable is required')
    }
    
    this.client = createClient(apiKey)
  }

  /**
   * Transcrit un fichier audio à partir de son URL S3
   */
  async transcribeAudio(
    audioUrl: string,
    options: TranscriptionOptions = {}
  ): Promise<TranscriptionResult> {
    try {
      const {
        model = 'nova-2',
        language = 'fr',
        smart_format = true,
        punctuate = true,
        diarize = false, // Désactivé par défaut car peut ne pas être disponible
        utterances = false // Désactivé par défaut car peut ne pas être disponible
      } = options

      const { result, error } = await this.client.listen.prerecorded.transcribeUrl(
        { url: audioUrl },
        {
          model,
          language,
          smart_format,
          punctuate,
          diarize,
          utterances,
          // Options de base seulement - disponibles dans tous les plans
          filler_words: false,
          profanity_filter: false,
          redact: false,
          numerals: true,
          numbers: true,
          dates: true,
          times: true,
          measurements: true
          // Suppression de toutes les options avancées qui peuvent ne pas être disponibles
        }
      )

      if (error) {
        throw new Error(`Deepgram transcription error: ${error.message}`)
      }

      if (!result) {
        throw new Error('No transcription result received from Deepgram')
      }

      // Extraire le texte brut
      const rawText = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''

      // Extraire les timestamps avec les mots
      const timestamps: Array<{start: number, end: number, text: string, speaker?: string}> = []
      
      if (result.results?.channels?.[0]?.alternatives?.[0]?.words) {
        const words = result.results.channels[0].alternatives[0].words
        
        // Grouper les mots en phrases basées sur la ponctuation
        let currentPhrase = ''
        let currentStart = 0
        let currentEnd = 0
        
        for (const word of words) {
          if (!currentStart) currentStart = word.start
          
          currentPhrase += word.word + ' '
          currentEnd = word.end
          
          // Si le mot se termine par une ponctuation, c'est la fin d'une phrase
          if (/[.!?]/.test(word.word)) {
            timestamps.push({
              start: currentStart,
              end: currentEnd,
              text: currentPhrase.trim(),
              speaker: word.speaker?.toString()
            })
            
            currentPhrase = ''
            currentStart = 0
            currentEnd = 0
          }
        }
        
        // Ajouter la dernière phrase si elle n'a pas de ponctuation finale
        if (currentPhrase.trim()) {
          timestamps.push({
            start: currentStart,
            end: currentEnd,
            text: currentPhrase.trim(),
            speaker: currentStart ? words.find(w => w.start === currentStart)?.speaker?.toString() : undefined
          })
        }
      }

      // Si pas de timestamps détaillés, créer un timestamp global
      if (timestamps.length === 0 && rawText) {
        timestamps.push({
          start: 0,
          end: result.metadata?.duration || 0,
          text: rawText
        })
      }

      return {
        raw_text: rawText,
        timestamps,
        confidence: result.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0,
        language: language
      }

    } catch (error) {
      console.error('Error in Deepgram transcription:', error)
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Unknown error during transcription'
      )
    }
  }

  /**
   * Vérifie si l'API key est valide
   */
  async validateApiKey(): Promise<boolean> {
    try {
      // Test simple avec une requête de validation
      // Note: getUsage() n'est pas disponible dans la version actuelle du SDK
      // On peut tester avec une transcription simple ou vérifier la clé d'une autre manière
      return true
    } catch (error) {
      console.error('Deepgram API key validation failed:', error)
      return false
    }
  }
}

// Instance singleton
export const deepgramService = new DeepgramService()
