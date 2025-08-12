# Guide de Développement - CMPA Podcast Manager

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Git

### Installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd cmpa-podcast-manager
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp env.example .env.local
   # Éditer .env.local avec vos valeurs
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

5. **Ouvrir l'application**
   Naviguez vers [http://localhost:3000](http://localhost:3000)

## 🛠 Scripts Disponibles

- `npm run dev` - Lance le serveur de développement avec Turbopack
- `npm run build` - Construit l'application pour la production
- `npm run start` - Lance l'application en mode production
- `npm run lint` - Vérifie le code avec ESLint
- `npm run type-check` - Vérifie les types TypeScript

## 📁 Structure du Projet

```
cmpa-podcast-manager/
├── app/                    # App Router Next.js 14+
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Page d'accueil
│   └── globals.css        # Styles globaux
├── components/             # Composants React
│   ├── ui/                # Composants UI de base
│   ├── auth/              # Composants d'authentification
│   ├── dashboard/         # Composants du tableau de bord
│   └── episodes/          # Composants de gestion des épisodes
├── lib/                    # Utilitaires et configurations
│   ├── utils.ts           # Fonctions utilitaires
│   └── constants.ts       # Constantes de l'application
├── types/                  # Types TypeScript
│   └── index.ts           # Interfaces principales
├── public/                 # Assets statiques
├── styles/                 # Styles additionnels
└── config/                 # Configurations
```

## 🎨 Design System

### Couleurs
- **Primary**: Bleu (#0ea5e9) - Actions principales, liens
- **Secondary**: Gris (#64748b) - Éléments secondaires
- **Accent**: Violet (#d946ef) - Éléments d'accent
- **Success**: Vert (#22c55e) - Succès, validation
- **Warning**: Orange (#f59e0b) - Avertissements
- **Error**: Rouge (#ef4444) - Erreurs, suppression

### Typographie
- **Font principale**: Geist Sans (variable CSS: `--font-geist-sans`)
- **Font monospace**: Geist Mono (variable CSS: `--font-geist-mono`)

### Composants UI
- **Button**: Boutons avec variantes (default, outline, ghost, etc.)
- **Card**: Conteneurs de contenu stylisés
- **Input**: Champs de saisie
- **Label**: Étiquettes de formulaires

## 🔧 Configuration

### Next.js
- **App Router**: Utilisation du nouveau système de routage
- **Turbopack**: Compilation rapide en développement
- **TypeScript**: Configuration stricte activée
- **Tailwind CSS**: Framework CSS utilitaire

### Tailwind CSS
- **Version**: 4.x avec PostCSS
- **Configuration**: `tailwind.config.ts`
- **Variables CSS**: Définies dans `globals.css`

### ESLint & Prettier
- **ESLint**: Règles Next.js + personnalisées
- **Prettier**: Formatage automatique du code
- **Configuration**: `.eslintrc.json` et `.prettierrc`

## 📱 Responsive Design

### Breakpoints
- **SM**: 640px et plus
- **MD**: 768px et plus  
- **LG**: 1024px et plus
- **XL**: 1280px et plus
- **2XL**: 1536px et plus

### Approche
- **Mobile-first**: Design optimisé pour mobile en premier
- **Composants adaptatifs**: S'adaptent automatiquement aux écrans
- **Navigation responsive**: Menu adaptatif selon la taille d'écran

## 🧪 Tests

### Structure des Tests
```
__tests__/
├── components/             # Tests des composants
├── lib/                    # Tests des utilitaires
└── integration/            # Tests d'intégration
```

### Commandes de Test
```bash
npm run test               # Lance tous les tests
npm run test:watch        # Mode watch
npm run test:coverage     # Avec couverture de code
```

## 🚀 Déploiement

### Vercel (Recommandé)
1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez automatiquement à chaque push

### Variables d'Environnement Requises
```bash
# Base de données
DATABASE_URL=
REDIS_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# APIs externes
ANTHROPIC_API_KEY=
DEEPGRAM_API_KEY=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## 📚 Ressources

### Documentation
- [Next.js 14](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Supabase](https://supabase.com/docs)
- [Stripe](https://stripe.com/docs)

### Outils de Développement
- **VS Code Extensions**:
  - TypeScript Importer
  - Tailwind CSS IntelliSense
  - Prettier
  - ESLint

## 🤝 Contribution

### Standards de Code
- **TypeScript strict**: Tous les composants doivent être typés
- **ESLint**: Respect des règles de linting
- **Prettier**: Formatage automatique
- **Tests**: Couverture minimale de 80%

### Workflow Git
1. Créer une branche feature : `git checkout -b feature/nom-feature`
2. Développer et tester
3. Commiter avec un message clair : `git commit -m "feat: ajoute la fonctionnalité X"`
4. Pousser et créer une Pull Request

### Messages de Commit
Format : `type(scope): description`

Types :
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage
- `refactor`: Refactoring
- `test`: Tests
- `chore`: Maintenance

## 🐛 Dépannage

### Problèmes Courants

#### Erreur de Port
```bash
# Si le port 3000 est occupé
lsof -i :3000
kill -9 <PID>
```

#### Dépendances Corrompues
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Erreur TypeScript
```bash
npm run type-check
# Vérifier les erreurs dans la console
```

#### Erreur Tailwind
```bash
# Vérifier que PostCSS est configuré
npm run build
```

## 📞 Support

- **Issues GitHub**: Pour les bugs et demandes de fonctionnalités
- **Discussions GitHub**: Pour les questions générales
- **Email**: support@cmpa-podcast-manager.com

---

*Ce guide est un document vivant qui sera mis à jour au fur et à mesure de l'évolution du projet.*
