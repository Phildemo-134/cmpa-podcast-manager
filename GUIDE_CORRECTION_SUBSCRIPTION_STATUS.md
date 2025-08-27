# 🚀 Guide de correction du problème subscription_status

## 🎯 Problème résolu

L'erreur `users_subscription_status_check` qui empêchait les webhooks Stripe de fonctionner avec le statut `'trialing'`.

## ✅ Solution appliquée

### 1. Types TypeScript mis à jour ✅
- `types/index.ts` - Interface User mise à jour
- `app/api/stripe/webhook/route.ts` - Webhook utilise maintenant les statuts Stripe directement

### 2. Contrainte de base de données à mettre à jour ⚠️

**IMPORTANT** : Cette étape doit être faite manuellement dans votre dashboard Supabase.

## 🔧 Étapes à suivre

### Étape 1 : Aller dans votre dashboard Supabase
1. Ouvrez [supabase.com](https://supabase.com)
2. Connectez-vous à votre projet
3. Allez dans **SQL Editor**

### Étape 2 : Exécuter le script SQL
Copiez et collez ce code dans l'éditeur SQL :

```sql
-- Mise à jour de la contrainte de vérification pour subscription_status
-- pour accepter tous les statuts Stripe possibles

-- Supprimer l'ancienne contrainte
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_subscription_status_check;

-- Ajouter la nouvelle contrainte avec tous les statuts possibles
ALTER TABLE users ADD CONSTRAINT users_subscription_status_check 
CHECK (subscription_status IN (
  'free', 
  'active', 
  'trialing', 
  'past_due', 
  'canceled', 
  'unpaid', 
  'incomplete', 
  'incomplete_expired'
));

-- Mettre à jour les utilisateurs existants qui pourraient avoir des statuts invalides
UPDATE users 
SET subscription_status = 'free' 
WHERE subscription_status NOT IN (
  'free', 
  'active', 
  'trialing', 
  'past_due', 
  'canceled', 
  'unpaid', 
  'incomplete', 
  'incomplete_expired'
);
```

### Étape 3 : Cliquer sur "Run"
Exécutez le script SQL en cliquant sur le bouton "Run".

## 🧪 Test de la correction

### 1. Vérifier que la contrainte est mise à jour
```sql
-- Vérifier la nouvelle contrainte
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'users'::regclass 
AND conname = 'users_subscription_status_check';
```

### 2. Tester avec un statut 'trialing'
```sql
-- Tester en mettant à jour un utilisateur avec le statut 'trialing'
UPDATE users 
SET subscription_status = 'trialing' 
WHERE id = 'votre-user-id' 
LIMIT 1;
```

## 🎉 Résultat attendu

Après cette correction :
- ✅ Les webhooks Stripe fonctionneront avec tous les statuts
- ✅ Le statut `'trialing'` sera accepté
- ✅ Plus d'erreur `users_subscription_status_check`
- ✅ Synchronisation complète avec Stripe

## 📋 Statuts acceptés

- `free` - Utilisateur sans abonnement
- `active` - Abonnement actif  
- `trialing` - En période d'essai
- `past_due` - Paiement en retard
- `canceled` - Abonnement annulé
- `unpaid` - Paiement échoué
- `incomplete` - Abonnement incomplet
- `incomplete_expired` - Abonnement incomplet expiré

## 🚨 En cas de problème

Si vous rencontrez des erreurs :
1. Vérifiez que vous êtes connecté au bon projet Supabase
2. Vérifiez que la table `users` existe
3. Vérifiez que vous avez les permissions nécessaires
4. Contactez le support si nécessaire

---

**Note** : Cette correction résout définitivement le problème de contrainte et permet aux webhooks Stripe de fonctionner correctement avec tous les statuts d'abonnement.
