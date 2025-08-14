# Configuration de la Diarisation Deepgram

## 🎯 Qu'est-ce que la Diarisation ?

La **diarisation** est le processus qui identifie et sépare automatiquement les différentes personnes qui parlent dans un enregistrement audio. Deepgram peut identifier jusqu'à 10 speakers différents dans un même fichier audio.

## ⚙️ Configuration Requise

### 1. Options Deepgram Actives

Pour que la diarisation fonctionne, vous devez activer ces options :

```typescript
const options = {
  model: 'nova-2',        // Modèle recommandé pour la diarisation
  language: 'fr',         // Langue de l'audio
  diarize: true,         // ✅ ACTIVER la diarisation
  utterances: true,      // ✅ ACTIVER les utterances (essentiel)
  punctuate: true,       // ✅ Ponctuation pour segmenter le texte
  smart_format: true,    // ✅ Formatage intelligent
  paragraphs: true       // ✅ Paragraphes structurés
}
```

### 2. Variables d'Environnement

Assurez-vous d'avoir configuré votre clé API Deepgram :

```bash
# .env.local
DEEPGRAM_API_KEY=your_deepgram_api_key_here
```

## 🔧 Comment ça Fonctionne

### 1. Traitement des Utterances (Recommandé)

Deepgram utilise les **utterances** pour une diarisation optimale :

```typescript
// Les utterances donnent des segments plus naturels
const utteranceResults = (result.results?.channels?.[0]?.alternatives?.[0] as any)?.utterances

if (utteranceResults && Array.isArray(utteranceResults)) {
  for (const utterance of utteranceResults) {
    timestamps.push({
      start: utterance.start,
      end: utterance.end,
      text: utterance.transcript || '',
      speaker: `Speaker ${utterance.speaker + 1}` // Speaker 1, Speaker 2, etc.
    })
  }
}
```

### 2. Fallback sur les Mots

Si les utterances ne sont pas disponibles, le système utilise les mots individuels avec diarisation :

```typescript
// Grouper les mots par speaker et ponctuation
for (const word of words) {
  if (word.speaker !== undefined) {
    // Traiter le changement de speaker
    currentSpeaker = `Speaker ${word.speaker + 1}`
  }
  // ... logique de groupement
}
```

## 📊 Format des Résultats

### Structure des Timestamps

```typescript
interface Timestamp {
  start: number      // Temps de début en secondes
  end: number        // Temps de fin en secondes
  text: string       // Texte transcrit
  speaker?: string   // "Speaker 1", "Speaker 2", etc.
}
```

### Exemple de Sortie

```json
[
  {
    "start": 0.0,
    "end": 5.2,
    "text": "Bonjour, bienvenue dans ce podcast.",
    "speaker": "Speaker 1"
  },
  {
    "start": 5.5,
    "end": 8.7,
    "text": "Merci, ravi d'être là !",
    "speaker": "Speaker 2"
  }
]
```

## 🧪 Test de la Diarisation

### 1. Test Automatique

```bash
# Lancer le test de diarisation
npm run test:deepgram
```

### 2. Test Manuel

```typescript
import { deepgramService } from './lib/deepgram'

const result = await deepgramService.transcribeAudio(audioUrl, {
  diarize: true,
  utterances: true
})

console.log('Speakers identifiés:', 
  result.timestamps
    .filter(t => t.speaker)
    .map(t => t.speaker)
    .filter((v, i, a) => a.indexOf(v) === i)
)
```

## 🚨 Problèmes Courants

### 1. Aucun Speaker Identifié

**Causes possibles :**
- L'option `utterances: true` n'est pas activée
- L'audio est de mauvaise qualité
- Un seul speaker dans l'enregistrement
- Le modèle Deepgram ne supporte pas la diarisation

**Solutions :**
```typescript
// Vérifier que toutes les options sont activées
const options = {
  diarize: true,
  utterances: true,  // ⚠️ ESSENTIEL
  model: 'nova-2'    // Modèle recommandé
}
```

### 2. Speakers Mal Identifiés

**Causes possibles :**
- Changements fréquents de speaker
- Chevauchement de voix
- Qualité audio insuffisante

**Solutions :**
- Améliorer la qualité audio
- Utiliser des pauses entre les interventions
- Vérifier que l'audio n'est pas compressé

## 📈 Amélioration des Performances

### 1. Optimisation Audio

```bash
# Format recommandé
Format: WAV ou MP3
Sample Rate: 16kHz minimum
Bitrate: 128kbps minimum
```

### 2. Segmentation Intelligente

```typescript
// Utiliser des pauses naturelles pour améliorer la diarisation
// Deepgram détecte automatiquement les changements de speaker
// mais des pauses claires aident à la précision
```

## 🔍 Debug et Logs

### 1. Vérification des Options

```typescript
console.log('Options de transcription:', {
  diarize: true,
  utterances: true,
  model: 'nova-2'
})
```

### 2. Analyse des Résultats

```typescript
// Vérifier la structure des résultats
console.log('Structure des résultats:', JSON.stringify(result, null, 2))

// Compter les speakers
const uniqueSpeakers = new Set(
  result.timestamps
    .filter(t => t.speaker)
    .map(t => t.speaker)
)
console.log('Speakers uniques:', Array.from(uniqueSpeakers))
```

## 📚 Ressources Supplémentaires

- [Documentation Deepgram Diarization](https://developers.deepgram.com/docs/diarization)
- [API Reference](https://developers.deepgram.com/docs/api-reference)
- [Best Practices](https://developers.deepgram.com/docs/best-practices)

---

**Note :** La diarisation fonctionne mieux avec des enregistrements de haute qualité et des speakers clairement distincts. Pour des résultats optimaux, assurez-vous que votre audio respecte les recommandations de qualité de Deepgram.
