# Configuration de la Transcription Audio avec Deepgram

Ce document explique comment configurer et utiliser la transcription audio automatique dans l'application Podcast Manager.

## 🚀 Configuration

### 1. Obtenir une clé API Deepgram

1. Créez un compte sur [Deepgram](https://deepgram.com/)
2. Allez dans la section "API Keys" de votre dashboard
3. Créez une nouvelle clé API
4. Copiez la clé API

### 2. Configuration des variables d'environnement

Ajoutez la clé API dans votre fichier `.env` :

```bash
# Deepgram (pour la transcription audio)
DEEPGRAM_API_KEY=your-deepgram-api-key
```

### 3. Test de la configuration

Vérifiez que tout fonctionne en exécutant le test :

```bash
npm run test:deepgram
```

## 🎯 Utilisation

### Transcription automatique

1. **Upload d'un fichier audio** : L'audio est automatiquement stocké dans AWS S3
2. **Génération de la transcription** : Cliquez sur "Générer la transcription" dans la page de détail de l'épisode
3. **Traitement** : L'API Deepgram traite le fichier audio et génère :
   - Le texte brut transcrit
   - Les timestamps détaillés
   - La détection des speakers (si activée)

### Fonctionnalités disponibles

- **Modèle Nova-2** : Modèle le plus récent et précis de Deepgram
- **Support multilingue** : Détection automatique de la langue (français par défaut)
- **Timestamps précis** : Synchronisation exacte avec l'audio
- **Détection des speakers** : Identification des différents intervenants
- **Formatage intelligent** : Ponctuation et structure automatiques

## 🔧 Configuration avancée

### Options de transcription

Vous pouvez personnaliser la transcription en modifiant les paramètres dans `lib/deepgram.ts` :

```typescript
const transcriptionResult = await deepgramService.transcribeAudio(
  audioUrl,
  {
    model: 'nova-2',           // Modèle de transcription
    language: 'fr',            // Langue cible
    smart_format: true,        // Formatage intelligent
    punctuate: true,           // Ajout de ponctuation
    diarize: true,             // Détection des speakers
    utterances: true,          // Segmentation en phrases
    filler_words: false,       // Suppression des mots de remplissage
    profanity_filter: false,   // Filtre de langage
    numerals: true,            // Reconnaissance des nombres
    dates: true,               // Reconnaissance des dates
    times: true                // Reconnaissance des heures
  }
)
```

### Modèles disponibles

- **nova-2** : Modèle le plus récent (recommandé)
- **nova** : Modèle précédent
- **enhanced** : Modèle amélioré
- **base** : Modèle de base

## 📊 Gestion des erreurs

### Erreurs courantes

1. **Clé API invalide** : Vérifiez que `DEEPGRAM_API_KEY` est correcte
2. **Fichier audio inaccessible** : Vérifiez que l'URL S3 est publique ou accessible
3. **Format audio non supporté** : Formats supportés : MP3, WAV, M4A, FLAC, etc.
4. **Limite de taille** : Pas de limite de taille ou de durée

### Logs et débogage

Les erreurs sont loggées dans la console du serveur. Vérifiez les logs pour diagnostiquer les problèmes.

## 💰 Coûts et limites

### Tarification Deepgram

- **Nova-2** : $0.006 par minute
- **Nova** : $0.004 par minute
- **Enhanced** : $0.002 par minute
- **Base** : $0.0004 par minute

### Limites

- Pas de limite de durée de fichier
- Pas de limite de taille de fichier
- Support de tous les formats audio courants
- Traitement en temps réel

## 🔒 Sécurité

### Bonnes pratiques

1. **Ne jamais exposer la clé API** côté client
2. **Utiliser des variables d'environnement** pour la configuration
3. **Valider les URLs audio** avant transcription
4. **Limiter l'accès** aux fichiers audio sensibles

### URLs S3

- Les fichiers audio doivent être accessibles publiquement ou via des URLs signées
- Utilisez des politiques S3 appropriées pour contrôler l'accès

## 📈 Performance

### Optimisations

1. **Cache des transcriptions** : Les résultats sont stockés en base
2. **Traitement asynchrone** : Non-bloquant pour l'utilisateur
3. **Polling intelligent** : Vérification automatique du statut
4. **Gestion des erreurs** : Retry automatique en cas d'échec

### Monitoring

- Suivi du statut de transcription en temps réel
- Logs détaillés pour le débogage
- Métriques de performance disponibles

## 🚀 Déploiement

### Variables d'environnement de production

```bash
# Production
DEEPGRAM_API_KEY=your-production-api-key
NODE_ENV=production
```

### Vérifications pré-déploiement

1. ✅ Clé API Deepgram configurée
2. ✅ Tests de transcription passent
3. ✅ URLs S3 accessibles
4. ✅ Base de données configurée
5. ✅ Logs et monitoring activés

## 📚 Ressources

- [Documentation Deepgram](https://developers.deepgram.com/)
- [API Reference](https://developers.deepgram.com/reference)
- [SDK JavaScript](https://github.com/deepgram/deepgram-node-sdk)
- [Support](https://support.deepgram.com/)

## 🤝 Support

En cas de problème :

1. Vérifiez les logs de l'application
2. Testez avec `npm run test:deepgram`
3. Consultez la documentation Deepgram
4. Contactez l'équipe de développement
