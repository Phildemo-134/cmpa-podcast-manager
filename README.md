# CMPA Podcast Manager

Application web de gestion et traitement automatisé de podcasts pour la création de contenu multi-plateforme.

## 📋 Cahier des Charges

### Vue d'ensemble
Application permettant aux créateurs de podcasts de transformer leurs enregistrements audio en contenu optimisé pour différentes plateformes (blog, réseaux sociaux, descriptions pour Spotify/YouTube) grâce à l'intelligence artificielle.

### Fonctionnalités Principales

#### 🔐 Authentification & Gestion des Comptes
- **Inscription/Connexion** : Système d'authentification simple et sécurisé
- **Profils utilisateurs** : Gestion des informations personnelles
- **Gestion des abonnements** : Intégration Stripe pour les paiements récurrents

#### 📁 Gestion des Épisodes
- **Liste des épisodes** : Interface pour visualiser tous les épisodes de l'utilisateur
- **Stockage des épisodes** : Conservation des métadonnées des épisodes: titre, numéro d'épisode,
date, status, durée, descriptions relatives aux différentes plateformes. 
- **Création d'épisode** : Upload de fichiers audio avec métadonnées (nom, description)
- **Statuts de traitement** : Suivi en temps réel du processus de traitement

#### 🤖 Traitement IA Automatisé

##### 1. Transcription Audio
- **Upload sécurisé** : Stockage des fichiers audio sur Amazon S3
- **Transcription automatique** : Conversion audio vers texte via API IA
- **Formats supportés** : MP3, WAV, M4A (pas de limite de taille ou durée)

##### 2. Amélioration de la Transcription
- **Nettoyage automatique** : Correction des erreurs, ponctuation, formatage
- **Structure du contenu** : Organisation en paragraphes cohérents
- **Optimisation de la lisibilité** : Amélioration de la fluidité du texte

##### 3. Extraction de Timestamps
- **Identification des sujets** : Détection automatique des thèmes abordés
- **Horodatage précis** : Correspondance entre sujets et moments dans l'audio
- **Segmentation intelligente** : Division du contenu en sections thématiques

##### 4. Génération de Descriptions
- **Description blog** : Contenu optimisé SEO pour articles de blog
- **Description Spotify** : Format adapté aux podcasts sur Spotify
- **Description YouTube** : Optimisée pour la découvrabilité sur YouTube
- **Personnalisation** : Adaptation du ton et du style selon la plateforme

##### 5. Création de Contenu Social
- **Posts Twitter/X** : Threads et posts individuels optimisés
- **Posts LinkedIn** : Contenu professionnel long-form adapté
- **Brouillons sauvegardés** : Stockage pour publication ultérieure

### 🛠 Stack Technique

#### Frontend & Backend
- **Framework** : Next.js 14+ (App Router)
- **Rendu** : Server-Side Rendering (SSR) pour le SEO
- **Styling** : Tailwind CSS (design professionnel, moderne)
- **TypeScript** : Typage strict pour la robustesse

#### Base de Données & Stockage
- **Base de données** : PostgreSQL via Supabase
- **Stockage fichiers** : Amazon S3 (fichiers audio, exports)
- **Cache** : Redis pour les performances
- **ORM** : Prisma ou Drizzle ORM

#### Services Externes
- **Authentification** : Supabase Auth ou NextAuth.js
- **Paiements** : Stripe (abonnements, paiements uniques)
- **IA Transcription** : Deepgram Nova 2 API
- **IA Traitement** : Anthropic Claude 3.5 Sonnet
- **Email** : Resend ou SendGrid

#### Infrastructure
- **Déploiement** : Vercel (serverless)
- **Monitoring** : Vercel Analytics + Sentry
- **CDN** : Vercel Edge Network
- **Variables d'environnement** : Configuration sécurisée

### 📊 Modèle de Données

