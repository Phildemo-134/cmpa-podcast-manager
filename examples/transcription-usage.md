# Exemples d'utilisation de la Transcription Deepgram

## 🎯 Scénarios d'usage

### 1. Transcription d'un épisode de podcast

```typescript
// Dans votre composant React
import { useState } from 'react'

function PodcastEpisode({ episodeId }: { episodeId: string }) {
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcription, setTranscription] = useState(null)

  const handleTranscribe = async () => {
    setIsTranscribing(true)
    
    try {
      // Démarrer la transcription
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodeId })
      })
      
      if (!response.ok) throw new Error('Erreur de transcription')
      
      // Polling pour vérifier le statut
      const pollInterval = setInterval(async () => {
        const statusResponse = await fetch(`/api/transcribe?episodeId=${episodeId}`)
        const { transcription: status } = await statusResponse.json()
        
        if (status.processing_status === 'completed') {
          setTranscription(status)
          setIsTranscribing(false)
          clearInterval(pollInterval)
        } else if (status.processing_status === 'error') {
          setIsTranscribing(false)
          clearInterval(pollInterval)
        }
      }, 5000)
      
    } catch (error) {
      console.error('Erreur:', error)
      setIsTranscribing(false)
    }
  }

  return (
    <div>
      <button onClick={handleTranscribe} disabled={isTranscribing}>
        {isTranscribing ? 'Transcription en cours...' : 'Générer la transcription'}
      </button>
      
      {transcription && (
        <div>
          <h3>Transcription</h3>
          <p>{transcription.raw_text}</p>
        </div>
      )}
    </div>
  )
}
```

### 2. Utilisation directe du service Deepgram

```typescript
// Dans un script Node.js ou une API
import { deepgramService } from '../lib/deepgram'

async function transcribeAudioFile(audioUrl: string) {
  try {
    const result = await deepgramService.transcribeAudio(audioUrl, {
      model: 'nova-2',
      language: 'fr',
      smart_format: true,
      punctuate: true,
      diarize: true,
      utterances: true
    })
    
    console.log('Transcription réussie!')
    console.log('Texte:', result.raw_text)
    console.log('Timestamps:', result.timestamps.length)
    console.log('Confiance:', result.confidence)
    
    return result
    
  } catch (error) {
    console.error('Erreur de transcription:', error)
    throw error
  }
}

// Utilisation
transcribeAudioFile('https://example.com/audio.mp3')
  .then(result => {
    // Traiter le résultat
    console.log('Texte transcrit:', result.raw_text.substring(0, 100))
  })
  .catch(error => {
    console.error('Échec:', error.message)
  })
```

### 3. Gestion des timestamps et navigation

```typescript
// Composant de navigation dans l'audio
function AudioNavigator({ 
  timestamps, 
  onTimestampClick 
}: { 
  timestamps: Array<{start: number, end: number, text: string}>
  onTimestampClick: (timestamp: {start: number, end: number, text: string}) => void
}) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="timestamps">
      {timestamps.map((timestamp, index) => (
        <div 
          key={index}
          className="timestamp-item"
          onClick={() => onTimestampClick(timestamp)}
        >
          <span className="time">
            {formatTime(timestamp.start)} - {formatTime(timestamp.end)}
          </span>
          <span className="text">{timestamp.text}</span>
        </div>
      ))}
    </div>
  )
}

// Utilisation avec un lecteur audio
function AudioPlayer({ audioUrl, transcription }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  
  const handleTimestampClick = (timestamp: {start: number, end: number, text: string}) => {
    if (audioRef.current) {
      audioRef.current.currentTime = timestamp.start
      audioRef.current.play()
    }
  }
  
  return (
    <div>
      <audio ref={audioRef} controls src={audioUrl} />
      
      {transcription?.timestamps && (
        <AudioNavigator
          timestamps={transcription.timestamps}
          onTimestampClick={handleTimestampClick}
        />
      )}
    </div>
  )
}
```

### 4. Export et partage de transcriptions

```typescript
// Fonction d'export en différents formats
function exportTranscription(transcription: any, format: 'txt' | 'srt' | 'vtt') {
  let content = ''
  let filename = `transcription-${Date.now()}.${format}`
  
  switch (format) {
    case 'txt':
      content = transcription.raw_text
      break
      
    case 'srt':
      content = transcription.timestamps.map((ts: any, index: number) => {
        const start = formatSRTTime(ts.start)
        const end = formatSRTTime(ts.end)
        return `${index + 1}\n${start} --> ${end}\n${ts.text}\n\n`
      }).join('')
      break
      
    case 'vtt':
      content = 'WEBVTT\n\n'
      content += transcription.timestamps.map((ts: any) => {
        const start = formatVTTTime(ts.start)
        const end = formatVTTTime(ts.end)
        return `${start} --> ${end}\n${ts.text}\n\n`
      }).join('')
      break
  }
  
  // Téléchargement
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Fonctions utilitaires pour le formatage des temps
function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
}

function formatVTTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
}
```

