# Implémentation du SubscriptionGuard - Redirection automatique des utilisateurs non abonnés

## Vue d'ensemble

Le `SubscriptionGuard` est un composant React qui protège automatiquement les pages et redirige les utilisateurs sans abonnement actif vers la page des réglages (`/settings`).

## Fonctionnement

### Logique de redirection

- **Utilisateurs avec abonnement actif** (`status: 'active'` ou `'trialing'`) : Accès autorisé
- **Utilisateurs sans abonnement actif** (`status: 'free'`, `'inactive'`, etc.) : Redirection automatique vers `/settings`

### Composants implémentés

1. **`SubscriptionGuard`** : Composant principal de protection
2. **`SubscriptionRedirectNotification`** : Notification informant l'utilisateur de la redirection
3. **Page de test** : `/test-subscription` pour vérifier le fonctionnement

## Utilisation

### Protection d'une page

```tsx
import { SubscriptionGuard } from '@/components/subscription'

export default function MaPage() {
  return (
    <ProtectedRoute>
      <SubscriptionGuard>
        {/* Contenu de la page protégée */}
      </SubscriptionGuard>
    </ProtectedRoute>
  )
}
```

### Personnalisation de la redirection

```tsx
<SubscriptionGuard redirectTo="/custom-page">
  {/* Contenu protégé */}
</SubscriptionGuard>
```

## Pages protégées

Les pages suivantes utilisent maintenant le `SubscriptionGuard` :

- `/dashboard` - Tableau de bord principal
- `/schedule-tweet` - Planification de tweets
- `/upload` - Upload d'épisodes
- `/episodes/[id]` - Détails d'un épisode
- `/test-subscription` - Page de test (nouvelle)

## Flux utilisateur

### Utilisateur non abonné

1. Tente d'accéder à une page protégée
2. `SubscriptionGuard` détecte l'absence d'abonnement actif
3. Redirection automatique vers `/settings`
4. Affichage de la notification de redirection
5. Affichage du paywall pour souscrire

### Utilisateur avec abonnement actif

1. Accès direct aux pages protégées
2. Aucune redirection
3. Fonctionnalités complètes disponibles

## Avantages

- **Sécurité** : Protection automatique des fonctionnalités premium
- **UX** : Redirection transparente sans erreurs
- **Maintenance** : Logique centralisée et réutilisable
- **Flexibilité** : Personnalisation de la page de redirection

## Tests

### Script de test

```bash
node test-subscription-guard.js
```

### Page de test

Accédez à `/test-subscription` pour vérifier :
- Le statut de votre abonnement
- L'accès aux pages protégées
- Le fonctionnement de la redirection

## Configuration

### Variables d'environnement requises

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Structure de base de données

Le système utilise les colonnes suivantes de la table `users` :
- `subscription_status` : Statut de l'abonnement
- `subscription_tier` : Niveau de l'abonnement

## Dépannage

### Problèmes courants

1. **Redirection en boucle** : Vérifiez que la page de redirection n'utilise pas `SubscriptionGuard`
2. **Erreurs de chargement** : Vérifiez la connexion à Supabase
3. **Statut incorrect** : Vérifiez les valeurs dans la base de données

### Logs de débogage

Le composant affiche des logs dans la console pour :
- État de l'authentification
- Vérification de l'abonnement
- Redirections effectuées

## Évolutions futures

- Support de différents niveaux d'abonnement
- Pages de redirection personnalisées par fonctionnalité
- Gestion des essais gratuits
- Analytics des redirections
