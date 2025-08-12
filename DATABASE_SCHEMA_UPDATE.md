# Mise à jour du Schéma de Base de Données

## 📝 Nouvelles Propriétés Ajoutées

### Table `episodes`

#### 1. `timestamps` (TEXT, optionnel)
- **Description** : Stockage des timestamps et descriptions des segments de l'épisode
- **Format recommandé** : "00:00 - Introduction, 05:30 - Premier sujet, 12:45 - Conclusion"
- **Utilisation** : Permet aux utilisateurs de définir manuellement les segments de leur épisode
- **Exemple** : "00:00 - Introduction, 03:15 - Présentation des invités, 08:30 - Discussion principale"

#### 2. `video_url` (TEXT, optionnel)
- **Description** : URL vers la version vidéo de l'épisode
- **Formats supportés** : YouTube, Vimeo, ou tout autre service de streaming vidéo
- **Utilisation** : Lien vers la version vidéo pour les épisodes qui ont une composante visuelle
- **Exemple** : "https://youtube.com/watch?v=abc123"

### Table `transcriptions`

#### 1. `type` (TEXT, obligatoire avec valeur par défaut)
- **Description** : Type de transcription généré
- **Valeurs possibles** :
  - `'raw'` : Transcription brute directement depuis l'API de transcription
  - `'enhanced'` : Transcription améliorée et nettoyée par l'IA
- **Valeur par défaut** : `'raw'`
- **Utilisation** : Permet de distinguer entre la transcription initiale et la version améliorée

## 🔄 Migration des Données Existantes

### Script de Migration
```sql
-- Migration 002_add_new_fields.sql
ALTER TABLE public.episodes 
ADD COLUMN IF NOT EXISTS timestamps TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT;

ALTER TABLE public.transcriptions 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'raw' CHECK (type IN ('raw', 'enhanced'));

-- Mettre à jour les transcriptions existantes
UPDATE public.transcriptions 
SET type = 'raw' 
WHERE type IS NULL;
```

### Impact sur les Données Existantes
- **Nouvelles colonnes** : Les nouvelles colonnes sont ajoutées avec des valeurs `NULL` par défaut
- **Compatibilité** : Aucune donnée existante n'est affectée
- **Validation** : Les nouvelles contraintes s'appliquent uniquement aux nouvelles insertions

## 🎯 Cas d'Usage

### Timestamps Manuels
- **Avant l'IA** : L'utilisateur peut définir manuellement les segments de son épisode
- **Après l'IA** : L'IA peut suggérer des timestamps basés sur l'analyse du contenu
- **Édition** : L'utilisateur peut modifier et affiner les timestamps générés

### Liens Vidéo
- **Podcasts vidéo** : Pour les épisodes enregistrés avec vidéo
- **Promotion** : Lien vers YouTube ou autres plateformes pour la promotion
- **Contenu multi-format** : Synchronisation entre audio et vidéo

### Types de Transcription
- **Workflow** : 
  1. `raw` : Transcription initiale (rapide, moins précise)
  2. `enhanced` : Transcription améliorée (plus lente, plus précise)
- **Qualité** : Permet de choisir entre vitesse et précision
- **Coût** : Différenciation des niveaux de service

## 🚀 Implémentation Frontend

### Composant AudioUpload
- **Champs ajoutés** : Timestamps et URL vidéo dans le formulaire d'upload
- **Validation** : Format des timestamps et validité des URLs
- **Interface** : Champs optionnels avec exemples et aide contextuelle

### Composant EpisodeList
- **Affichage** : Nouveaux champs visibles dans la liste des épisodes
- **Actions** : Liens cliquables vers les vidéos
- **Formatage** : Timestamps affichés de manière lisible

## 🔒 Sécurité et Validation

### Contraintes de Base de Données
- **Timestamps** : Aucune contrainte spécifique (texte libre)
- **Video URL** : Aucune contrainte spécifique (validation côté application)
- **Type** : Contrainte CHECK pour limiter aux valeurs 'raw' et 'enhanced'

### Validation Côté Application
- **Timestamps** : Format recommandé avec aide contextuelle
- **Video URL** : Validation du format URL
- **Type** : Valeur par défaut 'raw' pour les nouvelles transcriptions

## 📊 Impact sur les Performances

### Index
- **Aucun impact** : Les nouvelles colonnes ne sont pas indexées par défaut
- **Recommandation** : Ajouter des index si ces champs sont fréquemment recherchés

### Stockage
- **Timestamps** : Impact minimal (texte court)
- **Video URL** : Impact minimal (URLs typiquement < 200 caractères)
- **Type** : Impact négligeable (enum de 2 valeurs)

## 🔮 Évolutions Futures

### Timestamps
- **Format structuré** : Passage à JSONB pour un format plus riche
- **Synchronisation** : Lien avec les outils d'édition audio/vidéo
- **IA** : Génération automatique basée sur l'analyse du contenu

### Video URL
- **Métadonnées** : Extraction automatique des informations vidéo
- **Thumbnails** : Génération automatique des aperçus
- **Analytics** : Suivi des performances vidéo

### Type de Transcription
- **Niveaux supplémentaires** : 'premium', 'custom'
- **Modèles IA** : Choix entre différents modèles de transcription
- **Personnalisation** : Adaptation aux besoins spécifiques du contenu

---

*Document créé le : $(date)*
*Version : 1.0*