#### Utilisateurs
```typescript
User {
  id: string
  email: string
  name: string
  subscription_tier: 'free' | 'pro' | 'enterprise'
  subscription_status: 'active' | 'inactive' | 'cancelled'
  created_at: DateTime
  updated_at: DateTime
}
```

#### Épisodes
```typescript
Episode {
  id: string
  user_id: string
  title: string
  audio_file_url: string
  duration: number
  status: 'uploading' | 'transcribing' | 'processing' | 'completed' | 'error'
  created_at: DateTime
  updated_at: DateTime
}
```

#### Transcriptions & Contenu
```typescript
Transcription {
  id: string
  episode_id: string
  raw_text: string
  cleaned_text: string
  timestamps: JSON
  blog_description: string
  spotify_description: string
  youtube_description: string
  social_drafts: JSON
}
```

### 🔒 Sécurité & Performance

#### Sécurité
- **Authentification JWT** : Tokens sécurisés
- **Upload sécurisé** : Validation des types de fichiers
- **Rate limiting** : Protection contre les abus
- **Chiffrement** : Données sensibles chiffrées

#### Performance
- **Cache Redis** : Mise en cache des transcriptions
- **CDN** : Distribution globale des assets
- **Optimisation images** : Next.js Image Optimization
- **Lazy loading** : Chargement différé des composants

### 💰 Modèle d'Abonnement

#### Essai Gratuit
- **7 jours d'essai gratuit** : Accès complet à toutes les fonctionnalités
- Transcription illimitée avec Deepgram Nova 2
- Génération de contenu avec Claude 3.5 Sonnet
- Support email

#### Plan Pro (49$/mois)
- **Après l'essai gratuit** : Facturation mensuelle automatique
- Épisodes illimités
- Transcription haute qualité (Deepgram Nova 2)
- Génération de contenu IA avancée (Claude 3.5 Sonnet)
- Contenu optimisé LinkedIn et Twitter/X
- Export en multiple formats
- Support prioritaire
- Analytics détaillés

### 📱 Interface Utilisateur

#### Design System
- **Style** : Professionnel, moderne, épuré
- **Couleurs** : Palette sobre (pas de couleurs flashy)
- **Typographie** : Lisible et accessible
- **Responsive** : Mobile-first design

#### Pages Principales
1. **Dashboard** : Vue d'ensemble des épisodes
2. **Upload** : Interface de création d'épisode
3. **Épisode Detail** : Gestion d'un épisode spécifique
4. **Content Library** : Bibliothèque de contenu généré
5. **Settings** : Paramètres utilisateur et abonnement

### 🚀 Plan de Développement Détaillé

#### Phase 0 : Préparation de l'Environnement (1-2 jours)
- [ ] **Configuration environnement local**
  - Installation PostgreSQL et Redis localement
  - Configuration des variables d'environnement
  - Setup des comptes Supabase (gratuit pour commencer)
- [ ] **Setup de la base de données**
  - Configuration Supabase
  - Setup Drizzle ORM
  - Création des schémas de base de données (User, Episode, Transcription)

#### Phase 1 : Fondations (1-2 semaines)
- [ ] **Authentification**
  - Intégration Supabase Auth
  - Pages de connexion/inscription
  - Middleware de protection des routes
- [ ] **Design System & UI Foundation**
  - Création des composants UI de base (Button, Input, Card, etc.)
  - Configuration Tailwind avec palette sobre et professionnelle
  - Layout principal et navigation

#### Phase 2 : Core Features (2-3 semaines)
- [ ] **Gestion des Épisodes**
  - Interface CRUD pour les épisodes
  - Dashboard avec liste des épisodes
  - Upload de fichiers audio (stockage local temporaire)
- [ ] **Services de Traitement (avec Mocks)**
  - Service de transcription avec données simulées
  - Service de génération de contenu avec templates
  - Système de statuts de traitement
- [ ] **Interface de Détail**
  - Page de détail d'épisode
  - Affichage du contenu généré
  - Interface d'édition du contenu

