# Diagnostic du Problème de Planification de Tweets

## Erreur Observée
```
1YYYLJcg87-OWbJcxuLNDWT25w47zGYx2tDaHluWpyD8k2VBIA
```

## Analyse du Problème

Cette erreur ressemble à un ID malformé ou une erreur de parsing. Basé sur l'analyse du code, voici les causes possibles :

### 1. Problème de Structure de Base de Données
- **Type d'énumération manquant** : La table `scheduled_tweets` utilise un type d'énumération `scheduled_tweet_status` qui pourrait ne pas être créé correctement
- **Colonnes manquantes** : Les colonnes `episode_id` et `metadata` pourraient ne pas exister
- **Contraintes cassées** : Les contraintes de clés étrangères pourraient être invalides

### 2. Problème de Validation des Données
- **Données d'entrée invalides** : Le contenu, la date ou l'ID de l'épisode pourraient être mal formatés
- **Longueur du contenu** : Le tweet pourrait dépasser 280 caractères
- **Format de date invalide** : La date de planification pourrait être dans un format incorrect

### 3. Problème d'Authentification/RLS
- **Politiques RLS manquantes** : Les politiques de sécurité pourraient bloquer l'insertion
- **Utilisateur non authentifié** : L'utilisateur pourrait ne pas être correctement identifié

## Solutions Proposées

### Solution 1 : Vérifier et Corriger la Structure de la Base de Données

1. **Exécuter la migration corrigée** :
   ```sql
   -- Utiliser le fichier supabase-scheduled-tweets-migration-fixed.sql
   -- Exécuter dans l'éditeur SQL de Supabase
   ```

2. **Vérifier la structure actuelle** :
   ```sql
   SELECT 
       column_name,
       data_type,
       is_nullable,
       column_default
   FROM information_schema.columns 
   WHERE table_name = 'scheduled_tweets' 
   AND table_schema = 'public'
   ORDER BY ordinal_position;
   ```

3. **Vérifier les types d'énumération** :
   ```sql
   SELECT enumlabel 
   FROM pg_enum 
   WHERE enumtypid = (
       SELECT oid 
       FROM pg_type 
       WHERE typname = 'scheduled_tweet_status'
   );
   ```

### Solution 2 : Tester l'API Pas à Pas

1. **Démarrer le serveur Next.js** :
   ```bash
   npm run dev
   ```

2. **Exécuter le script de test** :
   ```bash
   node scripts/test-schedule-tweet-simple.js
   ```

3. **Vérifier les logs du serveur** pour identifier l'erreur exacte

### Solution 3 : Vérifier les Variables d'Environnement

1. **Créer le fichier `.env`** avec les bonnes valeurs :
   ```bash
   cp env.example .env
   # Éditer .env avec vos vraies valeurs Supabase
   ```

2. **Variables requises** :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Solution 4 : Debugging Avancé

1. **Ajouter des logs détaillés** dans l'API (déjà fait)
2. **Vérifier la console du navigateur** pour les erreurs côté client
3. **Vérifier les logs Supabase** pour les erreurs de base de données

## Étapes de Diagnostic Recommandées

### Étape 1 : Vérification Rapide
- [ ] Vérifier que le serveur Next.js est démarré
- [ ] Vérifier que les variables d'environnement sont configurées
- [ ] Tester l'API avec le script simple

### Étape 2 : Vérification de la Base de Données
- [ ] Exécuter la migration corrigée
- [ ] Vérifier la structure de la table
- [ ] Tester l'insertion manuelle d'un tweet

### Étape 3 : Test Complet
- [ ] Tester l'API avec des données valides
- [ ] Vérifier que le tweet est bien inséré
- [ ] Tester la récupération des tweets planifiés

## Messages d'Erreur Courants et Solutions

| Code Erreur | Message | Solution |
|-------------|---------|----------|
| `23505` | Violation de contrainte unique | Vérifier les doublons |
| `23503` | Violation de clé étrangère | Vérifier que l'épisode et l'utilisateur existent |
| `22P02` | Format de données invalide | Vérifier le format des données d'entrée |
| `42703` | Colonne inexistante | Exécuter la migration pour ajouter les colonnes manquantes |

## Fichiers de Correction

- `supabase-scheduled-tweets-migration-fixed.sql` : Migration corrigée
- `app/api/schedule-tweet/route.ts` : API avec gestion d'erreurs améliorée
- `scripts/test-schedule-tweet-simple.js` : Script de test simple

## Contact et Support

Si le problème persiste après avoir suivi ce guide :
1. Vérifier les logs du serveur Next.js
2. Vérifier les logs Supabase
3. Partager les messages d'erreur complets
4. Vérifier la structure actuelle de la base de données
