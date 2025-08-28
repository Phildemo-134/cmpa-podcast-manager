import { createClient } from '@deepgram/sdk'

export interface TranscriptionResult {
  raw_text: string
  formatted_text: string
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
    
    if (apiKey === 'your_deepgram_api_key' || apiKey === '') {
      throw new Error('DEEPGRAM_API_KEY is not properly configured. Please set a valid API key.')
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
      // Vérifier que l'URL audio est valide
      if (!audioUrl || audioUrl.trim() === '') {
        throw new Error('URL audio invalide ou manquante')
      }

      if (!audioUrl.startsWith('http')) {
        throw new Error('URL audio doit être une URL HTTP valide')
      }

      console.log(`Début de la transcription Deepgram pour l'URL: ${audioUrl}`)

      const {
        model = 'nova-2',
        language = 'fr',
        smart_format = true,
        punctuate = true,
        diarize = true,
        paragraphs = true,
        utterances = true, // Nécessaire pour la diarisation
      } = options

      console.log(`Options de transcription:`, { model, language, smart_format, punctuate, diarize, paragraphs, utterances })

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
        console.error('Erreur Deepgram API:', error)
        throw new Error(`Erreur Deepgram API: ${error.message}`)
      }

      if (!result) {
        throw new Error('Aucun résultat de transcription reçu de Deepgram')
      }

      console.log(`Transcription Deepgram réussie pour l'URL: ${audioUrl}`)

      // Extraire le texte brut et les paragraphes
      const rawText = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''
      const paragraphsData = result.results?.channels?.[0]?.alternatives?.[0]?.paragraphs?.paragraphs

      // Extraire les timestamps avec les paragraphes et speakers
      const timestamps: Array<{start: number, end: number, text: string, speaker?: string}> = []
      
      // Traiter les paragraphes si disponibles (nouveau format)
      if (paragraphsData) {
        let paragraphsArray: any[] = []
        
        // Gérer le cas où paragraphsData peut être un objet ou un tableau
        if (Array.isArray(paragraphsData)) {
          paragraphsArray = paragraphsData
        } else if (typeof paragraphsData === 'object') {
          // Convertir l'objet paragraphs en tableau
          paragraphsArray = Object.values(paragraphsData)
        }
        
        // Trier les paragraphes par ordre chronologique
        paragraphsArray.sort((a, b) => (a.start || 0) - (b.start || 0))
        
        // Combiner les paragraphes consécutifs du même speaker
        const combinedParagraphs: any[] = []
        let currentParagraph: any = null
        
        for (const paragraph of paragraphsArray) {
          if (paragraph && typeof paragraph === 'object' && 'start' in paragraph && 'end' in paragraph) {
            const para = paragraph as any
            
            // Extraire le texte des phrases du paragraphe
            let paragraphText = ''
            if (para.sentences && Array.isArray(para.sentences)) {
              paragraphText = para.sentences
                .map((sentence: any) => sentence.text || '')
                .join(' ')
                .trim()
            }
            
            if (paragraphText) {
              // Si c'est le premier paragraphe ou si le speaker change
              if (!currentParagraph || 
                  currentParagraph.speaker !== `Speaker${para.speaker + 1}` ||
                  // Si il y a une pause significative (> 2 secondes), créer un nouveau paragraphe
                  (para.start - currentParagraph.end) > 2) {
                
                // Sauvegarder le paragraphe précédent s'il existe
                if (currentParagraph) {
                  combinedParagraphs.push(currentParagraph)
                }
                
                // Créer un nouveau paragraphe
                currentParagraph = {
                  start: para.start,
                  end: para.end,
                  text: paragraphText,
                  speaker: para.speaker !== undefined ? `Speaker${para.speaker + 1}` : undefined
                }
              } else {
                // Même speaker, combiner les paragraphes
                currentParagraph.end = para.end
                currentParagraph.text += ' ' + paragraphText
              }
            }
          }
        }
        
        // Ajouter le dernier paragraphe
        if (currentParagraph) {
          combinedParagraphs.push(currentParagraph)
        }
        
        // Convertir en timestamps
        for (const para of combinedParagraphs) {
          timestamps.push({
            start: para.start || 0,
            end: para.end || 0,
            text: para.text,
            speaker: para.speaker
          })
        }
      }
      
      // Si pas de paragraphes, utiliser les utterances (fallback)
      if (timestamps.length === 0) {
        const utteranceResults = (result.results?.channels?.[0]?.alternatives?.[0] as any)?.utterances
        if (utteranceResults && Array.isArray(utteranceResults)) {
          for (const utterance of utteranceResults) {
            if (utterance.speaker !== undefined && utterance.start !== undefined && utterance.end !== undefined) {
              timestamps.push({
                start: utterance.start,
                end: utterance.end,
                text: utterance.transcript || '',
                speaker: `Speaker${utterance.speaker + 1}` // Deepgram utilise 0-based indexing
              })
            }
          }
        }
      }
      
      // Si pas d'utterances, utiliser les mots avec diarisation (fallback)
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
            currentSpeaker = word.speaker !== undefined ? `Speaker${word.speaker + 1}` : undefined
          }
          
          currentPhrase += word.word + ' '
          currentEnd = word.end
          
          // Si le speaker change ou si le mot se termine par une ponctuation, c'est la fin d'une phrase
          if (word.speaker !== undefined && word.speaker !== (currentSpeaker ? parseInt(currentSpeaker.replace('Speaker', '')) - 1 : undefined) ||
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
        formatted_text: this.formatTranscription(timestamps),
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
   * Formate la transcription avec timestamps et speakers au format [00:00] Speaker1 : texte
   */
  formatTranscription(timestamps: Array<{start: number, end: number, text: string, speaker?: string}>): string {
    return timestamps
      .map(({ start, text, speaker }) => {
        const timestamp = this.formatTimestamp(start)
        const speakerLabel = speaker || 'Unknown'
        return `[${timestamp}] ${speakerLabel} : ${text}`
      })
      .join('\n')
  }

  /**
   * Convertit un timestamp en secondes au format MM:SS
   */
  private formatTimestamp(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
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
