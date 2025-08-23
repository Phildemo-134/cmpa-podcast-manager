# Configuration des Cron Jobs sur Vercel

## 🚀 Déploiement et Configuration

### 1. Fichier `vercel.json`
Le fichier `vercel.json` a été créé avec la configuration suivante :
```json
{
  "crons": [
    {
      "path": "/api/cron/publish-scheduled-tweets",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Explication de la planification :**
- `*/5 * * * *` = Toutes les 5 minutes
- Format cron : `minute heure jour mois jour_semaine`

**Autres options de planification populaires :**
- `0 */1 * * *` = Toutes les heures
- `0 9 * * *` = Tous les jours à 9h00
- `0 9 * * 1-5` = Lundi à vendredi à 9h00

### 2. Variables d'Environnement Vercel

Dans ton dashboard Vercel, va dans **Settings > Environment Variables** et ajoute :

#### Variables Requises :
```
CRON_SECRET_KEY=ton_secret_tres_long_et_complexe
NEXT_PUBLIC_APP_URL=https://ton-app.vercel.app
```

#### Variables Supabase (si pas déjà configurées) :
```
NEXT_PUBLIC_SUPABASE_URL=ton_url_supabase
SUPABASE_SERVICE_ROLE_KEY=ta_cle_service_role
```

### 3. Redéploiement

Après avoir ajouté le fichier `vercel.json` et configuré les variables d'environnement :

```bash
git add vercel.json
git commit -m "Add Vercel cron job configuration"
git push
```

Vercel redéploiera automatiquement et activera les cron jobs.

## 🔍 Vérification et Monitoring

### 1. Vérifier l'Activation
- Va dans ton dashboard Vercel
- Section **Functions** > **Cron Jobs**
- Tu devrais voir ton cron job listé avec le statut "Active"

### 2. Logs et Debugging
- Les logs des cron jobs apparaissent dans **Functions** > **Cron Jobs** > **View Logs**
- Tu peux aussi tester manuellement en appelant : `GET /api/cron/publish-scheduled-tweets`

### 3. Test Manuel
```bash
curl -X GET https://ton-app.vercel.app/api/cron/publish-scheduled-tweets
```

## ⚠️ Points Importants

### 1. Limitations Vercel
- **Planification minimale :** 1 minute
- **Durée d'exécution :** Maximum 10 secondes (Hobby), 60 secondes (Pro)
- **Fuseau horaire :** UTC par défaut

### 2. Gestion des Erreurs
- Si un cron job échoue, Vercel le relancera automatiquement
- Les erreurs sont loggées dans les logs Vercel
- Considère implémenter un système de retry en cas d'échec

### 3. Sécurité
- Le `CRON_SECRET_KEY` protège ta route contre les appels non autorisés
- Utilise une clé longue et complexe (32+ caractères)
- Ne partage jamais cette clé

## 🛠️ Personnalisation

### Changer la Fréquence
Modifie le fichier `vercel.json` :
```json
{
  "crons": [
    {
      "path": "/api/cron/publish-scheduled-tweets",
      "schedule": "0 */2 * * *"  // Toutes les 2 heures
    }
  ]
}
```

### Ajouter d'Autres Cron Jobs
```json
{
  "crons": [
    {
      "path": "/api/cron/publish-scheduled-tweets",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/cleanup-old-data",
      "schedule": "0 2 * * *"  // Tous les jours à 2h00
    }
  ]
}
```

## 📊 Monitoring et Alertes

### 1. Vercel Analytics
- Active Vercel Analytics pour surveiller les performances
- Surveille les métriques de fonction et d'erreur

### 2. Logs Externes
- Considère envoyer les logs critiques vers un service externe (Sentry, LogRocket)
- Implémente des alertes en cas d'échec répété

### 3. Health Check
Crée une route de health check :
```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() })
}
```

## 🎯 Prochaines Étapes

1. ✅ Configurer les variables d'environnement dans Vercel
2. ✅ Redéployer l'application
3. ✅ Vérifier l'activation des cron jobs
4. ✅ Tester manuellement la route
5. ✅ Surveiller les logs et performances

## 🆘 Dépannage

### Cron Job ne s'Active pas
- Vérifie que `vercel.json` est bien commité et déployé
- Vérifie les variables d'environnement
- Regarde les logs Vercel pour les erreurs

### Erreurs d'Exécution
- Vérifie les logs de la fonction
- Teste manuellement la route
- Vérifie la connectivité Supabase et Twitter

### Performance
- Optimise le code pour respecter les limites de temps
- Considère la mise en cache pour les données fréquemment utilisées
