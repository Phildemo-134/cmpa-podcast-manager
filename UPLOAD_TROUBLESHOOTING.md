# 🔍 Guide de dépannage - Upload d'épisodes

## ❌ Problème : "Unexpected token 'R', "Request En"... is not valid JSON"

Cette erreur indique un problème avec le parsing JSON lors de l'upload d'épisode. Le serveur reçoit une réponse malformée ou une page d'erreur HTML au lieu de JSON.

## 🔧 Solutions étape par étape

### 1. Vérifier les variables d'environnement

**Variables requises pour l'upload :**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_s3_bucket_name

# Deepgram (pour la transcription)
DEEPGRAM_API_KEY=dg_your_deepgram_api_key

# Anthropic (pour la génération de contenu)
ANTHROPIC_API_KEY=sk-ant-api03-your_anthropic_api_key
```

### 2. Vérifier la configuration S3

**Problème courant :** Configuration S3 incorrecte

```bash
# Vérifiez que votre bucket S3 existe et est accessible
aws s3 ls s3://your-bucket-name

# Vérifiez les permissions
aws s3api get-bucket-policy --bucket your-bucket-name
```

### 3. Tester l'API d'upload

Utilisez un outil comme Postman ou curl pour tester l'API :

```bash
# Test simple de l'API (sans fichier)
curl -X POST http://localhost:3000/api/upload-audio \
  -H "Authorization: Bearer YOUR_SUPABASE_TOKEN" \
  -F "file=@test-audio.mp3" \
  -F "title=Test Episode" \
  -F "description=Test Description"
```

### 4. Vérifier les logs du serveur

Dans votre terminal où vous exécutez `npm run dev`, vous devriez voir :

```
🚀 Début de l'upload audio...
✅ Utilisateur authentifié: [user_id]
📝 Données reçues: { fileName: "test.mp3", fileSize: 1234567, ... }
✅ Validation du fichier réussie
⏱️ Durée calculée: 0 secondes
💾 Création de l'épisode dans la base de données...
✅ Épisode créé avec l'ID: [episode_id]
☁️ Upload vers S3...
✅ Upload S3 réussi: { url: "...", key: "..." }
💾 Mise à jour de l'épisode avec les infos S3...
✅ Épisode mis à jour avec succès
🎉 Upload terminé avec succès
```

### 5. Problèmes courants

#### A. Erreur d'authentification
```
❌ Token d'authentification manquant
❌ Token d'authentification invalide
```
**Solution :** Vérifiez que l'utilisateur est connecté et que le token est valide

#### B. Erreur de validation de fichier
```
❌ Type de fichier non supporté: [type]
❌ Fichier trop volumineux: [size] bytes
```
**Solution :** Utilisez un fichier audio valide (MP3, WAV, M4A, AAC, OGG) de moins de 500MB

#### C. Erreur de base de données
```
❌ Erreur création épisode: [error_message]
❌ Erreur mise à jour épisode: [error_message]
```
**Solution :** Vérifiez la configuration Supabase et les permissions de la base de données

#### D. Erreur S3
```
❌ Erreur lors de l'upload S3
```
**Solution :** Vérifiez la configuration AWS S3 et les permissions du bucket

### 6. Débogage avancé

#### A. Vérifier la console du navigateur
Ouvrez les outils de développement (F12) et regardez la console pour les erreurs JavaScript.

#### B. Vérifier l'onglet Network
Dans les outils de développement, allez dans l'onglet Network et regardez la requête d'upload :
- Status de la réponse
- Contenu de la réponse
- Headers de la requête

#### C. Vérifier les logs du serveur
Regardez dans votre terminal `npm run dev` pour les logs détaillés.

### 7. Test de l'infrastructure

#### A. Test de Supabase
```bash
# Vérifiez la connexion à Supabase
curl -X GET "https://your-project.supabase.co/rest/v1/episodes?select=count" \
  -H "apikey: YOUR_ANON_KEY"
```

#### B. Test de S3
```bash
# Vérifiez l'accès S3
aws s3 ls s3://your-bucket-name/
```

#### C. Test de l'API
```bash
# Test de santé de l'API
curl http://localhost:3000/api/health
```

### 8. Solutions spécifiques

#### A. Si l'erreur persiste après vérification des variables d'environnement
1. **Redémarrez le serveur** Next.js
2. **Videz le cache** du navigateur
3. **Vérifiez les permissions** de la base de données

#### B. Si l'upload échoue à l'étape S3
1. **Vérifiez les permissions** du bucket S3
2. **Vérifiez la politique CORS** du bucket
3. **Vérifiez les clés AWS** et leur validité

#### C. Si l'upload échoue à l'étape base de données
1. **Vérifiez la structure** de la table `episodes`
2. **Vérifiez les politiques RLS** (Row Level Security)
3. **Vérifiez les contraintes** de la base de données

### 9. Structure de la table episodes

Assurez-vous que votre table `episodes` a la bonne structure :

```sql
CREATE TABLE episodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  audio_file_url TEXT,
  file_size BIGINT,
  duration INTEGER,
  timestamps TEXT,
  video_url TEXT,
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'transcribing', 'transcribed', 'optimizing', 'optimized', 'generating_content', 'completed', 'error')),
  s3_key TEXT,
  s3_bucket TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 10. Vérification finale

1. **Toutes les variables d'environnement** sont définies et valides
2. **Le serveur Next.js** est redémarré
3. **L'utilisateur est connecté** avec un token valide
4. **Le fichier audio** est valide et de taille raisonnable
5. **Les services externes** (Supabase, S3) sont accessibles

## 🚨 Si le problème persiste

1. **Créez une issue GitHub** avec :
   - Les logs complets du serveur
   - Les erreurs de la console du navigateur
   - La configuration des variables d'environnement (sans les vraies clés)
   - Les étapes pour reproduire le problème

2. **Vérifiez la documentation** des services utilisés
3. **Contactez le support** des services tiers si nécessaire

## 📞 Support

- **Supabase :** [supabase.com/support](https://supabase.com/support)
- **AWS S3 :** [aws.amazon.com/support](https://aws.amazon.com/support)
- **Deepgram :** [deepgram.com/support](https://deepgram.com/support)
- **Anthropic :** [anthropic.com/support](https://anthropic.com/support)
