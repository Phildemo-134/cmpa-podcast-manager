# Guide de configuration Twitter OAuth2 pour CMPA Podcast Manager

## Vue d'ensemble

Ce guide détaille chaque étape de la configuration Twitter OAuth2 pour permettre aux utilisateurs de connecter leur compte Twitter et publier automatiquement des tweets.

## Étape 1: Configuration Twitter Developer

### 1.1 Créer une application Twitter
1. Rendez-vous sur [developer.twitter.com](https://developer.twitter.com)
2. Connectez-vous avec votre compte Twitter
3. Cliquez sur "Create App" ou "Create Project"
4. Remplissez les informations de base :
   - **Project Name**: `CMPA Podcast Manager`
   - **Use Case**: Sélectionnez "Making a bot" ou "Exploring the API"
   - **Description**: `Application pour publier automatiquement des épisodes de podcasts sur Twitter`

### 1.2 Configurer l'application
1. Dans votre projet, allez dans "App Settings" > "User authentication settings"
2. Activez "OAuth 2.0"
3. Configurez les URLs :
   - **Type of App**: Web App
   - **Callback URL**: `https://votre-domaine.com/api/auth/twitter/callback`
   - **Website URL**: `https://votre-domaine.com`
4. Sauvegardez les modifications

### 1.3 Obtenir les clés API
1. Allez dans "Keys and tokens"
2. Notez :
   - **OAuth 2.0 Client ID** (ex: `abc123...`)
   - **OAuth 2.0 Client Secret** (ex: `xyz789...`)
3. **⚠️ IMPORTANT**: Ne partagez jamais ces clés publiquement

## Étape 2: Configuration de l'environnement

### 2.1 Variables d'environnement
Ajoutez ces variables dans votre fichier `.env.local` :

```bash
# Twitter OAuth2 Configuration
TWITTER_CLIENT_ID=votre-client-id
TWITTER_CLIENT_SECRET=votre-client-secret
TWITTER_REDIRECT_URI=https://votre-domaine.com/api/auth/twitter/callback

# Application URL
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

### 2.2 Vérification
Assurez-vous que toutes les variables sont correctement définies :
```bash
echo $TWITTER_CLIENT_ID
echo $TWITTER_CLIENT_SECRET
echo $TWITTER_REDIRECT_URI
```

## Étape 3: Configuration de la base de données

### 3.1 Exécuter le script SQL
1. Ouvrez l'interface SQL de Supabase
2. Copiez et exécutez le contenu de `supabase-oauth-setup.sql`
3. Vérifiez que les tables sont créées :
   - `oauth_states`
   - `social_connections`

### 3.2 Vérification des tables
```sql
-- Vérifier la structure des tables
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('oauth_states', 'social_connections')
ORDER BY table_name, ordinal_position;
```

## Étape 4: Test de la connexion

### 4.1 Test local
1. Démarrez votre serveur de développement :
   ```bash
   npm run dev
   ```

2. Naviguez vers `/settings`
3. Cliquez sur "Se connecter" pour Twitter
4. Vérifiez que vous êtes redirigé vers Twitter
5. Autorisez l'application
6. Vérifiez que vous revenez sur `/settings` avec un message de succès

### 4.2 Vérification des logs
Surveillez les logs de votre serveur pour détecter d'éventuelles erreurs :
```bash
# Dans le terminal du serveur
[INFO] Redirection vers Twitter OAuth2: https://twitter.com/i/oauth2/authorize?...
[INFO] Connexion Twitter réussie pour l'utilisateur: abc-123-def
```

## Étape 5: Gestion des erreurs courantes

### 5.1 Erreur "Configuration Twitter manquante"
**Cause**: Variables d'environnement non définies
**Solution**: Vérifiez votre fichier `.env.local`

### 5.2 Erreur "Invalid redirect URI"
**Cause**: URL de callback incorrecte dans Twitter Developer
**Solution**: Mettez à jour l'URL de callback dans Twitter Developer

### 5.3 Erreur "State invalide ou expiré"
**Cause**: Problème de synchronisation ou expiration
**Solution**: Vérifiez la table `oauth_states` dans Supabase

### 5.4 Erreur "Token exchange failed"
**Cause**: Problème avec le code verifier PKCE
**Solution**: Vérifiez la génération et le stockage du code verifier

## Étape 6: Sécurité et bonnes pratiques

### 6.1 Protection CSRF
- ✅ Utilisation de `state` unique pour chaque requête
- ✅ Expiration automatique des états (10 minutes)
- ✅ Validation du state dans le callback

### 6.2 Sécurité des tokens
- ✅ Stockage sécurisé des tokens dans Supabase
- ✅ Utilisation de RLS (Row Level Security)
- ✅ Chiffrement des tokens en production (recommandé)

### 6.3 Gestion des permissions
- ✅ Demande de permissions minimales nécessaires
- ✅ Stockage des permissions accordées
- ✅ Possibilité de révoquer l'accès

## Étape 7: Déploiement en production

### 7.1 Variables d'environnement
1. Configurez les variables dans votre plateforme de déploiement
2. Vérifiez que `NEXT_PUBLIC_APP_URL` pointe vers votre domaine de production
3. Mettez à jour l'URL de callback dans Twitter Developer

### 7.2 HTTPS obligatoire
- Twitter OAuth2 nécessite HTTPS en production
- Vérifiez que votre certificat SSL est valide
- Testez la connexion depuis un environnement de production

### 7.3 Monitoring
1. Surveillez les logs d'erreur
2. Vérifiez les métriques de connexion
3. Testez régulièrement le processus OAuth2

## Étape 8: Utilisation de la connexion

### 8.1 Publication automatique
Une fois connecté, vous pouvez utiliser l'API Twitter pour publier :

```typescript
// Exemple de publication d'un tweet
async function publishTweet(text: string) {
  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  })
  
  return response.json()
}
```

### 8.2 Gestion des tokens expirés
- Implémentez le refresh automatique des tokens
- Surveillez la date d'expiration
- Gérez les erreurs d'authentification

## Dépannage avancé

### Problèmes de CORS
Si vous rencontrez des erreurs CORS :
1. Vérifiez la configuration de Next.js
2. Assurez-vous que les domaines sont correctement configurés
3. Testez avec différents navigateurs

### Problèmes de cookies
Si l'authentification échoue :
1. Vérifiez la configuration des cookies Supabase
2. Assurez-vous que les domaines correspondent
3. Testez en mode incognito

### Problèmes de rate limiting
Twitter impose des limites de taux :
1. Implémentez une gestion des erreurs 429
2. Ajoutez des délais entre les requêtes
3. Surveillez l'utilisation de l'API

## Support et ressources

- [Documentation Twitter API v2](https://developer.twitter.com/en/docs/twitter-api)
- [Guide OAuth2 Twitter](https://developer.twitter.com/en/docs/authentication/oauth-2-0)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Next.js](https://nextjs.org/docs)

## Contact

Pour toute question ou problème, consultez la documentation ou ouvrez une issue sur le repository du projet.
