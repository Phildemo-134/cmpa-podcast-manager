# Génération de Tweets pour Épisodes de Podcast

## Vue d'ensemble

Cette fonctionnalité permet de générer automatiquement entre 10 et 15 tweets pour promouvoir un épisode de podcast, en se basant sur sa transcription. Les tweets sont générés avec l'IA Claude d'Anthropic et respectent la limite de 200 caractères de Twitter/X.

## Fonctionnalités

### 🎯 Génération Intelligente
- **IA Claude 3.5 Sonnet** : Utilise le modèle le plus récent d'Anthropic
- **Contenu adapté** : Reprend le ton et le style de la transcription
- **Hashtags pertinents** : 2-3 hashtags par tweet maximum
- **Variété d'approches** : Questions, citations, conseils, insights

### 📱 Interface Utilisateur
- **Section dédiée** : "Publication Réseaux Sociaux" dans la page épisode
- **Cards individuelles** : Chaque tweet dans sa propre card
- **Compteur de caractères** : Affichage du nombre de caractères (X/200)
- **Boutons de copie** : Copie individuelle ou globale des tweets
- **Bouton d'édition** : Modification du contenu et des hashtags
- **Bouton de planification** : Planification de la publication
- **Section tweets planifiés** : Affichage et gestion des tweets programmés

### 🔧 Fonctionnalités Techniques
- **Validation des tweets** : Vérification automatique de la limite de caractères
- **Gestion d'erreurs** : Messages d'erreur clairs et informatifs
- **État de chargement** : Indicateurs visuels pendant la génération
- **Régénération** : Possibilité de régénérer les tweets

## Architecture

### API Endpoint
```
POST /api/generate-tweets
```

**Paramètres :**
- `episodeId` : ID de l'épisode

**Réponse :**
```json
{
  "tweets": [
    {
      "content": "Contenu du tweet",
      "hashtags": ["hashtag1", "hashtag2"]
    }
  ]
}
```

### Composant React
```tsx
<TweetGenerator 
  episodeId={episode.id}
  hasTranscription={!!transcription && transcription.processing_status === 'completed'}
/>
```

## Utilisation

### 1. Prérequis
- Épisode avec transcription terminée (`processing_status === 'completed'`)
- Clé API Anthropic configurée dans les variables d'environnement

### 2. Génération
1. Aller sur la page de détails de l'épisode
2. S'assurer qu'une transcription est disponible
3. Cliquer sur "Générer des tweets"
4. Attendre la génération (quelques secondes)

### 3. Utilisation des Tweets
- **Copie individuelle** : Bouton copie sur chaque tweet
- **Copie globale** : Bouton "Copier tout" pour tous les tweets
- **Édition** : Bouton "Éditer" pour modifier le contenu et les hashtags
- **Planification** : Bouton "Planifier" pour programmer la publication
- **Régénération** : Bouton "Régénérer" pour de nouveaux tweets

## Configuration

### Variables d'Environnement
```env
ANTHROPIC_API_KEY=your_anthropic_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Dépendances
- `@anthropic-ai/sdk` : SDK Anthropic pour l'IA
- `@supabase/supabase-js` : Client Supabase

## Tests

### Scripts de Test
```bash
npm run test:tweets        # Test de génération de tweets
npm run test:scheduling    # Test de planification et gestion
```

Le script de génération teste :
- Récupération d'un épisode avec transcription
- Appel de l'API de génération
- Validation des tweets générés
- Vérification de la limite de caractères

Le script de planification teste :
- Planification d'un tweet
- Récupération des tweets planifiés
- Annulation d'un tweet
- Gestion des statuts

## Limitations et Améliorations Futures

### Limitations Actuelles
- Maximum 15 tweets par génération
- Dépendance à la qualité de la transcription
- Coût API Anthropic par génération

### Améliorations Possibles
- **Sauvegarde des tweets** : Stockage en base de données
- **Modèles personnalisés** : Différents styles de tweets
- **Planification** : Publication automatique programmée
- **Analytics** : Suivi des performances des tweets
- **Multi-plateformes** : LinkedIn, Facebook, etc.

## Sécurité

- **Authentification** : Vérification de l'utilisateur connecté
- **Validation** : Vérification des paramètres d'entrée
- **Limitation** : Pas d'accès aux données d'autres utilisateurs
- **Logs** : Traçabilité des erreurs et des utilisations

## Support

Pour toute question ou problème :
1. Vérifier les logs de l'API
2. Tester avec le script de test
3. Vérifier la configuration des variables d'environnement
4. Contrôler l'état de la transcription
