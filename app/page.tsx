import Link from "next/link";
import { Mic, Brain, Share2, Zap, CheckCircle, ArrowRight, Star, Clock, Users, Sparkles, Play, BarChart3, Calendar, MessageSquare, FileText, Video, Music } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Mic className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Podcast Manager</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Fonctionnalités
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Tarifs
              </Link>
              <Link href="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Connexion
              </Link>
              <Link href="/auth" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-105">
                Commencer
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="mx-auto max-w-5xl">
            {/* Badge */}
            <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-8">
              <Sparkles className="h-4 w-4 mr-2" />
              Nouveau : Génération IA de contenu multi-plateforme
            </div>
            
            <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-7xl lg:text-8xl">
              Transformez vos{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                podcasts
              </span>{" "}
              en{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                contenu multi-plateforme
              </span>
            </h1>
            
            <p className="mt-8 text-xl leading-8 text-muted-foreground max-w-3xl mx-auto">
              Utilisez l'intelligence artificielle de pointe pour transcrire automatiquement vos podcasts, 
              générer des descriptions optimisées et créer du contenu engageant pour vos réseaux sociaux, 
              blog, YouTube et Spotify.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth"
                className="group rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105 inline-flex items-center gap-3"
              >
                <span>Essai gratuit 7 jours</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#demo"
                className="group text-lg font-semibold leading-6 text-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
              >
                <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Voir la démo
              </Link>
            </div>
            
            {/* Social proof */}
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>500+ créateurs</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span>4.9/5 étoiles</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>24h/7j support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="container mx-auto">
          <div className="mx-auto max-w-3xl text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Tout ce dont vous avez besoin pour{" "}
              <span className="text-primary">révolutionner</span> vos podcasts
            </h2>
            <p className="mt-6 text-xl leading-8 text-muted-foreground">
              Une suite complète d'outils alimentés par l'IA pour transformer votre workflow de création de contenu 
              et maximiser votre impact sur toutes les plateformes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Transcription IA */}
            <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Mic className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">Transcription IA</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Transcription automatique haute qualité avec Deepgram Nova 2. Support de tous les formats audio 
                  et détection automatique des locuteurs.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Précision 99%+
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Support multi-langues
                  </li>
                </ul>
              </div>
            </div>

            {/* Amélioration automatique */}
            <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Brain className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">Amélioration automatique</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Nettoyage automatique, correction des erreurs, formatage intelligent et structuration 
                  du contenu pour une lecture optimale.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Correction automatique
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Formatage intelligent
                  </li>
                </ul>
              </div>
            </div>

            {/* Génération de contenu */}
            <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">Génération de contenu</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Descriptions optimisées pour blog, YouTube, Spotify et réseaux sociaux avec Claude 3.5 Sonnet. 
                  Contenu adapté à chaque plateforme.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Claude 3.5 Sonnet
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Optimisation SEO
                  </li>
                </ul>
              </div>
            </div>

            {/* Publication automatique */}
            <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Share2 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">Publication automatique</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Publication automatique sur Twitter/X, LinkedIn et autres plateformes. 
                  Planification intelligente et gestion des hashtags.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Planification automatique
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Multi-plateformes
                  </li>
                </ul>
              </div>
            </div>

            {/* Gestion des épisodes */}
            <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <CheckCircle className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">Gestion des épisodes</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Interface intuitive pour organiser, éditer et suivre tous vos épisodes. 
                  Workflow optimisé et collaboration en équipe.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Interface intuitive
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Collaboration équipe
                  </li>
                </ul>
              </div>
            </div>

            {/* Analytics et insights */}
            <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <BarChart3 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">Analytics et insights</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Suivi des performances, métriques d'engagement et insights pour optimiser votre contenu. 
                  Rapports détaillés et recommandations.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Métriques détaillées
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Recommandations IA
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="mx-auto max-w-3xl text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Tarifs simples et transparents
            </h2>
            <p className="mt-6 text-xl leading-8 text-muted-foreground">
              L'abonnement inclut un essai gratuit de 7 jours
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
            {/* Plan Premium */}
            <div className="relative rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10 p-8 shadow-lg">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="inline-flex items-center rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
                  Recommandé
                </span>
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground">Premium</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary">49€</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
                <p className="mt-2 text-muted-foreground">Pour les créateurs sérieux</p>
              </div>
              
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-foreground font-medium">Épisodes illimités</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-foreground font-medium">Transcription IA avancée</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-foreground font-medium">Génération de contenu IA</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-foreground font-medium">Publication automatique</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-foreground font-medium">Analytics avancés</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-foreground font-medium">Support prioritaire</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-foreground font-medium">Intégrations avancées</span>
                </li>
              </ul>
              
              <div className="mt-8">
                <Link
                  href="/auth"
                  className="w-full inline-flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Commencer l'essai gratuit
                </Link>
              </div>
              
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Essai gratuit de 7 jours • Annulation à tout moment
              </p>
            </div>
          </div>
          
          {/* FAQ Pricing */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-center text-foreground mb-8">
              Questions fréquentes sur l'abonnement
            </h3>
            <div className="space-y-6">
              <div className="border border-border rounded-lg p-6">
                <h4 className="font-semibold text-foreground mb-2">Puis-je annuler mon abonnement à tout moment ?</h4>
                <p className="text-muted-foreground">Oui, vous pouvez annuler votre abonnement à tout moment depuis la page configuration.</p>
              </div>
              <div className="border border-border rounded-lg p-6">
                <h4 className="font-semibold text-foreground mb-2">L'essai gratuit nécessite-t-il une carte de crédit ?</h4>
                <p className="text-muted-foreground">Non, l'essai gratuit de 7 jours ne nécessite aucune carte de crédit. Vous pouvez tester toutes les fonctionnalités premium gratuitement.</p>
              </div>
              <div className="border border-border rounded-lg p-6">
                <h4 className="font-semibold text-foreground mb-2">Y a-t-il des frais cachés ?</h4>
                <p className="text-muted-foreground">Non, nos tarifs sont transparents. Le prix affiché est le prix final, sans frais cachés ni surcoûts.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5">
        <div className="container mx-auto text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Prêt à révolutionner votre workflow de podcasts ?
            </h2>
            <p className="mt-6 text-xl leading-8 text-muted-foreground">
              Rejoignez des centaines de créateurs qui utilisent déjà Podcast Manager pour automatiser 
              leur production de contenu et maximiser leur impact sur toutes les plateformes.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth"
                className="group rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105 inline-flex items-center gap-3"
              >
                <span>Commencer l'essai gratuit</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="text-lg font-semibold leading-6 text-foreground hover:text-primary transition-colors"
              >
                Découvrir les fonctionnalités
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Aucune carte de crédit requise • Annulation à tout moment • Support 24h/7j
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Mic className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">Podcast Manager</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                La solution complète pour la gestion et le traitement automatisé de vos podcasts. 
                Transformez votre contenu audio en contenu multi-plateforme avec l'IA.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Produit</h3>
              <ul className="space-y-3">
                <li><Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Fonctionnalités</Link></li>
                <li><Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Tarifs</Link></li>
                <li><Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link href="/api" className="text-sm text-muted-foreground hover:text-foreground transition-colors">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-3">
                <li><Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Centre d'aide</Link></li>
                <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link href="/status" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Statut</Link></li>
                <li><Link href="/community" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Communauté</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Légal</h3>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Confidentialité</Link></li>
                <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Conditions</Link></li>
                <li><Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cookies</Link></li>
                <li><Link href="/security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sécurité</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 border-t border-border/40 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Podcast Manager. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
