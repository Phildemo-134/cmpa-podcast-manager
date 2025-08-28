# Implémentation de la Protection des Abonnements

## Vue d'ensemble

Ce document décrit l'implémentation du système de protection des abonnements qui redirige automatiquement les utilisateurs non-abonnés vers la page des réglages.

## Architecture

### Composants Séparés pour Éviter les Conflits

Le système utilise deux composants distincts pour éviter les boucles infinies et les conflits :

1. **ProtectedRoute** : Vérifie uniquement l'authentification
2. **SubscriptionCheck** : Vérifie le statut d'abonnement et redirige si nécessaire

### Structure des Pages Protégées

```typescript
<ProtectedRoute>
  <SubscriptionCheck>
    {/* Contenu de la page protégée */}
  </SubscriptionCheck>
</ProtectedRoute>
```

## Fonctionnement

### 1. ProtectedRoute (Authentification)

Le composant `ProtectedRoute` vérifie uniquement si l'utilisateur est connecté :

```typescript
<ProtectedRoute>
  {/* Contenu accessible à tous les utilisateurs connectés */}
</ProtectedRoute>
```

### 2. SubscriptionCheck (Vérification d'Abonnement)

Le composant `SubscriptionCheck` vérifie le statut d'abonnement et redirige si nécessaire :

```typescript
<SubscriptionCheck>
  {/* Contenu protégé par abonnement */}
</SubscriptionCheck>
```

### 3. Vérification des Statuts d'Abonnement

Seuls les utilisateurs avec les statuts suivants peuvent accéder aux pages protégées :
- `active` : Abonnement actif
- `trialing` : Période d'essai

Tous les autres statuts (`inactive`, `past_due`, `canceled`, `unpaid`, `free`) déclenchent une redirection vers `/settings`.

### 4. Protection Contre les Boucles Infinies

Le système vérifie le `pathname` actuel avant de rediriger :
- Si l'utilisateur est déjà sur `/settings`, aucune redirection n'est effectuée
- Cela évite les boucles infinies de redirection
- Séparation claire des responsabilités entre composants

## Pages Protégées

Les pages suivantes nécessitent un abonnement actif :

- `/dashboard` - Tableau de bord principal
- `/upload` - Upload d'épisodes
- `/episodes/[id]` - Détails des épisodes
- `/schedule-tweet` - Planification des tweets

## Pages Accessibles

Les pages suivantes sont accessibles à tous les utilisateurs connectés :

- `/settings` - Page des réglages (destination des redirections)
- `/auth` - Page d'authentification

## Implémentation Technique

### Composant SubscriptionCheck

```typescript
interface SubscriptionCheckProps {
  children: React.ReactNode
  redirectTo?: string
}

export function SubscriptionCheck({ 
  children, 
  redirectTo = '/settings'
}: SubscriptionCheckProps) {
  // Vérification du statut d'abonnement
  // Redirection vers /settings si pas d'abonnement actif
  // Protection contre les boucles infinies
}
```

### Vérification d'Abonnement

```typescript
// Vérifier l'abonnement
const hasActiveSubscription = userSubscription?.subscription_status === 'active' || 
                            userSubscription?.subscription_status === 'trialing'

// Si pas d'abonnement actif et qu'on n'est pas déjà sur la page des réglages
if (!hasActiveSubscription && pathname !== redirectTo) {
  // Redirection vers la page des réglages
  router.push(redirectTo)
}
```

### Gestion des Erreurs

- En cas d'erreur de base de données, l'utilisateur est considéré comme non-abonné
- Redirection automatique vers `/settings`
- Logs d'erreur pour le débogage
- Gestion des composants démontés

## Utilisation

### Protection d'une Page

```typescript
export default function MaPage() {
  return (
    <ProtectedRoute>
      <SubscriptionCheck>
        <div>
          {/* Contenu de la page protégée */}
        </div>
      </SubscriptionCheck>
    </ProtectedRoute>
  )
}
```

### Protection Conditionnelle

```typescript
// Protection standard (authentification uniquement)
<ProtectedRoute>
  {/* Contenu accessible à tous les utilisateurs connectés */}
</ProtectedRoute>

// Protection avec vérification d'abonnement
<ProtectedRoute>
  <SubscriptionCheck>
    {/* Contenu accessible uniquement aux abonnés actifs */}
  </SubscriptionCheck>
</ProtectedRoute>
```

## Avantages de la Nouvelle Architecture

1. **Séparation des Responsabilités** : Chaque composant a un rôle clair
2. **Évite les Conflits** : Pas d'interférence entre l'authentification et la vérification d'abonnement
3. **Protection Renforcée** : Double vérification sans risque de boucles infinies
4. **Maintenance Facile** : Composants modulaires et indépendants
5. **Performance** : Moins d'appels à la base de données
6. **Fiabilité** : Gestion robuste des erreurs et des états

## Maintenance

### Ajouter une Nouvelle Page Protégée

1. Importer `ProtectedRoute` et `SubscriptionCheck`
2. Envelopper le contenu avec la structure ci-dessus
3. Tester la redirection avec un utilisateur non-abonné

### Modifier la Logique de Vérification

1. Modifier le composant `SubscriptionCheck` uniquement
2. Tester avec différents statuts d'abonnement
3. Vérifier l'absence de boucles infinies

## Tests

### Scénarios de Test

1. **Utilisateur non connecté** → Redirection vers `/auth`
2. **Utilisateur connecté sans abonnement** → Redirection vers `/settings`
3. **Utilisateur avec abonnement actif** → Accès autorisé
4. **Utilisateur en période d'essai** → Accès autorisé
5. **Utilisateur sur /settings** → Aucune redirection

### Vérification des Boucles Infinies

- Tester l'accès à `/settings` avec un utilisateur non-abonné
- Vérifier qu'aucune redirection en boucle ne se produit
- Contrôler les logs de la console pour les erreurs
- Vérifier que les composants ne se bloquent pas mutuellement

## Résolution des Problèmes

### Boucles Infinies

**Cause** : Conflit entre composants de vérification
**Solution** : Utiliser `SubscriptionCheck` séparé de `ProtectedRoute`

### Erreurs de Base de Données

**Cause** : Problèmes de connexion ou de requête
**Solution** : Gestion d'erreur robuste avec fallback vers statut non-abonné

### Performance

**Cause** : Trop d'appels à la base de données
**Solution** : Vérification unique par composant avec gestion d'état locale
