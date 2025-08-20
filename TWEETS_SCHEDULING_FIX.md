# 🔧 Résolution de l'Erreur "Tweets Programmés"

## 🚨 Problème Identifié

L'erreur "erreur lors de la récupération des tweets" dans la section "Tweets Programmés" est causée par une incompatibilité entre la structure de la base de données et le code de l'application.

**Cause :** La table `scheduled_tweets` n'a pas les colonnes `episode_id` et `metadata` nécessaires pour la nouvelle fonctionnalité de planification par épisode.

## ✅ Solution Rapide

### Option 1 : Migration Automatique (Recommandée)

Exécutez la commande suivante dans votre terminal :

```bash
npm run migrate:tweets
```

Cette commande va :
- Ajouter les colonnes manquantes à la table `scheduled_tweets`
- Mettre à jour les types de données
- Créer les index nécessaires
- Tester la nouvelle structure

### Option 2 : Migration Manuelle

Si la migration automatique échoue, vous pouvez exécuter le script SQL directement dans Supabase :

1. Allez dans votre dashboard Supabase
2. Ouvrez l'éditeur SQL
3. Copiez et exécutez le contenu de `supabase-scheduled-tweets-migration.sql`

## 🔍 Vérification

Après la migration, vérifiez que :

1. **L'erreur a disparu** de la section "Tweets Programmés"
2. **La planification fonctionne** dans "Publication Réseaux Sociaux"
3. **Les tweets planifiés s'affichent** correctement

## 🧪 Test de la Fonctionnalité

Testez la fonctionnalité complète avec :

```bash
npm run test:scheduling
```

Ce script vérifiera :
- La planification de tweets
- La récupération des tweets planifiés
- L'annulation des tweets
- La gestion des statuts

## 🚀 Fonctionnalités Disponibles Après Migration

- ✅ **Génération de tweets** avec IA Claude
- ✅ **Édition des tweets** (contenu et hashtags)
- ✅ **Planification des tweets** (date et heure)
- ✅ **Suivi des statuts** (en attente, publié, annulé, échec)
- ✅ **Gestion des tweets planifiés** par épisode

## 🔧 Dépannage

### Si la migration échoue

1. **Vérifiez les permissions** : Assurez-vous d'avoir `SUPABASE_SERVICE_ROLE_KEY`
2. **Vérifiez la connexion** : Testez la connexion à Supabase
3. **Vérifiez les logs** : Regardez les erreurs dans la console

### Si l'erreur persiste

1. **Redémarrez l'application** : `npm run dev`
2. **Vérifiez la base** : Contrôlez la structure de la table
3. **Contactez le support** : Si le problème persiste

## 📋 Structure de la Table Après Migration

```sql
scheduled_tweets {
  id: UUID (primary key)
  user_id: UUID (foreign key)
  content: TEXT
  scheduled_date: DATE
  scheduled_time: TIME
  status: ENUM ('pending', 'published', 'cancelled', 'failed')
  published_at: TIMESTAMP (nullable)
  episode_id: UUID (foreign key, nullable) -- NOUVELLE COLONNE
  metadata: JSONB (nullable) -- NOUVELLE COLONNE
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

## 🎯 Prochaines Étapes

Une fois la migration réussie :

1. **Testez la génération** de tweets
2. **Planifiez quelques tweets** pour vérifier le fonctionnement
3. **Explorez les nouvelles fonctionnalités** d'édition et de planification

---

**Note :** Cette migration est non-destructive et n'affecte pas les données existantes. Elle ajoute simplement les nouvelles fonctionnalités nécessaires.
