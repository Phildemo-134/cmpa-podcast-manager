# Configuration du Cron Job - Publication Automatique des Tweets

## Vue d'ensemble

Ce guide explique comment configurer et utiliser le cron job pour la publication automatique des tweets programmés. Le cron job peut être exécuté de plusieurs façons selon vos besoins.

## Configuration de Base

### 1. Variables d'Environnement

Ajoutez ces variables dans votre fichier `.env.local` :

```bash
# Clé secrète pour sécuriser l'API cron job
CRON_SECRET_KEY=votre_clé_secrète_très_longue_et_complexe

# URL de votre application (pour GitHub Actions)
NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app

# Autres variables Supabase et Twitter déjà configurées
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 2. Génération d'une Clé Secrète

Générez une clé secrète forte :

```bash
# Option 1: Avec Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Avec OpenSSL
openssl rand -hex 32

# Option 3: En ligne
# https://generate-secret.vercel.app/32
```

## Méthodes d'Exécution

### 1. Exécution Manuelle

```bash
# Via npm script
npm run cron:run

# Ou directement
node scripts/run-cron-job.js
```

**Avantages :**
- Test facile
- Déclenchement à la demande
- Debug simple

**Cas d'usage :**
- Tests de développement
- Publication ponctuelle
- Vérification du bon fonctionnement

### 2. GitHub Actions (Recommandé)

Le fichier `.github/workflows/publish-scheduled-tweets.yml` est déjà configuré.

#### Configuration des Secrets GitHub

1. Allez dans votre repo GitHub → Settings → Secrets and variables → Actions
2. Ajoutez ces secrets :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
   - `CRON_SECRET_KEY`

#### Planification

Le workflow s'exécute automatiquement :
- **Toutes les 5 minutes** : `*/5 * * * *`
- **Manuellement** : Via l'onglet Actions de GitHub

#### Avantages
- Gratuit pour les repos publics
- 2000 minutes/mois gratuites pour les repos privés
- Interface de monitoring intégrée
- Logs détaillés

### 3. AWS Lambda + EventBridge

#### Configuration Lambda

```javascript
// index.js
const https = require('https');

exports.handler = async (event) => {
  const data = JSON.stringify({
    // Données si nécessaire
  });
  
  const options = {
    hostname: 'votre-app.vercel.app',
    port: 443,
    path: '/api/cron/publish-scheduled-tweets',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.CRON_SECRET_KEY}`
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
};
```

#### Configuration EventBridge

```bash
# Créer une règle EventBridge
aws events put-rule \
  --name "PublishScheduledTweets" \
  --schedule-expression "rate(5 minutes)" \
  --state ENABLED

# Associer la règle à la fonction Lambda
aws events put-targets \
  --rule "PublishScheduledTweets" \
  --targets "Id"="1","Arn"="arn:aws:lambda:region:account:function:function-name"
```

### 4. Google Cloud Functions + Cloud Scheduler

#### Configuration Cloud Function

```javascript
// index.js
const fetch = require('node-fetch');

exports.publishScheduledTweets = async (req, res) => {
  try {
    const response = await fetch(
      `${process.env.APP_URL}/api/cron/publish-scheduled-tweets`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CRON_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

#### Configuration Cloud Scheduler

```bash
# Créer un job Cloud Scheduler
gcloud scheduler jobs create http publish-scheduled-tweets \
  --schedule="*/5 * * * *" \
  --uri="https://region-project.cloudfunctions.net/publishScheduledTweets" \
  --http-method=POST \
  --headers="Content-Type=application/json"
```

### 5. Serveur Dédié avec Crontab

```bash
# Éditer le crontab
crontab -e

# Ajouter cette ligne pour toutes les 5 minutes
*/5 * * * * curl -X POST \
  -H "Authorization: Bearer votre_clé_secrète" \
  -H "Content-Type: application/json" \
  "https://votre-app.vercel.app/api/cron/publish-scheduled-tweets"
```

## Monitoring et Logs

### 1. Logs de l'API

Le cron job génère des logs détaillés :

```
⏰ Démarrage du cron job de publication des tweets
📋 2 tweet(s) à publier
🚀 Publication du tweet ID: 123e4567-e89b-12d3-a456-426614174000
📝 Contenu: Mon tweet programmé
📅 Planifié pour: 31/12/2024 à 12:00:00
✅ Tweet publié avec succès
🎉 Traitement terminé: 1 publié(s), 0 échoué(s)
```

### 2. Monitoring GitHub Actions

- Onglet Actions de votre repo GitHub
- Logs détaillés de chaque exécution
- Historique des exécutions
- Statut de santé du workflow

### 3. Alertes et Notifications

Configurez des alertes pour :
- Échecs répétés du cron job
- Tweets qui n'ont pas pu être publiés
- Problèmes de connexion à l'API Twitter

## Sécurité

### 1. Authentification

Le cron job vérifie le header `Authorization: Bearer <CRON_SECRET_KEY>`

### 2. Rate Limiting

Considérez l'ajout de rate limiting si nécessaire :

```typescript
// Dans votre API route
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite à 100 requêtes par fenêtre
})

// Appliquer aux routes cron
app.use('/api/cron/*', limiter)
```

### 3. Validation des Données

Le cron job valide :
- Authentification
- Format des données
- Statut des tweets

## Tests

### 1. Test Local

```bash
# Démarrer l'application
npm run dev

# Dans un autre terminal, exécuter le cron job
npm run cron:run
```

### 2. Test avec Tweets de Test

```bash
# Créer des tweets de test
npm run create:test-tweets

# Exécuter le cron job
npm run cron:run

# Nettoyer les tweets de test
npm run cleanup:test-tweets
```

### 3. Test de l'API

```bash
# Test direct de l'API
curl -X POST \
  -H "Authorization: Bearer votre_clé_secrète" \
  -H "Content-Type: application/json" \
  "http://localhost:3000/api/cron/publish-scheduled-tweets"
```

## Dépannage

### Problèmes Courants

1. **Erreur 401 Unauthorized**
   - Vérifiez `CRON_SECRET_KEY` dans `.env.local`
   - Vérifiez le header `Authorization` dans la requête

2. **Erreur de connexion à l'API**
   - Vérifiez que l'application est démarrée
   - Vérifiez `NEXT_PUBLIC_APP_URL`

3. **Tweets non publiés**
   - Vérifiez la connexion Twitter OAuth
   - Vérifiez les logs de l'API Twitter

4. **Cron job ne s'exécute pas**
   - Vérifiez la planification (cron expression)
   - Vérifiez les permissions GitHub Actions
   - Vérifiez les logs du service

### Logs de Debug

Activez les logs détaillés en ajoutant dans votre API :

```typescript
console.log('🔍 Debug - Headers reçus:', Object.fromEntries(request.headers.entries()))
console.log('🔍 Debug - Body reçu:', await request.text())
```

## Conclusion

Le cron job est maintenant configuré pour fonctionner avec :
- ✅ Exécution manuelle
- ✅ GitHub Actions (exemple fourni)
- ✅ Autres services cloud (guides fournis)
- ✅ Serveur dédié

Choisissez la méthode qui correspond le mieux à votre infrastructure et vos besoins !
