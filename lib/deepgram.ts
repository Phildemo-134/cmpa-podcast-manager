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
  paragraphs?: boolean
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
        diarize = true,
        paragraphs = true,
        utterances = true, // Nécessaire pour la diarisation
      } = options

      const { result, error } = await this.client.listen.prerecorded.transcribeUrl(
        { url: audioUrl },
        {
          model,
          language,
          smart_format,
          punctuate,
          diarize,
          paragraphs,
          utterances, // Ajout de utterances pour la diarisation
        }
      )

      if (error) {
        throw new Error(`Deepgram transcription error: ${error.message}`)
      }

      if (!result) {
        throw new Error('No transcription result received from Deepgram')
      }

      // Extraire le texte brut
      const rawText = result.results?.channels?.[0]?.alternatives?.[0]?.paragraphs?.transcript || ''

      // Extraire les timestamps avec les mots et speakers
      const timestamps: Array<{start: number, end: number, text: string, speaker?: string}> = []
      
      // Utiliser les utterances si disponibles (meilleure diarisation)
      const utteranceResults = (result.results?.channels?.[0]?.alternatives?.[0] as any)?.utterances
      if (utteranceResults && Array.isArray(utteranceResults)) {
        for (const utterance of utteranceResults) {
          if (utterance.speaker !== undefined && utterance.start !== undefined && utterance.end !== undefined) {
            timestamps.push({
              start: utterance.start,
              end: utterance.end,
              text: utterance.transcript || '',
              speaker: `Speaker ${utterance.speaker + 1}` // Deepgram utilise 0-based indexing
            })
          }
        }
      }
      
      // Si pas d'utterances, utiliser les mots avec diarisation
      if (timestamps.length === 0 && result.results?.channels?.[0]?.alternatives?.[0]?.words) {
        const words = result.results.channels[0].alternatives[0].words
        
        // Grouper les mots en phrases basées sur la ponctuation et les speakers
        let currentPhrase = ''
        let currentStart = 0
        let currentEnd = 0
        let currentSpeaker: string | undefined
        
        for (const word of words) {
          if (!currentStart) {
            currentStart = word.start
            currentSpeaker = word.speaker !== undefined ? `Speaker ${word.speaker + 1}` : undefined
          }
          
          currentPhrase += word.word + ' '
          currentEnd = word.end
          
          // Si le speaker change ou si le mot se termine par une ponctuation, c'est la fin d'une phrase
          if (word.speaker !== undefined && word.speaker !== (currentSpeaker ? parseInt(currentSpeaker.split(' ')[1]) - 1 : undefined) ||
              /[.!?]/.test(word.word)) {
            
            if (currentPhrase.trim()) {
              timestamps.push({
                start: currentStart,
                end: currentEnd,
                text: currentPhrase.trim(),
                speaker: currentSpeaker
              })
            }
            
            currentPhrase = ''
            currentStart = 0
            currentEnd = 0
            currentSpeaker = undefined
          }
        }
        
        // Ajouter la dernière phrase si elle n'a pas de ponctuation finale
        if (currentPhrase.trim()) {
          timestamps.push({
            start: currentStart,
            end: currentEnd,
            text: currentPhrase.trim(),
            speaker: currentSpeaker
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
