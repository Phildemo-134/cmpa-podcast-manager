# Migration vers Amazon S3 - CMPA Podcast Manager

Ce document décrit la migration complète du stockage des fichiers audio de Supabase Storage vers Amazon S3.

## 🎯 Objectifs de la Migration

- **Performance** : Amélioration des performances d'upload et de téléchargement
- **Scalabilité** : Gestion de fichiers plus volumineux et de trafic élevé
- **Sécurité** : Chiffrement des fichiers et contrôle d'accès granulaire
- **Coût** : Optimisation des coûts de stockage pour la production
- **Conformité** : Respect des standards de sécurité et de conformité

## 🏗️ Architecture Implémentée

### Composants Principaux

1. **`lib/s3.ts`** - Utilitaires S3 avec AWS SDK v2
2. **`app/api/upload-audio/route.ts`** - API d'upload sécurisée
3. **`app/api/audio-url/route.ts`** - Génération d'URLs signées
4. **`components/episodes/episode-audio-player.tsx`** - Lecteur audio avec URLs signées
5. **Migration DB** - Ajout des champs `s3_key` et `s3_bucket`

### Flux de Données

```
Client → API Route → S3 Upload → DB Update → URL Signée → Audio Player
```

## 🔧 Configuration Requise

### Variables d'Environnement

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=votre_access_key
AWS_SECRET_ACCESS_KEY=votre_secret_key
AWS_S3_BUCKET=votre_bucket_name
AWS_REGION=us-east-1

# Supabase (pour l'authentification)
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service
```

### Dépendances

```json
{
  "aws-sdk": "^2.1531.0"
}
```

## 🚀 Installation et Configuration

### 1. Configuration AWS S3

Exécutez le script de configuration automatique :

```bash
./scripts/setup-s3.sh
```

Ce script :
- Crée le bucket S3
- Configure le chiffrement AES256
- Désactive l'accès public
- Crée les politiques de sécurité
- Configure les permissions IAM

### 2. Mise à Jour de la Base de Données

```bash
# Appliquer la migration S3 dans le dashboard Supabase Cloud
# Créer les nouvelles colonnes via SQL Editor
```

### 3. Vérification de la Configuration

```bash
# Tester la connexion S3
npm run test:s3
```

## 📊 Structure des Données

### Table `episodes` - Nouveaux Champs

```sql
ALTER TABLE episodes ADD COLUMN s3_key TEXT;
ALTER TABLE episodes ADD COLUMN s3_bucket TEXT;
```

### Organisation des Fichiers S3

```
bucket-name/
├── audio/
│   ├── user-id-1/
│   │   ├── episode-id-1/
│   │   │   ├── abc123def.mp3
│   │   │   └── xyz789ghi.wav
│   │   └── episode-id-2/
│   └── user-id-2/
```

## 🔐 Sécurité Implémentée

### Chiffrement
- **Chiffrement côté serveur** : AES256 par défaut
- **Transit sécurisé** : HTTPS obligatoire
- **Clés de chiffrement** : Gérées par AWS

### Contrôle d'Accès
- **Authentification** : JWT Supabase requis
- **Autorisation** : Vérification propriétaire du fichier
- **URLs signées** : Expiration automatique (1 heure)
- **Politiques de bucket** : Accès public désactivé

### Validation
- **Types de fichiers** : MP3, WAV, M4A, AAC, OGG
- **Taille maximale** : 500MB
- **Métadonnées** : Validation côté serveur

## 📱 Utilisation

### Upload de Fichiers

```typescript
// Le composant AudioUpload gère automatiquement l'upload S3
import { AudioUpload } from '@/components/upload/audio-upload'

// L'upload se fait via l'API /api/upload-audio
```

### Lecture des Fichiers

```typescript
// Utilisation du lecteur audio avec URLs signées
import { EpisodeAudioPlayer } from '@/components/episodes/episode-audio-player'

