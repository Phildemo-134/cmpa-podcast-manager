# Mise à jour du format de transcription

## Vue d'ensemble

La fonction `transcribeAudio` de Deepgram a été mise à jour pour traiter le nouveau format de données `paragraphs.paragraphs` et générer automatiquement un format de transcription lisible avec timestamps et speakers.

## Modifications apportées

### 1. Fichier `lib/deepgram.ts`

#### Nouvelle interface `TranscriptionResult`
```typescript
export interface TranscriptionResult {
  raw_text: string
  formatted_text: string  // NOUVEAU: texte formaté avec timestamps
  timestamps: Array<{
    start: number
    end: number
    text: string
    speaker?: string
  }>
  confidence: number
  language: string
}
```

#### Traitement des paragraphes
- **Priorité 1**: Utilise le nouveau format `paragraphs.paragraphs` de Deepgram
- **Priorité 2**: Fallback sur les `utterances` si disponibles
- **Priorité 3**: Fallback sur les mots avec diarisation

#### Combinaison intelligente des paragraphes
- **Regroupement automatique** : Les paragraphes consécutifs du même speaker sont automatiquement combinés
- **Détection des pauses** : Une pause de plus de 2 secondes entre paragraphes du même speaker crée une nouvelle séparation
- **Amélioration de la lisibilité** : Évite la fragmentation excessive du texte tout en préservant la structure logique

#### Nouvelles méthodes
```typescript
// Formate la transcription au format [00:00] Speaker1 : texte
formatTranscription(timestamps: Array<{start: number, end: number, text: string, speaker?: string}>): string

// Convertit les secondes au format MM:SS
private formatTimestamp(seconds: number): string
```

### 2. Fichier `app/api/transcribe/route.ts`

#### Stockage du texte formaté
```typescript
// Le texte formaté est maintenant stocké dans le champ cleaned_text
cleaned_text: transcriptionResult.formatted_text
```

### 3. Fichier `components/episodes/transcription-display.tsx`

#### Affichage du nouveau format
- La fonction `getFormattedRawText()` génère maintenant le format `[00:00] Speaker1 : texte`
- Utilise la fonction `formatTime()` existante pour la cohérence

## Format de sortie

### Avant
```
Speaker1: Bonjour, comment allez-vous aujourd'hui ?

Speaker2: Très bien merci, et vous ?
```

### Après
```
[00:00] Speaker1 : Bonjour, comment allez-vous aujourd'hui ?
[00:06] Speaker2 : Très bien merci, et vous ?
```

### Combinaison intelligente des paragraphes
**Paragraphes originaux de Deepgram :**
```
[00:00-00:06] Speaker1: Bonjour, comment allez-vous ?
[00:06-00:08] Speaker1: J'espère que vous allez bien.
[00:08-00:12] Speaker2: Très bien merci, et vous ?
[00:12-00:15] Speaker1: Parfait, merci beaucoup !
[00:15-00:18] Speaker1: C'était un plaisir de vous parler.
```

**Résultat après combinaison :**
```
[00:00] Speaker1 : Bonjour, comment allez-vous ? J'espère que vous allez bien.
[00:08] Speaker2 : Très bien merci, et vous ?
[00:12] Speaker1 : Parfait, merci beaucoup ! C'était un plaisir de vous parler.
```

**Avantages :**
- Les interventions consécutives du même speaker sont regroupées logiquement
- La lisibilité est améliorée en évitant la fragmentation excessive
- Les timestamps restent précis pour la navigation dans l'audio

## Utilisation

### Dans le code
```typescript
import { deepgramService } from '../lib/deepgram'

const result = await deepgramService.transcribeAudio(audioUrl, {
  model: 'nova-2',
  language: 'fr',
  smart_format: true,
  punctuate: true,
  diarize: true,
  paragraphs: true,
  utterances: true
})

// Accéder au texte formaté
console.log(result.formatted_text)
// Sortie: [00:00] Speaker1 : Bonjour, comment allez-vous aujourd'hui ?
```

### Dans l'interface utilisateur
Le composant `TranscriptionDisplay` affiche automatiquement le nouveau format dans l'onglet "Transcription brute".

## Avantages

1. **Lisibilité améliorée**: Les timestamps permettent de naviguer facilement dans l'audio
2. **Identification des speakers**: Chaque segment est clairement attribué à un speaker
3. **Format standardisé**: Structure cohérente pour toutes les transcriptions
4. **Compatibilité**: Maintient la compatibilité avec l'ancien format via fallbacks
5. **Stockage optimisé**: Le texte formaté est stocké en base pour un accès rapide

## Migration

Aucune migration de base de données n'est nécessaire. Les nouvelles transcriptions utiliseront automatiquement le nouveau format, tandis que les anciennes continueront de fonctionner avec le format existant.

## Tests

La fonctionnalité a été testée avec des données d'exemple et génère correctement le format attendu :
- Timestamps au format MM:SS
- Identification des speakers (Speaker1, Speaker2, etc.)
- Séparation claire entre les segments
- Gestion des cas d'erreur et fallbacks
