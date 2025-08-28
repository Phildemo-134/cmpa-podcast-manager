# 🔍 Guide de dépannage - Transcription Deepgram

## ❌ Problème : "Erreur lors de la transcription: Erreur lors de la transcription?"

Cette erreur générique indique un problème avec la configuration ou l'API Deepgram.

## 🔧 Solutions étape par étape

### 1. Vérifier la variable d'environnement

**Problème le plus courant :** La variable `DEEPGRAM_API_KEY` n'est pas définie.

```bash
# Vérifiez votre fichier .env.local ou .env
DEEPGRAM_API_KEY=your_actual_deepgram_api_key_here
```

**❌ Ne pas faire :**
```bash
DEEPGRAM_API_KEY=your_deepgram_api_key  # ❌ Placeholder
DEEPGRAM_API_KEY=                        # ❌ Vide
```

**✅ Faire :**
```bash
DEEPGRAM_API_KEY=dg_1234567890abcdef...  # ✅ Vraie clé API
```

### 2. Obtenir une clé API Deepgram

1. Allez sur [Deepgram Console](https://console.deepgram.com/)
2. Créez un compte ou connectez-vous
3. Créez un nouveau projet
4. Copiez la clé API (commence par `dg_`)

### 3. Tester la configuration

Utilisez l'API de test que nous avons créée :

```bash
# Test de la configuration
curl http://localhost:3000/api/test-deepgram

# Test de la transcription (remplacez par une vraie URL audio)
curl -X POST http://localhost:3000/api/test-deepgram \
  -H "Content-Type: application/json" \
  -d '{"audioUrl": "https://example.com/test-audio.mp3"}'
```

### 4. Vérifier les logs

Dans votre terminal où vous exécutez `npm run dev`, vous devriez voir :

```
🧪 Test de configuration Deepgram...
🔍 Test de la configuration Deepgram...
✅ Clé API Deepgram configurée
📝 Clé API: dg_1234567...abcd
✅ Clé API Deepgram valide
```

### 5. Problèmes courants

#### A. Clé API invalide
```
❌ DEEPGRAM_API_KEY is not properly configured. Please set a valid API key.
```
**Solution :** Vérifiez que votre clé API est correcte et commence par `dg_`

#### B. Quota dépassé
```
❌ Erreur Deepgram API: Quota exceeded
```
**Solution :** Vérifiez votre quota sur [Deepgram Console](https://console.deepgram.com/)

#### C. URL audio invalide
```
❌ URL audio doit être une URL HTTP valide
```
**Solution :** Vérifiez que l'URL de votre fichier audio est accessible publiquement

#### D. Format audio non supporté
```
❌ Erreur Deepgram API: Unsupported audio format
```
**Solution :** Utilisez MP3, WAV, M4A, AAC ou OGG

### 6. Test complet

1. **Redémarrez votre serveur** après avoir ajouté la variable d'environnement
2. **Testez la configuration :** `/api/test-deepgram`
3. **Testez avec un fichier audio :** Uploadez un petit fichier MP3 de test
4. **Vérifiez les logs** dans la console

### 7. Structure des variables d'environnement

Votre fichier `.env.local` doit contenir :

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Deepgram
DEEPGRAM_API_KEY=dg_your_actual_api_key_here

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name
```

## 🚨 Si le problème persiste

1. **Vérifiez les logs** dans la console du navigateur (F12)
2. **Vérifiez les logs** du serveur Next.js
3. **Testez l'API Deepgram** directement avec un outil comme Postman
4. **Vérifiez votre quota** Deepgram
5. **Contactez le support** si nécessaire

## 📞 Support

- **Deepgram Documentation :** [docs.deepgram.com](https://docs.deepgram.com/)
- **Deepgram Console :** [console.deepgram.com](https://console.deepgram.com/)
- **GitHub Issues :** Créez une issue avec les logs d'erreur complets
