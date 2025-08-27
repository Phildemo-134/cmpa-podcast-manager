# Correction du problème de contrainte subscription_status

## Problème identifié

L'erreur suivante se produisait dans les webhooks Stripe :
```
Error updating user subscription status: {
  code: '23514',
  details: 'Failing row contains (..., trialing, ...)',
  message: 'new row for relation "users" violates check constraint "users_subscription_status_check"'
}
```

## Cause du problème

La contrainte de vérification `users_subscription_status_check` sur la table `users` n'acceptait que les valeurs `('free', 'pro', 'enterprise')`, mais le code tentait d'utiliser des statuts Stripe comme `'trialing'`, `'past_due'`, etc.

## Solution implémentée

### 1. Mise à jour des types TypeScript

**Avant :**
```typescript
subscription_status: 'active' | 'inactive' | 'cancelled';
```

**Après :**
```typescript
subscription_status: 'free' | 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired';
```

### 2. Mise à jour de la contrainte de base de données

**Nouvelle contrainte :**
```sql
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
```

### 3. Mise à jour du webhook Stripe

Le webhook utilise maintenant directement les statuts Stripe au lieu de les mapper vers des valeurs personnalisées :

- `'trialing'` → `'trialing'` (au lieu de `'active'`)
- `'past_due'` → `'past_due'` (au lieu de `'active'`)
- `'canceled'` → `'canceled'` (au lieu de `'cancelled'`)
- `'unpaid'` → `'unpaid'` (au lieu de `'inactive'`)
- `'incomplete'` → `'incomplete'` (au lieu de `'inactive'`)
- `'incomplete_expired'` → `'incomplete_expired'` (au lieu de `'incomplete'`)

## Fichiers modifiés

1. `types/index.ts` - Mise à jour de l'interface User
2. `app/api/stripe/webhook/route.ts` - Utilisation directe des statuts Stripe
3. `supabase-subscription-status-constraint-update.sql` - Script SQL de migration
4. `scripts/update-subscription-status-constraint.js` - Script Node.js de migration

## Application de la correction

### Option 1 : Via le script Node.js
```bash
node scripts/update-subscription-status-constraint.js
```

### Option 2 : Via SQL direct
Exécuter le contenu de `supabase-subscription-status-constraint-update.sql` dans votre base de données Supabase.

## Vérification

Après application, les webhooks Stripe devraient fonctionner correctement avec tous les statuts possibles :
- ✅ `free` - Utilisateur sans abonnement
- ✅ `active` - Abonnement actif
- ✅ `trialing` - En période d'essai
- ✅ `past_due` - Paiement en retard
- ✅ `canceled` - Abonnement annulé
- ✅ `unpaid` - Paiement échoué
- ✅ `incomplete` - Abonnement incomplet
- ✅ `incomplete_expired` - Abonnement incomplet expiré

## Notes importantes

- La valeur `'cancelled'` a été remplacée par `'canceled'` pour la cohérence avec Stripe
- Tous les utilisateurs existants avec des statuts invalides seront automatiquement mis à jour vers `'free'`
- La contrainte est maintenant alignée avec les statuts réels de Stripe