#### Phase 3 : Intégrations Réelles (1-2 semaines)
- [ ] **APIs IA**
  - Intégration Deepgram pour la transcription
  - Intégration Claude 3.5 Sonnet pour la génération
  - Stockage AWS S3 pour les fichiers audio
- [ ] **Optimisations & Polish**
  - Gestion d'erreurs robuste
  - Loading states et feedback utilisateur
  - Tests et validation

#### Phase 4 : Fonctionnalités Avancées (2-3 semaines)
- [ ] **Système d'abonnement**
  - Intégration Stripe
  - Gestion des plans tarifaires
  - Dashboard d'administration
- [ ] **Contenu réseaux sociaux**
  - Génération posts Twitter/LinkedIn
  - Templates personnalisables
  - Export multi-formats
- [ ] **Analytics & Performance**
  - Métriques utilisateur
  - Optimisations performance
  - Monitoring et alertes

### 🎯 Étapes de Développement Ordonnées

#### Étape 1 : Configuration de l'environnement
```bash
# Installation des dépendances système
brew install postgresql redis

# Configuration Supabase
# Création du projet sur supabase.com
# Configuration des variables d'environnement
```

#### Étape 2 : Setup de la base de données
- Configuration Drizzle ORM
- Création des migrations initiales
- Seed de données de test

#### Étape 3 : Authentification Supabase
- Configuration du client Supabase
- Création des pages auth
- Middleware de protection

#### Étape 4 : Design System
- Composants UI de base
- Palette de couleurs professionnelle
- Layout responsive

#### Étape 5 : CRUD Épisodes
- Modèles de données
- API routes Next.js
- Interface utilisateur

#### Étape 6 : Upload de fichiers
- Configuration multer/formidable
- Validation des fichiers audio
- Stockage temporaire local

#### Étape 7 : Services de traitement (Mock)
- Service de transcription simulé
- Générateur de contenu avec templates
- Queue de traitement

#### Étape 8 : Interface de détail
- Page d'épisode complète
- Affichage du contenu généré
- Édition inline

#### Étape 9 : Intégrations IA réelles
- API Deepgram
- API Claude 3.5 Sonnet
- Gestion des erreurs et retry

#### Étape 10 : Polish & Tests
- Tests unitaires et d'intégration
- Optimisations performance
- Documentation

### 🧪 Tests & Qualité

#### Tests
- **Tests unitaires** : Jest + Testing Library
- **Tests d'intégration** : Playwright
- **Tests API** : Supertest
- **Coverage** : Minimum 80%

#### Qualité Code
- **ESLint** : Règles strictes
- **Prettier** : Formatage automatique
- **Husky** : Pre-commit hooks
- **TypeScript strict** : Mode strict activé

### 📈 Métriques & Analytics

#### KPIs Techniques
- Temps de transcription moyen
- Taux d'erreur des APIs
- Performance des pages (Core Web Vitals)
- Uptime de l'application

#### KPIs Business
- Taux de conversion gratuit → payant
- Temps d'utilisation moyen
- Satisfaction utilisateur (NPS)
- Rétention mensuelle

---

## 🏃‍♂️ Démarrage Rapide

### Prérequis
- Node.js 18+
- PostgreSQL
- Redis
- Comptes : Supabase, Stripe, OpenAI, AWS S3

### Installation

```bash
# Cloner le projet
git clone <repo-url>
cd cmpa-podcast-manager

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Remplir les variables dans .env.local

# Initialiser la base de données
npm run db:push

# Lancer en développement
npm run dev
```

### Variables d'Environnement

```bash
# Base de données
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."

# Authentification
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# APIs externes
DEEPGRAM_API_KEY="..."
ANTHROPIC_API_KEY="..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="..."

# Paiements
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

*Ce cahier des charges est un document vivant qui évoluera selon les besoins du projet et les retours utilisateurs.*
