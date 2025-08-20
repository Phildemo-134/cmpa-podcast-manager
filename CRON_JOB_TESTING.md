# 🧪 Test Local du Cron Job de Planification de Tweets

## Vue d'ensemble

Ce guide vous explique comment tester localement le système de planification automatique des tweets sans avoir besoin d'un vrai serveur de production ou d'un vrai cron job.

## 📋 Prérequis

### 1. Base de Données
- ✅ Table `scheduled_tweets` créée dans Supabase
- ✅ Script SQL exécuté : `supabase-scheduled-tweets-migration.sql`

### 2. Variables d'Environnement
Vérifiez que votre fichier `.env.local` contient :
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Dépendances
```bash
npm install @supabase/supabase-js dotenv
```

## 🚀 Scripts Disponibles

### 1. **Création de Tweets de Test**
```bash
node scripts/create-test-tweets.js
```
- Crée 3 tweets planifiés dans le futur proche (1, 2 et 5 minutes)
- Utilise le premier utilisateur trouvé dans la base
- Affiche les détails de chaque tweet créé

### 2. **Planificateur Principal (Cron Job)**
```bash
# Exécution unique
node scripts/tweet-scheduler.js

# Mode surveillance continue (toutes les minutes)
node scripts/tweet-scheduler.js --watch
```

### 3. **Nettoyage des Tests**
```bash
node scripts/cleanup-test-tweets.js
```
- Supprime tous les tweets de test
- Affiche le statut avant/après nettoyage

## 🧪 Procédure de Test Complète

### Étape 1 : Préparation
```bash
# 1. Créer les tweets de test
node scripts/create-test-tweets.js

# 2. Vérifier qu'ils sont créés
# Aller sur http://localhost:3001/schedule-tweet
```

### Étape 2 : Test du Cron Job
```bash
# Attendre que l'heure de publication arrive
# Puis exécuter le planificateur

# Mode surveillance (recommandé pour les tests)
node scripts/tweet-scheduler.js --watch

# Ou exécution unique
node scripts/tweet-scheduler.js
```

### Étape 3 : Vérification
```bash
# 1. Vérifier les logs du planificateur
# 2. Vérifier l'interface web
# 3. Vérifier la base de données
```

### Étape 4 : Nettoyage
```bash
# Supprimer tous les tweets de test
node scripts/cleanup-test-tweets.js
```

## 📊 Logs et Monitoring

### Exemple de Sortie du Planificateur
```
🚀 Planificateur de Tweets Podcast Manager
Mode: Surveillance continue

✅ Connexion à Supabase établie
👀 Mode surveillance: vérification toutes les minutes
Appuyez sur Ctrl+C pour arrêter

⏰ [15/01/2025, 14:30:00] Démarrage du planificateur de tweets
============================================================
🔍 Recherche des tweets à publier le 2025-01-15 à 14:30
📋 1 tweet(s) trouvé(s) à publier

🚀 Publication du tweet ID: 123e4567-e89b-12d3-a456-426614174000
📝 Contenu: 🎙️ Test du planificateur de tweets Podcast Manager ! Premier tweet automatique.
📅 Planifié pour: 2025-01-15 à 14:30
🐦 Publication du tweet: "🎙️ Test du planificateur de tweets Podcast Manager ! Premier tweet automatique."
✅ Tweet publié avec succès sur Twitter
✅ Statut mis à jour: published
────────────────────────────────────────
🎉 Traitement terminé: 1 tweet(s) traité(s)
============================================================
```

