# 🔍 Guide de dépannage - Génération de tweets

## ❌ Problème : "Erreur lors du parsing de la réponse"

Cette erreur indique un problème avec la génération de tweets via l'API Anthropic (Claude).

## 🔧 Solutions étape par étape

### 1. Vérifier la variable d'environnement

**Problème le plus courant :** La variable `ANTHROPIC_API_KEY` n'est pas définie.

```bash
# Vérifiez votre fichier .env.local ou .env
ANTHROPIC_API_KEY=your_actual_anthropic_api_key_here
```

**❌ Ne pas faire :**
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key  # ❌ Placeholder
ANTHROPIC_API_KEY=                        # ❌ Vide
```

**✅ Faire :**
```bash
ANTHROPIC_API_KEY=sk-ant-api03-1234567890abcdef...  # ✅ Vraie clé API
```

### 2. Obtenir une clé API Anthropic

1. Allez sur [Anthropic Console](https://console.anthropic.com/)
2. Créez un compte ou connectez-vous
3. Créez un nouveau projet
4. Copiez la clé API (commence par `sk-ant-api03-`)

### 3. Tester la configuration

Utilisez l'API de test que nous avons créée :

```bash
# Test de la configuration
curl http://localhost:3000/api/test-anthropic

# Test de génération avec un prompt simple
curl -X POST http://localhost:3000/api/test-anthropic \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Génère 3 tweets courts sur le thème de la technologie"}'
```

### 4. Vérifier les logs

Dans votre terminal où vous exécutez `npm run dev`, vous devriez voir :

```
🧪 Test de configuration Anthropic...
✅ Clé API Anthropic configurée
📝 Clé API: sk-ant-api0...abcd
🤖 Test d'appel à Claude...
✅ Test d'appel à Claude réussi
📄 Réponse: Test réussi
```

### 5. Problèmes courants

#### A. Clé API invalide
```
❌ ANTHROPIC_API_KEY is not properly configured. Please set a valid API key.
```
**Solution :** Vérifiez que votre clé API est correcte et commence par `sk-ant-api03-`

#### B. Quota dépassé
```
❌ Erreur Anthropic API: Rate limit exceeded
```
**Solution :** Vérifiez votre quota sur [Anthropic Console](https://console.anthropic.com/)

#### C. Modèle non disponible
```
❌ Erreur Anthropic API: Model not found
```
**Solution :** Vérifiez que le modèle `claude-3-5-sonnet-20241022` est disponible

#### D. Erreur de parsing JSON
```
❌ Erreur lors du parsing de la réponse: aucun JSON trouvé
```
**Solution :** Le problème vient de la réponse de Claude qui ne contient pas de JSON valide

### 6. Test complet

1. **Redémarrez votre serveur** après avoir ajouté la variable d'environnement
2. **Testez la configuration :** `/api/test-anthropic`
3. **Testez la génération :** Uploadez un épisode avec transcription et testez la génération de tweets
4. **Vérifiez les logs** dans la console

### 7. Structure des variables d'environnement

Votre fichier `.env.local` doit contenir :

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Deepgram
DEEPGRAM_API_KEY=dg_your_actual_api_key_here

# Anthropic
ANTHROPIC_API_KEY=sk-ant-api03-your_actual_api_key_here

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name
```

### 8. Débogage avancé

Si le problème persiste, vérifiez les logs détaillés :

```
🎯 Génération de tweets pour l'épisode: [episode_id]
📝 Transcription trouvée, statut: completed
🤖 Appel de Claude avec le prompt...
✅ Réponse reçue de Claude
📄 Réponse brute de Claude: [début de la réponse]
🔍 JSON extrait: [début du JSON]
✅ [nombre] tweets parsés avec succès
✅ Validation des tweets terminée
```

### 9. Problèmes de format de réponse

Si Claude ne retourne pas un JSON valide, le problème peut venir de :

1. **Prompt trop complexe** : Simplifiez le prompt
2. **Limite de tokens** : Augmentez `max_tokens`
3. **Modèle inapproprié** : Vérifiez que le modèle supporte la génération de JSON

## 🚨 Si le problème persiste

1. **Vérifiez les logs** dans la console du navigateur (F12)
2. **Vérifiez les logs** du serveur Next.js
3. **Testez l'API Anthropic** directement avec un outil comme Postman
4. **Vérifiez votre quota** Anthropic
5. **Contactez le support** si nécessaire

## 📞 Support

- **Anthropic Documentation :** [docs.anthropic.com](https://docs.anthropic.com/)
- **Anthropic Console :** [console.anthropic.com](https://console.anthropic.com/)
- **GitHub Issues :** Créez une issue avec les logs d'erreur complets

## 🔍 Vérification rapide

```bash
# 1. Vérifiez la variable d'environnement
echo $ANTHROPIC_API_KEY

# 2. Testez la configuration
curl http://localhost:3000/api/test-anthropic

# 3. Vérifiez les logs du serveur
# Regardez dans votre terminal npm run dev
```
