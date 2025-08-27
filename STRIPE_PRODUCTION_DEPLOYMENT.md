# 🚀 Guide de Déploiement Stripe en Production

Ce guide vous explique comment configurer Stripe pour que les paiements fonctionnent sur votre déploiement Vercel.

## 📋 Prérequis

- ✅ Compte Stripe configuré et testé en local
- ✅ Projet déployé sur Vercel
- ✅ Variables d'environnement configurées

## 🔧 Configuration Vercel

### 1. Variables d'environnement

Dans votre dashboard Vercel, allez dans **Settings** → **Environment Variables** et ajoutez :

```bash
# Clés Stripe (Production)
STRIPE_SECRET_KEY=sk_live_... (votre clé secrète de production)
STRIPE_PUBLISHABLE_KEY=pk_live_... (votre clé publique de production)
STRIPE_WEBHOOK_SECRET=whsec_... (secret du webhook de production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (même clé publique)

# Autres variables nécessaires
STRIPE_PRICE_ID=price_... (ID de votre plan Pro)
NEXT_PUBLIC_APP_URL=https://votre-domaine.vercel.app
```

### 2. Redéploiement

Après avoir ajouté les variables, redéployez votre application :
- Vercel redéploiera automatiquement
- Ou cliquez sur **Redeploy** dans votre dashboard

## 🌐 Configuration Webhook Stripe

### 1. Créer le webhook de production

Dans [dashboard.stripe.com](https://dashboard.stripe.com) :

1. **Developers** → **Webhooks**
2. **Add endpoint**
3. **Endpoint URL** : `https://votre-domaine.vercel.app/api/stripe/webhook`
4. **Events to send** :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 2. Récupérer le secret du webhook

Après création, copiez le **Signing secret** (commence par `whsec_`) et ajoutez-le à vos variables Vercel.

## 🔒 Sécurité et Bonnes Pratiques

### 1. Clés de production vs test

- **Développement** : Utilisez `sk_test_` et `pk_test_`
- **Production** : Utilisez `sk_live_` et `pk_live_`
- **Ne jamais** commiter les clés de production dans Git

### 2. Webhooks

- Utilisez des URLs HTTPS uniquement
- Vérifiez la signature des webhooks
- Testez avec Stripe CLI en local avant production

### 3. Gestion des erreurs

- Loggez toutes les erreurs de paiement
- Implémentez des retry automatiques
- Notifiez l'utilisateur en cas d'échec

## 🧪 Tests en Production

### 1. Test avec des cartes de test

Utilisez les cartes de test Stripe même en production :
- **Succès** : `4242 4242 4242 4242`
- **Échec** : `4000 0000 0000 0002`
- **3D Secure** : `4000 0025 0000 3155`

### 2. Vérification des webhooks

1. Allez dans **Webhooks** → **Logs**
2. Vérifiez que les événements arrivent
3. Vérifiez les codes de statut HTTP

## 📱 Configuration des URLs de retour

### 1. URLs de succès/échec

Dans votre code, assurez-vous que les URLs pointent vers votre domaine de production :

```typescript
// Dans votre API Stripe
const session = await stripe.checkout.sessions.create({
  // ... autres options
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true`,
  cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?canceled=true`,
});
```

### 2. URLs du Customer Portal

```typescript
const session = await stripe.billingPortal.sessions.create({
  customer: customerId,
  return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
});
```

## 🚨 Dépannage

### Problèmes courants

1. **Webhook non reçu** :
   - Vérifiez l'URL du webhook
   - Vérifiez que l'endpoint est accessible
   - Testez avec Stripe CLI

2. **Erreurs de clés** :
   - Vérifiez que vous utilisez les bonnes clés (test vs production)
   - Vérifiez les variables d'environnement Vercel

3. **Paiements qui échouent** :
   - Vérifiez les logs Stripe
   - Vérifiez les logs Vercel
   - Testez avec des cartes de test

### Logs et monitoring

- **Stripe Dashboard** : Logs des webhooks et transactions
- **Vercel Dashboard** : Logs des fonctions serverless
- **Supabase** : Logs des opérations de base de données

## ✅ Checklist de déploiement

- [ ] Variables d'environnement configurées sur Vercel
- [ ] Webhook Stripe créé avec la bonne URL
- [ ] Secret du webhook ajouté aux variables Vercel
- [ ] Application redéployée
- [ ] Test de paiement réussi avec une carte de test
- [ ] Vérification des webhooks dans Stripe
- [ ] Test du Customer Portal
- [ ] Test de la gestion des abonnements

## 🔗 Ressources utiles

- [Documentation Stripe](https://stripe.com/docs)
- [Guide Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)

---

**Note** : N'oubliez pas de tester complètement en production avant de lancer votre application aux utilisateurs réels !
