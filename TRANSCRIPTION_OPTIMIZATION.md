# Optimisation des Transcriptions avec Google Gemini

## Vue d'ensemble

Cette fonctionnalité permet d'optimiser automatiquement les transcriptions brutes en utilisant l'IA Google Gemini 2.5 Flash. L'optimisation améliore la lisibilité tout en conservant l'essentiel du message.

## Fonctionnalités

### Bouton "Optimiser"
- Situé à côté du bouton "Régénérer" dans la section transcription
- Utilise l'icône Sparkles (✨) pour indiquer l'IA
- Affiche un indicateur de chargement pendant l'optimisation

### Processus d'optimisation
1. **Extraction du texte** : Récupère la transcription brute formatée
2. **Appel à Gemini** : Envoie le texte à l'API Google Gemini 2.5 Flash
3. **Traitement IA** : Gemini optimise le texte selon des règles spécifiques
4. **Affichage** : La transcription optimisée apparaît dans une nouvelle section

## Règles d'optimisation

### 1. Correction des attributions
- Corrige les erreurs d'attribution des locuteurs
- Gère les phrases incomplètes aux changements de locuteur

### 2. Combinaison des paragraphes
- Combine les paragraphes d'un même locuteur
- Conserve le timestamp de début du premier paragraphe

### 3. Amélioration de la lisibilité
- Supprime les mots de remplissage ("hum", "euh", "en fait", "tu vois")
- Élimine les faux départs et répétitions
- Scinde les phrases trop longues
- Conserve un flux de conversation naturel

### 4. Formatage cohérent
- Maintient le format `[00:00:00] Speaker X`
- Espacement approprié entre les sections
- Ponctuation et majuscules correctes
- Sauts de paragraphe pour les changements de sujet

## Configuration requise

### Variables d'environnement
```bash
# Ajouter dans .env.local
GEMINI_API_KEY=your-gemini-api-key
```

### Dépendances
```bash
npm install @google/genai mime
```

## Utilisation

1. **Accéder à un épisode** avec transcription existante
2. **Cliquer sur "Optimiser"** dans la section transcription
3. **Attendre le traitement** (indicateur de chargement)
4. **Consulter le résultat** dans la section "Transcription optimisée"

## Interface utilisateur

### Section transcription brute
- Affichage du texte original formaté
- Boutons d'action (Masquer/Afficher, Copier, Télécharger, Optimiser)

### Section transcription optimisée
- Titre avec icône Sparkles
- Fond bleu clair pour distinction
- Texte optimisé avec formatage préservé
- Scroll automatique pour les longs textes

## Gestion des erreurs

- **Clé API manquante** : Message d'erreur explicite
- **Échec de l'API** : Affichage de l'erreur dans une alerte
- **Timeout** : Gestion des délais d'attente
- **Format invalide** : Validation des données d'entrée

## Limitations

- Nécessite une connexion internet active
- Dépend de la disponibilité de l'API Gemini
- Limites de taux d'API Google (à vérifier selon votre plan)
- Taille maximale du texte (selon les limites Gemini)

## Exemple d'utilisation

### Avant optimisation
```
[00:01:08] Dimitri : Uhm, euh, ok, je pensais que, tu vois
[00:01:18] Dimitri : les températures ont diminuées, hum, par rapport aux, aux derniers jours
[00:01:26] Sophia : on peut tout de même pas dire qu'on en a fini avec cet épisode de canicule
```

### Après optimisation
```
[00:01:08] Dimitri
les températures ont diminuées par rapport aux derniers jours

[00:01:26] Sophia 
on peut tout de même pas dire qu'on en a fini avec cet épisode de canicule
```

## Maintenance

- Vérifier régulièrement la validité de la clé API Gemini
- Surveiller les logs d'erreur de l'API
- Mettre à jour les règles d'optimisation si nécessaire
- Tester avec différents types de transcriptions

## Support

Pour toute question ou problème :
1. Vérifier les logs de la console
2. Contrôler la validité de la clé API
3. Tester avec un texte simple
4. Consulter la documentation Google Gemini
