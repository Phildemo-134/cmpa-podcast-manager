# 🧪 Test de la Diarisation Deepgram

## 🚀 Test Rapide

### 1. Configuration

Assurez-vous d'avoir configuré votre clé API Deepgram :

```bash
# Copier le fichier d'exemple
cp env.example .env.local

# Éditer .env.local et ajouter votre clé Deepgram
DEEPGRAM_API_KEY=your_actual_deepgram_api_key_here
```

### 2. Test avec un Fichier Audio

Pour tester la diarisation, vous avez besoin d'un fichier audio avec plusieurs speakers :

```bash
# Option 1: Utiliser une URL de test (ajoutez dans .env.local)
TEST_AUDIO_URL=https://your-audio-file-url.com/audio.mp3

# Option 2: Utiliser un fichier local (à implémenter)
```

### 3. Lancer le Test

```bash
# Test de la diarisation
npm run test:deepgram
```

## 📊 Résultats Attendus

### ✅ Succès
```
🧪 Test de la diarisation Deepgram...
📡 URL audio de test: https://example.com/test-audio.mp3
✅ Transcription réussie !
📝 Texte brut: Bonjour, bienvenue dans ce podcast...
🎯 Nombre de timestamps: 15

🔊 Premiers timestamps avec speakers:
1. [0.0s - 5.2s] Speaker 1: Bonjour, bienvenue dans ce podcast...
2. [5.5s - 8.7s] Speaker 2: Merci, ravi d'être là !...
3. [9.0s - 12.3s] Speaker 1: Commençons par...

👥 Nombre de segments avec speakers identifiés: 15
🎉 La diarisation fonctionne correctement !
```

### ❌ Échec
```
🧪 Test de la diarisation Deepgram...
📡 URL audio de test: https://example.com/test-audio.mp3
❌ Erreur lors du test: Deepgram transcription error: Invalid API key
```

## 🔧 Dépannage

### Problème: "Invalid API key"
```bash
# Vérifier que la clé est correcte dans .env.local
DEEPGRAM_API_KEY=your_actual_key_here

# Redémarrer le serveur de développement
npm run dev
```

### Problème: "No speakers identified"
```bash
# Vérifier que l'audio contient plusieurs speakers
# Vérifier que les options sont activées dans le code
diarize: true,
utterances: true  # ⚠️ ESSENTIEL
```

### Problème: "Audio file not found"
```bash
# Vérifier l'URL dans TEST_AUDIO_URL
# L'URL doit être accessible publiquement
# Ou utiliser un fichier local
```

## 🎵 Fichiers Audio Recommandés

### Format
- **Format**: MP3, WAV, M4A
- **Qualité**: 16kHz minimum, 128kbps minimum
- **Durée**: 1-5 minutes pour les tests

### Contenu
- **Speakers**: 2-4 personnes différentes
- **Pauses**: Pauses claires entre les interventions
- **Qualité**: Audio clair, peu de bruit de fond

## 📝 Test Manuel dans l'Interface

1. **Uploader un fichier audio** dans l'interface
2. **Générer la transcription** avec l'option diarisation
3. **Vérifier les timestamps** - ils doivent afficher "Speaker 1", "Speaker 2", etc.

## 🔍 Debug Avancé

### Vérifier la Configuration
```typescript
// Dans lib/deepgram.ts, ajouter des logs
console.log('Options de transcription:', {
  diarize: true,
  utterances: true,
  model: 'nova-2'
})
```

### Analyser les Résultats Bruts
```typescript
// Afficher la structure complète des résultats
console.log('Résultats bruts:', JSON.stringify(result, null, 2))
```

## 📚 Ressources

- [Documentation Deepgram](https://developers.deepgram.com/docs)
- [Guide de Diarisation](https://developers.deepgram.com/docs/diarization)
- [Exemples d'API](https://developers.deepgram.com/docs/api-reference)

---

**Note**: La diarisation fonctionne mieux avec des enregistrements de haute qualité et des speakers clairement distincts. Pour des résultats optimaux, testez avec différents types d'audio.