### 5. Traitement en lot de plusieurs fichiers

```typescript
// Script de traitement en lot
async function batchTranscribe(audioFiles: Array<{id: string, url: string}>) {
  const results = []
  const errors = []
  
  console.log(`Début du traitement de ${audioFiles.length} fichiers...`)
  
  for (const file of audioFiles) {
    try {
      console.log(`Transcription de ${file.id}...`)
      
      const result = await deepgramService.transcribeAudio(file.url, {
        model: 'nova-2',
        language: 'fr'
      })
      
      results.push({
        id: file.id,
        success: true,
        data: result
      })
      
      console.log(`✅ ${file.id} terminé`)
      
      // Pause entre les requêtes pour éviter la surcharge
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error(`❌ Erreur pour ${file.id}:`, error.message)
      
      errors.push({
        id: file.id,
        success: false,
        error: error.message
      })
    }
  }
  
  console.log('\n📊 Résumé du traitement:')
  console.log(`✅ Succès: ${results.length}`)
  console.log(`❌ Erreurs: ${errors.length}`)
  
  return { results, errors }
}

// Utilisation
const audioFiles = [
  { id: 'episode-1', url: 'https://s3.amazonaws.com/bucket/episode1.mp3' },
  { id: 'episode-2', url: 'https://s3.amazonaws.com/bucket/episode2.mp3' },
  { id: 'episode-3', url: 'https://s3.amazonaws.com/bucket/episode3.mp3' }
]

batchTranscribe(audioFiles)
  .then(({ results, errors }) => {
    console.log('Traitement terminé!')
    
    if (results.length > 0) {
      console.log('\nRésultats:')
      results.forEach(r => {
        console.log(`${r.id}: ${r.data.raw_text.substring(0, 50)}...`)
      })
    }
    
    if (errors.length > 0) {
      console.log('\nErreurs:')
      errors.forEach(e => {
        console.log(`${e.id}: ${e.error}`)
      })
    }
  })
  .catch(error => {
    console.error('Erreur générale:', error)
  })
```

## 🔧 Configuration avancée

### Options de transcription personnalisées

```typescript
// Configuration pour différents types de contenu
const transcriptionConfigs = {
  podcast: {
    model: 'nova-2',
    language: 'fr',
    smart_format: true,
    punctuate: true,
    diarize: true,
    utterances: true,
    filler_words: false,
    profanity_filter: false
  },
  
  interview: {
    model: 'nova-2',
    language: 'fr',
    smart_format: true,
    punctuate: true,
    diarize: true,
    utterances: true,
    filler_words: true, // Garder les hésitations
    profanity_filter: false
  },
  
  presentation: {
    model: 'nova-2',
    language: 'fr',
    smart_format: true,
    punctuate: true,
    diarize: false, // Pas de détection de speaker
    utterances: true,
    filler_words: false,
    profanity_filter: true
  }
}

// Utilisation
const config = transcriptionConfigs.podcast
const result = await deepgramService.transcribeAudio(audioUrl, config)
```

## 📱 Intégration mobile

### Composant React Native

```typescript
// Pour React Native
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'

function TranscriptionDisplayMobile({ transcription, onTimestampClick }) {
  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Transcription
      </Text>
      
      <Text style={{ fontSize: 16, lineHeight: 24, marginBottom: 20 }}>
        {transcription.raw_text}
      </Text>
      
      {transcription.timestamps && (
        <View>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
            Segments
          </Text>
          
          {transcription.timestamps.map((timestamp, index) => (
            <TouchableOpacity
              key={index}
              style={{ 
                padding: 12, 
                backgroundColor: '#f5f5f5', 
                marginBottom: 8,
                borderRadius: 8
              }}
              onPress={() => onTimestampClick(timestamp)}
            >
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                {formatTime(timestamp.start)} - {formatTime(timestamp.end)}
              </Text>
              <Text style={{ fontSize: 16 }}>{timestamp.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  )
}
```

## 🚀 Déploiement et production

### Variables d'environnement de production

```bash
# Production
NODE_ENV=production
DEEPGRAM_API_KEY=your-production-key

# Monitoring
LOG_LEVEL=info
ENABLE_METRICS=true

# Performance
MAX_CONCURRENT_TRANSCRIPTIONS=5
TRANSCRIPTION_TIMEOUT=300000
```

### Monitoring et logs

```typescript
// Middleware de logging
function transcriptionLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - startTime
    const { method, url, statusCode } = req
    
    console.log(`[TRANSCRIPTION] ${method} ${url} - ${statusCode} - ${duration}ms`)
    
    // Métriques pour monitoring
    if (process.env.ENABLE_METRICS === 'true') {
      // Envoyer vers votre service de monitoring
      sendMetrics('transcription_request', {
        method,
        url,
        statusCode,
        duration,
        timestamp: new Date().toISOString()
      })
    }
  })
  
  next()
}
```

---

Ces exemples montrent la flexibilité et la puissance de l'implémentation de transcription Deepgram. Adaptez-les selon vos besoins spécifiques ! 🎯
