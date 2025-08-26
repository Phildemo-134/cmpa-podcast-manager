# Configuration Stripe pour CMPA Podcast Manager

Ce guide vous explique comment configurer Stripe pour l'intégration des paiements et abonnements dans votre application.

## 🚀 Étapes de Configuration

### 1. Créer un Compte Stripe

1. Allez sur [stripe.com](https://stripe.com) et créez un compte
2. Choisissez votre pays et complétez la vérification
3. Notez vos clés API dans le tableau de bord

### 2. Configurer le Produit et Prix

1. Dans le tableau de bord Stripe, allez dans **Produits**
2. Cliquez sur **Ajouter un produit**
3. Configurez le produit :
   - **Nom** : CMPA Podcast Manager Pro
   - **Description** : Plan Pro avec transcription IA et génération de contenu
   - **Prix** : $49.00 USD
   - **Facturation** : Mensuelle (recurring)
   - **Période d'essai** : 7 jours

4. Notez l'ID du prix (commence par `price_`)

### 3. Configurer les Variables d'Environnement

Ajoutez ces variables dans votre fichier `.env.local` :

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_PRICE_ID=price_your_pro_plan_price_id
```

### 4. Configurer les Webhooks

1. Dans le tableau de bord Stripe, allez dans **Développeurs > Webhooks**
2. Cliquez sur **Ajouter un endpoint**
3. URL : `https://your-domain.vercel.app/api/stripe/webhook`
4. Événements à écouter :
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Notez le secret du webhook (commence par `whsec_`)

### 5. Tester l'Intégration

1. Utilisez les cartes de test Stripe :
   - **Succès** : 4242 4242 4242 4242
   - **Échec** : 4000 0000 0000 0002
   - **Date d'expiration** : N'importe quelle date future
   - **CVC** : N'importe quels 3 chiffres

2. Testez le parcours complet :
   - Création de compte
   - Redirection vers Stripe
   - Paiement avec carte de test
   - Retour sur l'application
   - Vérification du statut d'abonnement

## 🔧 Configuration de Production

### 1. Passer en Mode Production

1. Dans le tableau de bord Stripe, basculez vers **Production**
2. Mettez à jour vos variables d'environnement avec les clés de production
3. Mettez à jour l'URL du webhook avec votre domaine de production

### 2. Vérification de l'Identité

1. Complétez la vérification de votre identité dans Stripe
2. Ajoutez vos informations bancaires pour recevoir les paiements
3. Configurez vos préférences de facturation

## 📱 Utilisation dans l'Application

### Composants Disponibles

- `Paywall` : Affichage des plans d'abonnement
- `SubscriptionManager` : Gestion de l'abonnement existant
- `PremiumGuard` : Protection des fonctionnalités premium
- `SubscriptionBadge` : Affichage du statut d'abonnement
- `SubscriptionNotification` : Notifications après paiement

### Hook Personnalisé

```typescript
import { useSubscription } from '@/hooks/use-subscription';

function MyComponent() {
  const { subscription, isLoading, error } = useSubscription();
  
  if (subscription?.isActive) {
    // Afficher les fonctionnalités premium
  }
}
```

### Protection des Routes

```typescript
import { PremiumGuard } from '@/components/subscription';

function PremiumPage() {
  return (
    <PremiumGuard>
      <div>Contenu premium</div>
    </PremiumGuard>
  );
}
```

## 🚨 Dépannage

### Problèmes Courants

1. **Erreur de signature webhook** : Vérifiez le secret du webhook
2. **Redirection après paiement** : Vérifiez les URLs de succès/échec
3. **Statut d'abonnement non mis à jour** : Vérifiez les webhooks Stripe
4. **Erreur de clé API** : Vérifiez vos variables d'environnement

### Logs et Debug

1. Vérifiez les logs de votre application Vercel
2. Utilisez le mode test Stripe pour les tests
3. Vérifiez les événements webhook dans le tableau de bord Stripe

## 📚 Ressources

- [Documentation Stripe](https://stripe.com/docs)
- [API Stripe Node.js](https://stripe.com/docs/api)
- [Webhooks Stripe](https://stripe.com/docs/webhooks)
- [Checkout Stripe](https://stripe.com/docs/checkout)

## 🔒 Sécurité

- Ne partagez jamais vos clés secrètes
- Utilisez HTTPS en production
- Validez les signatures des webhooks
- Testez en mode test avant la production
- Surveillez les tentatives de fraude

---

**Note** : Ce guide couvre la configuration de base. Pour des fonctionnalités avancées (gestion des remboursements, factures, etc.), consultez la documentation officielle de Stripe.