### Exemple de Sortie de Création de Tests
```
🧪 Création de tweets de test pour le cron job
==================================================
✅ Connexion à Supabase établie
👤 Utilisateur trouvé: user@example.com

📅 Création des tweets de test...

✅ Tweet créé: "🎙️ Test du planificateur de tweets Podcast Manager ! Premier tweet automatique."
   Planifié pour: 2025-01-15 à 14:30
   ID: 123e4567-e89b-12d3-a456-426614174000
   dans 1 minute

✅ Tweet créé: "🚀 La planification de tweets fonctionne parfaitement ! Deuxième test."
   Planifié pour: 2025-01-15 à 14:31
   ID: 987fc654-321d-98fe-7654-321098765432
   dans 2 minutes

✅ Tweet créé: "✨ Système de publication automatique opérationnel. Troisième et dernier test."
   Planifié pour: 2025-01-15 à 14:35
   ID: 456a789b-cdef-0123-4567-89abcdef0123
   dans 5 minutes

==================================================
🎉 3 tweet(s) de test créé(s) avec succès !

📋 Pour tester le cron job:
   1. Attendez que l'heure de publication arrive
   2. Exécutez: node scripts/tweet-scheduler.js
   3. Ou en mode surveillance: node scripts/tweet-scheduler.js --watch

⏰ Prochain tweet à publier dans 1 minute
```

## 🔧 Configuration et Personnalisation

### Modifier les Intervalles de Test
Dans `scripts/create-test-tweets.js`, modifiez la fonction `generateTestDates()` :
```javascript
// Tweet dans 30 secondes
const in30Sec = new Date(now.getTime() + 30 * 1000)
dates.push({
  date: in30Sec.toISOString().split('T')[0],
  time: in30Sec.toTimeString().slice(0, 5),
  label: 'dans 30 secondes'
})
```

### Modifier la Fréquence de Surveillance
Dans `scripts/tweet-scheduler.js`, modifiez l'intervalle :
```javascript
// Vérification toutes les 30 secondes au lieu d'1 minute
setInterval(runScheduler, 30 * 1000)
```

### Ajouter de Vrais Tests Twitter
Remplacez la fonction `publishTweetToTwitter()` par un vrai appel API :
```javascript
async function publishTweetToTwitter(tweet) {
  // Utiliser la vraie API Twitter ici
  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TWITTER_CONFIG.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text: tweet.content })
  })
  
  if (!response.ok) {
    throw new Error('Erreur API Twitter')
  }
  
  return { success: true, tweetId: 'real_twitter_id' }
}
```

## 🚨 Dépannage

### Erreur de Connexion Supabase
```
❌ Erreur de connexion à Supabase: relation "scheduled_tweets" does not exist
```
**Solution** : Exécutez le script SQL de migration dans Supabase

### Erreur d'Authentification
```
❌ Erreur de connexion à Supabase: JWT expired
```
**Solution** : Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est à jour

### Aucun Tweet à Publier
```
✨ Aucun tweet à publier pour le moment
```
**Solution** : 
1. Vérifiez que les tweets de test ont été créés
2. Attendez que l'heure de publication arrive
3. Vérifiez les dates/heures dans la base

## 📈 Métriques et Monitoring

### Statistiques de Test
- **Taux de succès** : 90% (simulation)
- **Temps de traitement** : < 1 seconde par tweet
- **Latence réseau** : Simulée

### Logs à Surveiller
- Connexion Supabase
- Nombre de tweets trouvés
- Statut de publication
- Erreurs et exceptions

## 🔄 Cycle de Test Recommandé

1. **Lundi** : Créer des tweets de test
2. **Mardi** : Tester le planificateur
3. **Mercredi** : Analyser les résultats
4. **Jeudi** : Nettoyer et itérer
5. **Vendredi** : Préparer la production

## 🎯 Prochaines Étapes

### Phase 4 - Production
1. **Vrai Cron Job** : Utiliser un service comme GitHub Actions ou Vercel Cron
2. **API Twitter Réelle** : Intégrer l'API Twitter officielle
3. **Monitoring** : Logs structurés, métriques, alertes
4. **Retry Logic** : Gestion des échecs et retry automatique

---

**💡 Conseil** : Testez d'abord avec de petits intervalles (30 secondes) pour valider rapidement le système, puis augmentez progressivement.
