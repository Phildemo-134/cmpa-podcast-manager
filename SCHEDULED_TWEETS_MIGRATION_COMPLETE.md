# Migration des Tweets Programmés - Terminée ✅

## Résumé des Changements

La migration des champs `scheduled_date` et `scheduled_time` vers `scheduled_at` a été **complètement terminée**. Tous les composants, APIs et scripts utilisent maintenant le nouveau champ `scheduled_at` de type `TIMESTAMPTZ`.

## Changements Effectués

### 1. Types de Base de Données ✅
- **Fichier**: `types/database.ts`
- **Statut**: Déjà à jour
- **Champ**: `scheduled_at: string` (TIMESTAMPTZ)

### 2. Composants React ✅
- **Fichier**: `components/episodes/scheduled-tweets.tsx`
- **Statut**: Déjà à jour
- **Utilisation**: `tweet.scheduled_at`

- **Fichier**: `components/episodes/tweet-generator.tsx`
- **Statut**: Déjà à jour
- **Utilisation**: `scheduleDate` + `scheduleTime` → `scheduled_at` via API

### 3. APIs ✅
- **Fichier**: `app/api/schedule-tweet/route.ts`
- **Statut**: Déjà à jour
- **Utilisation**: `scheduled_at` dans la base de données

- **Fichier**: `app/api/schedule-tweet/cancel/route.ts`
- **Statut**: Déjà à jour

- **Fichier**: `app/api/schedule-tweet/delete/route.ts`
- **Statut**: Déjà à jour

### 4. Nouvelle Route Cron ✅
- **Fichier**: `app/api/cron/publish-scheduled-tweets/route.ts`
- **Statut**: Nouvellement créé
- **Fonctionnalité**: Publication automatique des tweets programmés
- **Utilisation**: `scheduled_at` pour la planification

### 5. Scripts de Test et Utilitaires ✅
- **Fichier**: `scripts/tweet-scheduler.js`
- **Changements**: 
  - `scheduled_date` + `scheduled_time` → `scheduled_at`
  - Logique de comparaison mise à jour

- **Fichier**: `scripts/create-test-tweets.js`
- **Changements**:
  - `createTestTweet()`: paramètres mis à jour
  - `generateTestDates()`: retourne `scheduledAt` au lieu de `date` + `time`

- **Fichier**: `scripts/cleanup-test-tweets.js`
- **Changements**: Affichage des dates via `scheduled_at`

- **Fichier**: `scripts/test-tweet-scheduling.js`
- **Changements**: Affichage des dates via `scheduled_at`

- **Fichier**: `scripts/test-schedule-tweet-api.js`
- **Changements**: Affichage des dates via `scheduled_at`

- **Fichier**: `scripts/check-database-structure.js`
- **Changements**: Création de tweets avec `scheduled_at`

- **Fichier**: `scripts/apply-scheduled-tweets-migration.js`
- **Changements**: Création de tweets avec `scheduled_at`

### 6. Route Cron Job ✅
- **Fichier**: `app/api/cron/publish-scheduled-tweets/route.ts`
- **Statut**: Nouvellement créé
- **Fonctionnalité**: API pour publication automatique des tweets programmés

## Structure Finale

### Table `scheduled_tweets`
```sql
CREATE TABLE scheduled_tweets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,  -- ✅ Nouveau champ unifié
  status scheduled_tweet_status DEFAULT 'pending',
  user_id UUID NOT NULL REFERENCES users(id),
  episode_id UUID REFERENCES episodes(id),
  metadata JSONB,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Avantages de la Migration

1. **Simplicité**: Un seul champ au lieu de deux
2. **Précision**: Support des fuseaux horaires avec TIMESTAMPTZ
3. **Performance**: Index unique sur `scheduled_at`
4. **Cohérence**: Format ISO 8601 standard
5. **Automatisation**: Cron job Vercel intégré

## Utilisation

### Planification d'un Tweet
```typescript
const tweet = await supabase
  .from('scheduled_tweets')
  .insert({
    content: "Mon tweet programmé",
    scheduled_at: "2024-12-31T12:00:00Z", // ISO 8601
    user_id: userId,
    episode_id: episodeId
  })
```

### Récupération des Tweets à Publier
```typescript
const { data: tweets } = await supabase
  .from('scheduled_tweets')
  .select('*')
  .eq('status', 'pending')
  .lte('scheduled_at', new Date().toISOString())
  .order('scheduled_at', { ascending: true })
```

### Affichage de la Date
```typescript
const scheduledDate = new Date(tweet.scheduled_at)
console.log(scheduledDate.toLocaleString('fr-FR'))
```

## Cron Job

Le cron job peut être exécuté de plusieurs façons :

### 1. **Exécution Manuelle**
```bash
npm run cron:run
```

### 2. **GitHub Actions** (Exemple fourni)
- Workflow automatisé toutes les 5 minutes
- Fichier : `.github/workflows/publish-scheduled-tweets.yml`
- Exécution manuelle possible via l'interface GitHub

### 3. **Autres Services**
- **AWS Lambda** : Fonction serverless avec EventBridge
- **Google Cloud Functions** : Fonction cloud avec Cloud Scheduler
- **Azure Functions** : Fonction avec Timer Trigger
- **Cron jobs personnalisés** : Serveur dédié avec crontab

### 4. **Fonctionnalités du Cron Job**
1. Récupère les tweets programmés pour maintenant
2. Les publie sur Twitter via l'API
3. Met à jour leur statut en base de données
4. Gère les erreurs et marque les tweets échoués

## Tests et Exécution

### Tests de la Migration
```bash
# Test complet de la migration
npm run test:migration

# Tests individuels
npm run test:tweets
npm run test:scheduling
npm run test:cron
```

### Exécution du Cron Job
```bash
# Exécution manuelle
npm run cron:run

# Ou directement
node scripts/run-cron-job.js
```

## Conclusion

✅ **Migration 100% terminée**
✅ **Tous les composants mis à jour**
✅ **Nouvelle route cron créée**
✅ **Scripts de test mis à jour**
✅ **Route cron job créée (sans dépendance Vercel)**

La base de données utilise maintenant exclusivement le champ `scheduled_at` de type `TIMESTAMPTZ`, offrant une gestion plus simple et plus précise des tweets programmés.

## Documentation Complémentaire

- **Guide de configuration du cron job** : [CRON_JOB_SETUP.md](./CRON_JOB_SETUP.md)
- **Exemple GitHub Actions** : `.github/workflows/publish-scheduled-tweets.yml`
- **Script d'exécution manuelle** : `scripts/run-cron-job.js`
