# Podcast Manager

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
- **Génération automatique de tweets** : 10-15 tweets par épisode avec IA Claude
- **Tweets intelligents** : Basés sur la transcription, ton et style adaptés
- **Respect des limites** : Maximum 200 caractères par tweet
- **Hashtags pertinents** : 2-3 hashtags par tweet maximum
- **Posts LinkedIn** : Contenu professionnel long-form adapté
- **Brouillons sauvegardés** : Stockage pour publication ultérieure

### 🛠 Stack Technique

#### Frontend & Backend
- **Framework** : Next.js 14+ (App Router)
- **Rendu** : Server-Side Rendering (SSR) pour le SEO
- **Styling** : Tailwind CSS (design professionnel, moderne)
- **TypeScript** : Typage strict pour la robustesse

#### Base de Données & Stockage
- **Base de données** : PostgreSQL via Supabase Cloud
- **Stockage fichiers** : Amazon S3 (fichiers audio, exports)
- **Cache** : Redis pour les performances

#### Services Externes
- **Authentification** : Supabase Auth
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

### Interface Utilisateur

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

#### Phase 1 : Fondations (1-2 semaines) 
  - [x] Initialiser le projet Next.js
  - [x] Collecter les clés API
  - [x] Concevoir et implémenter le schéma de base de données
  - [x] Mettre en place l'authentification utilisateur de base
  - [x] Développer le système d'upload de fichiers audio
  - [x] Créer l'interface utilisateur de gestion des épisodes


#### Phase 2 : Développement de la pipeline IA (2-3 semaines)
  - [x] Editer les détails des épisodes
  - [x] Intégrer les services de transcription audio
  - [x] Développer le système d'amélioration automatique des transcriptions
  - [x] Implémenter l'extraction automatique des sujets et timestamps
  - [x] Mettre en place la gestion d'erreurs et les fonctionnalités de retry
  - [x] Créer le système de suivi des statuts de traitement

#### Phase 3 : Génération de contenu (1-2 semaines)
  - [x] Générer les notes/résumé du podcast
  - [x] Générer les timestamps/résumés du podcast
  - [x] Développer la génération de descriptions spécifiques par plateforme :
       - Descriptions optimisées pour blog
       - Descriptions adaptées à YouTube
       - Descriptions formatées pour Spotify
  - [x] Implémenter la génération de publications pour réseaux sociaux
  - [x] Créer les fonctionnalités de prévisualisation et d'édition
  - [x] Mettre en place le stockage et la gestion du contenu généré

#### Phase 4 : Intégration aux plateformes (1-2 semaines)
  - [x] Intégrer l'authentification OAuth pour les réseaux sociaux
  - [x] Développer les fonctionnalités de publication automatique sur X/Twitter
  - [x] Créer le système de suivi des statuts de publication
  - [x] Génération automatique de tweets basés sur la transcription
  - [x] Mettre en place la gestion d'erreurs pour les publications

#### Phase 5 : Finalisation et lancement (1 semaine)
  - [x] Implémenter la période d'essai gratuit de 7 jours
  - [x] Tester et valider le parcours de paiement complet
  - [x] Améliorer les messages d'erreur et l'expérience utilisateur
  - [x] Intégrer Stripe pour la gestion des paiements
  - [x] Implémenter la gestion des abonnements
  - [ ] Préparer et effectuer le déploiement en production
  - [ ] Tester bons de réductions
  
#### Phase 6 : Post-lancement et amélioration continue
  - [ ] Développer le tableau de bord utilisateur complet
  - [ ] Collecter et analyser les retours des premiers utilisateurs
  - [ ] Optimiser les performances de l'application
  - [ ] Corriger les bugs identifiés et implémenter les améliorations
  - [ ] Surveiller et analyser les performances de l'application
  - [ ] Intégrer les outils d'analytics et de monitoring
  - [ ] Optimiser continuellement les conversions et la rétention
  - [ ] Implémenter la publication automatique sur LinkedIn
  - [ ] Planifier et développer les fonctionnalités futures


### 🧪 Tests & Qualité

#### Tests
- **Tests unitaires** : Jest + Testing Library
- **Tests d'intégration** : Playwright
- **Tests API** : Supertest
- **Coverage** : Minimum 80%


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

# Lancer en développement
npm run dev
```

### Configuration Supabase Cloud

Ce projet utilise Supabase Cloud. Consultez [SUPABASE_CLOUD_SETUP.md](./SUPABASE_CLOUD_SETUP.md) pour la configuration complète.

### Variables d'Environnement

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AWS S3 (pour le stockage des fichiers audio)
AWS_ACCESS_KEY_ID="votre_access_key"
AWS_SECRET_ACCESS_KEY="votre_secret_key"
AWS_S3_BUCKET="votre_bucket_name"
AWS_REGION="us-east-1"

# APIs externes
ANTHROPIC_API_KEY="..."

# Paiements
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

*Ce cahier des charges est un document vivant qui évoluera selon les besoins du projet et les retours utilisateurs.*


"Le bonheur est-il possible sans illusions ? Dans cet épisode captivant, le philosophe André Comte-Sponville partage sa vision unique sur les grandes questions existentielles qui nous habitent tous. À travers une conversation intime et profonde, il aborde avec finesse les thèmes de l'amour, du deuil, du bonheur et des relations parents-enfants.

Ancien normalien et agrégé de philosophie, Comte-Sponville nous livre ses réflexions sur ce qu'est véritablement le bonheur, au-delà des idéaux et des attentes irréalistes. Il explore notamment la différence entre trois types d'amour - Eros, Philia et Agapé - et nous explique pourquoi accepter l'imperfection est la clé d'une vie plus sereine.

De son enfance complexe à ses expériences personnelles du deuil, en passant par sa vision du couple moderne, le philosophe partage avec authenticité et sagesse des enseignements précieux pour mieux comprendre et accepter la vie telle qu'elle est.

Un épisode riche en perspectives qui vous donnera matière à réflexion sur votre propre quête de sens et de bonheur.

🎧 Écoutez cet épisode pour découvrir une approche philosophique accessible et éclairante sur les grands questionnements de l'existence."
## Timestamps

[00:00] - Introduction et présentation d'André Comte-Sponville
[02:45] - Définition et accessibilité de la philosophie
[07:30] - Parcours personnel et découverte de la philosophie
[13:15] - Réflexion sur le bonheur et sa définition
[21:40] - L'amour et ses différentes formes (Eros, Philia, Agapé)
[31:20] - Relations parents-enfants et complexe d'Œdipe
[38:45] - La mort et la vision d'un philosophe athée
[45:30] - Le couple et l'évolution de l'amour dans le temps
[52:15] - L'éducation des enfants et le rôle des parents
[59:40] - Le deuil et comment y faire face
[01:05:20] - Les rêves et comment gérer leur non-réalisation
[01:12:45] - La sagesse et l'acceptation de la vie
[01:18:30] - Conclusion et souhaits pour l'avenir
Ces timestamps couvrent les principaux sujets abordés dans l'entretien, organisés chronologiquement et avec des descriptions claires et concises.

