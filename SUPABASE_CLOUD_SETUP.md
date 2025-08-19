# Configuration Supabase Cloud

Ce projet utilise Supabase Cloud au lieu d'une installation locale. Voici comment configurer et utiliser votre base de données Supabase.

## Configuration initiale

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre `Project URL` et `anon public` key

### 2. Variables d'environnement

Créez un fichier `.env.local` avec les informations suivantes :

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Structure de la base de données

La structure de la base de données est définie dans `types/database.ts`. Pour créer les tables :

1. Allez dans votre dashboard Supabase
2. Naviguez vers "SQL Editor"
3. **Option recommandée** : Copiez et exécutez le contenu du fichier `supabase-cloud-migration.sql`
4. **Alternative** : Exécutez les requêtes SQL suivantes manuellement :

#### Table des épisodes
```sql
CREATE TABLE episodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT,
  s3_key TEXT,
  transcription TEXT,
  optimized_transcription TEXT,
  speakers JSONB,
  timestamps JSONB,
  status TEXT DEFAULT 'uploaded',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Table des utilisateurs (si nécessaire)
```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  subscription_status TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Utilisation

### Connexion à la base de données

Le client Supabase est configuré dans `config/supabase.ts` et peut être importé dans vos composants :

```typescript
import { supabase } from '@/config/supabase'

// Exemple d'utilisation
const { data, error } = await supabase
  .from('episodes')
  .select('*')
  .eq('user_id', userId)
```

### Authentification

L'authentification est gérée par Supabase Auth. Consultez `lib/auth.ts` pour les fonctions d'authentification.

### Storage

Les fichiers audio sont stockés dans Supabase Storage. Consultez `lib/s3.ts` pour la gestion des fichiers.

## Avantages de Supabase Cloud

- ✅ Pas de configuration locale complexe
- ✅ Base de données toujours disponible
- ✅ Sauvegarde automatique
- ✅ Mise à l'échelle automatique
- ✅ Interface d'administration intégrée
- ✅ API REST et GraphQL automatiques
- ✅ Authentification prête à l'emploi
- ✅ Storage de fichiers intégré

## Migration depuis Supabase local

Si vous aviez une base de données locale :

1. Exportez vos données depuis Supabase local
2. Importez-les dans votre projet Supabase Cloud
3. Mettez à jour vos variables d'environnement
4. Testez que tout fonctionne correctement

## Support

Pour toute question sur Supabase Cloud, consultez la [documentation officielle](https://supabase.com/docs).