<EpisodeAudioPlayer episode={episode} />
```

### Gestion des URLs

```typescript
// Génération d'URLs signées via l'API
const response = await fetch(`/api/audio-url?key=${s3Key}`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
const { url } = await response.json()
```

## 🧪 Tests

### Tests Unitaires

```bash
npm test
```

### Tests d'Intégration S3

```bash
# Tester l'upload S3
npm run test:upload

# Tester la génération d'URLs signées
npm run test:urls
```

## 📈 Monitoring et Logs

### Métriques S3
- **Temps d'upload** : Mesuré côté client
- **Taux de succès** : Logs d'erreur détaillés
- **Utilisation du stockage** : Dashboard AWS S3

### Logs d'Application
- **Uploads réussis** : Informations de fichier et métadonnées
- **Erreurs d'upload** : Détails des échecs et stack traces
- **Accès aux fichiers** : Audit des téléchargements

## 🔄 Migration des Données Existantes

### Script de Migration

```bash
# Migrer les fichiers existants de Supabase vers S3
npm run migrate:audio-files
```

### Processus de Migration
1. **Sauvegarde** : Export des métadonnées existantes
2. **Transfert** : Upload des fichiers vers S3
3. **Mise à jour** : Mise à jour des URLs dans la base
4. **Validation** : Vérification de l'intégrité des données
5. **Nettoyage** : Suppression des anciens fichiers Supabase

## 🚨 Gestion des Erreurs

### Erreurs Communes

1. **Upload échoué**
   - Vérifier les permissions S3
   - Contrôler la taille et le type de fichier
   - Vérifier la connectivité réseau

2. **URL signée invalide**
   - Vérifier l'authentification
   - Contrôler l'expiration de l'URL
   - Vérifier les permissions sur le fichier

3. **Accès refusé**
   - Vérifier la propriété du fichier
   - Contrôler les politiques IAM
   - Vérifier la configuration du bucket

### Récupération d'Erreur

```typescript
try {
  const result = await uploadToS3(file)
  // Traitement du succès
} catch (error) {
  if (error.code === 'AccessDenied') {
    // Gérer l'accès refusé
  } else if (error.code === 'NoSuchBucket') {
    // Gérer le bucket manquant
  } else {
    // Gérer les autres erreurs
  }
}
```

## 💰 Coûts et Optimisation

### Estimation des Coûts (us-east-1)

- **Stockage** : $0.023/GB/mois
- **Transfert sortant** : $0.09/GB
- **Requêtes** : $0.0004/1000 requêtes
- **Chiffrement** : Gratuit

### Optimisations Recommandées

1. **Lifecycle Rules** : Suppression automatique des fichiers anciens
2. **Intelligent Tiering** : Stockage automatique en fonction de l'usage
3. **Compression** : Réduction de la taille des fichiers audio
4. **CDN** : Distribution globale via CloudFront

## 🔮 Évolutions Futures

### Fonctionnalités Planifiées

1. **Transcodage automatique** : Conversion vers différents formats
2. **Watermarking** : Ajout de marques d'eau audio
3. **Analyse audio** : Détection de qualité et normalisation
4. **Backup automatique** : Sauvegarde vers Glacier

### Intégrations

1. **CloudFront** : Distribution de contenu globale
2. **Lambda** : Traitement automatique des fichiers
3. **SQS** : File d'attente pour les traitements
4. **CloudWatch** : Monitoring avancé

## 📚 Ressources

### Documentation Officielle
- [AWS S3 Developer Guide](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
- [Supabase Documentation](https://supabase.com/docs)

### Support
- **Issues GitHub** : Pour les bugs et demandes de fonctionnalités
- **Documentation** : Ce fichier et le README principal
- **Communauté** : Discussions et exemples d'usage

---

**Note** : Cette migration est conçue pour être transparente pour les utilisateurs finaux. Les fichiers existants continuent de fonctionner pendant la transition.
