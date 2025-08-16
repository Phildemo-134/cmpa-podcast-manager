# Génération Automatique de Description et Timestamps d'Épisode

## Vue d'ensemble

Cette fonctionnalité permet de générer automatiquement une description d'épisode de podcast et des timestamps organisés en utilisant l'IA Claude Sonnet 3.5 d'Anthropic. La description et les timestamps sont générés à partir de la transcription optimisée de l'épisode et sont optimisés pour les lecteurs de podcast.

## Fonctionnalités

### Bouton "Générer" - Description
- **Localisation** : À côté du champ "Description" en mode édition
- **Visibilité** : Apparaît uniquement quand une transcription est disponible et terminée
- **État** : Affiche un indicateur de chargement pendant la génération

### Bouton "Générer" - Timestamps
- **Localisation** : À côté du champ "Timestamps" en mode édition
- **Visibilité** : Apparaît uniquement quand une transcription est disponible et terminée
- **État** : Affiche un indicateur de chargement pendant la génération

### Génération IA
- **Modèle** : Claude Sonnet 3.5 (claude-3-5-sonnet-20241022)
- **Source** : Transcription optimisée de l'épisode
- **Format Description** : 150-200 mots optimisés pour les lecteurs de podcast
- **Format Timestamps** : Liste organisée au format "MM:SS - Sujet/Description"

## Utilisation

### Prérequis
1. L'épisode doit avoir une transcription terminée (`processing_status = 'completed'`)
2. La clé API Anthropic doit être configurée (`ANTHROPIC_API_KEY`)
3. L'utilisateur doit être en mode édition de l'épisode

### Étapes - Description
1. Aller sur la page de détails de l'épisode
2. Cliquer sur "Modifier" pour passer en mode édition
3. Cliquer sur le bouton "Générer" à côté du champ Description
4. Attendre la génération (indicateur de chargement)
5. La description générée apparaît automatiquement dans le champ
6. Cliquer sur "Sauvegarder" pour conserver les modifications

### Étapes - Timestamps
1. Aller sur la page de détails de l'épisode
2. Cliquer sur "Modifier" pour passer en mode édition
3. Cliquer sur le bouton "Générer" à côté du champ Timestamps
4. Attendre la génération (indicateur de chargement)
5. Les timestamps générés apparaissent automatiquement dans le champ
6. Cliquer sur "Sauvegarder" pour conserver les modifications

## API Endpoints

### POST `/api/generate-description`

**Corps de la requête :**
```json
{
  "episodeId": "uuid-de-l-episode"
}
```

**Réponse de succès :**
```json
{
  "success": true,
  "description": "Description générée par l'IA..."
}
```

**Réponse d'erreur :**
```json
{
  "error": "Message d'erreur descriptif"
}
```

### POST `/api/generate-timestamps`

**Corps de la requête :**
```json
{
  "episodeId": "uuid-de-l-episode"
}
```

**Réponse de succès :**
```json
{
  "success": true,
  "timestamps": "00:00 - Introduction\n05:30 - Discussion principale\n..."
}
```

**Réponse d'erreur :**
```json
{
  "error": "Message d'erreur descriptif"
}
```

## Prompts IA

### Prompt Description
Le prompt envoyé à Claude Sonnet 3.5 est structuré pour :
- Créer une description professionnelle et engageante
- Respecter une limite de 150-200 mots
- Adapter le contenu pour les lecteurs de podcast
- Utiliser un ton professionnel pas trop marketing mais accessible
- Inclure les points clés et sujets abordés
- Terminer par un appel à l'action subtil

### Prompt Timestamps
Le prompt envoyé à Claude Sonnet 3.5 est structuré pour :
- Analyser la transcription pour identifier les sujets principaux et les transitions
- Créer des timestamps au format "MM:SS - Sujet/Description"
- Organiser les timestamps chronologiquement
- Être précis dans la détection des changements de sujets
- Utiliser des descriptions courtes mais claires pour chaque section
- Identifier au moins 5-8 sections principales
- Inclure les introductions, conclusions et transitions importantes

## Gestion des Erreurs

### Erreurs Possibles
- **400** : ID de l'épisode manquant
- **404** : Épisode non trouvé
- **400** : Transcription non trouvée ou non terminée
- **500** : Erreur lors de la génération IA ou erreur interne

### Gestion des Erreurs - Description
- Affichage d'alertes utilisateur en cas d'échec
- Désactivation du bouton pendant la génération
- Indicateur visuel de l'état de génération

### Gestion des Erreurs - Timestamps
- Affichage d'alertes utilisateur en cas d'échec
- Désactivation du bouton pendant la génération
- Indicateur visuel de l'état de génération

### Gestion Côté Client
- Affichage d'alertes utilisateur en cas d'erreur
- Désactivation des boutons pendant la génération
- Indicateur visuel de l'état de génération
- Mise à jour automatique des champs description et timestamps

## Configuration

### Variables d'Environnement Requises
```bash
ANTHROPIC_API_KEY=your-anthropic-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Dépendances
- `@anthropic-ai/sdk` : SDK Anthropic pour l'API Claude
- `@supabase/supabase-js` : Client Supabase pour la base de données

## Sécurité

- Utilisation de la clé de service Supabase pour l'accès à la base de données
- Validation des entrées côté serveur
- Vérification de l'existence de l'épisode et de la transcription
- Gestion sécurisée des erreurs sans exposition d'informations sensibles

## Performance

- Génération asynchrone avec indicateur de chargement
- Limitation des tokens de réponse (max 500 pour description, 800 pour timestamps)
- Température de génération optimisée (0.7 pour description, 0.3 pour timestamps)
- Optimisation pour équilibrer créativité et cohérence selon le type de contenu

## Tests

### Tests Manuels Recommandés
1. Génération de description avec transcription valide
2. Génération de timestamps avec transcription valide
3. Tentative de génération sans transcription
4. Gestion des erreurs d'API
5. Sauvegarde après génération
6. Interface utilisateur en mode édition
7. Test des deux boutons "Générer" simultanément

### Tests Automatisés
- Validation des paramètres d'entrée
- Gestion des erreurs de base de données
- Gestion des erreurs d'API Anthropic
- Format de réponse correct

## Évolutions Futures

### Améliorations Possibles
- Personnalisation du style de description et de timestamps
- Support de plusieurs langues
- Historique des descriptions et timestamps générés
- A/B testing des descriptions et timestamps
- Intégration avec d'autres modèles IA
- Génération de descriptions et timestamps pour différentes plateformes
- Synchronisation automatique des timestamps avec l'audio
- Export des timestamps dans différents formats (VTT, SRT, etc.)

## Support

Pour toute question ou problème lié à cette fonctionnalité, consulter :
- Les logs du serveur pour les erreurs côté API
- La console du navigateur pour les erreurs côté client
- La documentation Anthropic pour les erreurs d'API IA
