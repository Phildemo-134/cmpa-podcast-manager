# 🎤 Édition des Noms des Speakers

## 🎯 Fonctionnalité

La fonctionnalité d'édition des noms des speakers permet de personnaliser l'affichage des personnes qui parlent dans une transcription. Au lieu d'afficher "Speaker 1", "Speaker 2", etc., vous pouvez maintenant utiliser des noms réels comme "Jean", "Marie", "Interviewer", etc.

## ✨ Comment ça Fonctionne

### 1. **Affichage Automatique**
- Deepgram identifie automatiquement les différents speakers
- Chaque segment de transcription est marqué avec un identifiant de speaker
- L'interface affiche "Speaker 1", "Speaker 2", etc. par défaut

### 2. **Édition Personnalisée**
- Cliquez sur "Éditer les noms" dans la section "Gestion des Speakers"
- Modifiez les noms selon vos préférences
- Sauvegardez les modifications

### 3. **Mise à Jour en Temps Réel**
- Les noms sont mis à jour immédiatement dans l'interface
- Tous les timestamps utilisent les nouveaux noms
- Les modifications sont sauvegardées en base de données

## 🚀 Utilisation

### Étape 1: Accéder à la Transcription
1. Allez dans la page de détail d'un épisode
2. Assurez-vous qu'une transcription existe
3. Scrollez jusqu'à la section "Transcription"

### Étape 2: Éditer les Noms des Speakers
1. **Localisez la section "Gestion des Speakers"**
   - Elle apparaît automatiquement si des speakers sont détectés
   - Affiche le nombre de segments par speaker

2. **Cliquez sur "Éditer les noms"**
   - Le bouton devient "Sauvegarder" et "Annuler"
   - Des champs de saisie apparaissent pour chaque speaker

3. **Modifiez les noms**
   - Tapez les nouveaux noms dans les champs
   - Exemples : "Jean", "Marie", "Interviewer", "Invité", etc.

4. **Sauvegardez les modifications**
   - Cliquez sur "Sauvegarder"
   - Attendez la confirmation de sauvegarde
   - Les noms sont mis à jour dans toute l'interface

### Étape 3: Vérification
- Les timestamps affichent maintenant les nouveaux noms
- La section "Gestion des Speakers" montre les noms personnalisés
- Les modifications sont persistantes

## 📝 Exemples d'Utilisation

### Podcast Interview
```
Speaker 1 → "Interviewer"
Speaker 2 → "Invité"
Speaker 3 → "Co-animateur"
```

### Conversation de Groupe
```
Speaker 1 → "Jean"
Speaker 2 → "Marie"
Speaker 3 → "Pierre"
Speaker 4 → "Sophie"
```

### Émission Radio
```
Speaker 1 → "Présentateur"
Speaker 2 → "Chroniqueur"
Speaker 3 → "Invité Expert"
```

## 🔧 Fonctionnalités Techniques

### Sauvegarde Automatique
- Les modifications sont sauvegardées en base de données
- Pas de perte de données en cas de rechargement
- Synchronisation en temps réel

### Validation des Données
- Vérification que la transcription existe
- Validation des mappings des speakers
- Gestion des erreurs de sauvegarde

### Interface Réactive
- État de chargement pendant la sauvegarde
- Boutons désactivés pendant les opérations
- Messages d'erreur en cas de problème

## 🚨 Limitations et Notes

### Limitations
- **Noms uniques** : Chaque speaker doit avoir un nom différent
- **Persistance** : Les modifications sont sauvegardées définitivement
- **Pas de retour en arrière** : Impossible d'annuler après sauvegarde

### Bonnes Pratiques
- **Noms descriptifs** : Utilisez des noms qui identifient clairement la personne
- **Cohérence** : Gardez les mêmes noms pour tous les épisodes d'une série
- **Simplicité** : Évitez les noms trop longs ou complexes

### Dépannage
- **Pas de speakers détectés** : Vérifiez que la diarisation est activée
- **Erreur de sauvegarde** : Vérifiez votre connexion internet
- **Noms non mis à jour** : Rechargez la page et réessayez

## 📊 Structure des Données

### Avant Édition
```json
{
  "timestamps": [
    {
      "start": 0,
      "end": 5,
      "text": "Bonjour, bienvenue !",
      "speaker": "Speaker 1"
    }
  ]
}
```

### Après Édition
```json
{
  "timestamps": [
    {
      "start": 0,
      "end": 5,
      "text": "Bonjour, bienvenue !",
      "speaker": "Jean"
    }
  ]
}
```

## 🔄 Workflow Complet

1. **Upload audio** → Fichier audio uploadé
2. **Transcription** → Deepgram génère la transcription avec diarisation
3. **Édition des speakers** → Personnalisation des noms
4. **Sauvegarde** → Mise à jour en base de données
5. **Affichage** → Interface mise à jour avec les nouveaux noms

## 💡 Conseils d'Utilisation

### Pour les Podcasts
- Identifiez clairement l'animateur principal
- Nommez les invités de manière descriptive
- Utilisez des noms cohérents sur tous les épisodes

### Pour les Réunions
- Utilisez les prénoms des participants
- Ajoutez des rôles si nécessaire (ex: "Manager", "Développeur")
- Gardez une liste de référence pour la cohérence

### Pour les Interviews
- Identifiez l'interviewer et l'interviewé
- Utilisez des noms ou des rôles clairs
- Ajoutez des informations contextuelles si utile

---

**Note** : Cette fonctionnalité améliore considérablement la lisibilité des transcriptions en remplaçant les identifiants techniques par des noms significatifs.
