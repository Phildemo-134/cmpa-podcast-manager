# ✅ Checklist Déploiement Stripe en Production

## 🚀 Étapes à suivre dans l'ordre

### 1. Configuration Vercel (5 min)
- [ ] Aller sur [vercel.com/dashboard](https://vercel.com/dashboard)
- [ ] Sélectionner votre projet `cmpa-podcast-manager`
- [ ] **Settings** → **Environment Variables**
- [ ] Ajouter ces variables :

```bash
STRIPE_SECRET_KEY=sk_live_... (clé de production)
STRIPE_PUBLISHABLE_KEY=pk_live_... (clé de production)
STRIPE_WEBHOOK_SECRET=whsec_... (à récupérer après étape 2)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (même clé)
STRIPE_PRICE_ID=price_... (ID de votre plan Pro)
NEXT_PUBLIC_APP_URL=https://votre-domaine.vercel.app
```

### 2. Configuration Webhook Stripe (5 min)
- [ ] Aller sur [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
- [ ] **Add endpoint**
- [ ] **Endpoint URL** : `https://votre-domaine.vercel.app/api/stripe/webhook`
- [ ] **Events** : Sélectionner tous les événements de subscription
- [ ] **Add endpoint**
- [ ] Copier le **Signing secret** (commence par `whsec_`)
- [ ] Retourner sur Vercel et ajouter ce secret à `STRIPE_WEBHOOK_SECRET`

### 3. Redéploiement (2 min)
- [ ] Vercel redéploie automatiquement
- [ ] Ou cliquer sur **Redeploy** dans le dashboard

### 4. Test (5 min)
- [ ] Aller sur votre app en production
- [ ] Tester l'inscription et la souscription
- [ ] Utiliser une carte de test : `4242 4242 4242 4242`
- [ ] Vérifier que l'abonnement est créé dans Stripe

## 🔑 Clés importantes

- **Test** : Commence par `sk_test_` et `pk_test_`
- **Production** : Commence par `sk_live_` et `pk_live_`
- **Webhook** : Doit pointer vers votre domaine Vercel
- **URLs** : Utiliser `NEXT_PUBLIC_APP_URL` dans le code

## 🚨 En cas de problème

1. **Vérifier les logs Vercel** : Dashboard → Functions
2. **Vérifier les logs Stripe** : Dashboard → Webhooks → Logs
3. **Tester avec le script** : `npm run test:stripe:production`
4. **Vérifier les variables** : Dashboard Vercel → Environment Variables

## 📱 Test rapide

```bash
# Tester la configuration
npm run test:stripe:production

# Ou manuellement
curl -X GET https://votre-domaine.vercel.app/api/stripe/webhook
# Doit retourner 405 (méthode non autorisée) = ✅
```

---

**Temps total estimé : 15-20 minutes** ⚡
