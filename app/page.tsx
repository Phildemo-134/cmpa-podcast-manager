import Link from "next/link";
import { Mic, Brain, Share2, Zap, CheckCircle, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Mic className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">CMPA</span>
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
              <Link href="/auth" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                Commencer
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Transformez vos{" "}
              <span className="text-primary">podcasts</span> en{" "}
              <span className="text-primary">contenu multi-plateforme</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Utilisez l'intelligence artificielle pour transcrire automatiquement vos podcasts, 
              générer des descriptions optimisées et créer du contenu pour vos réseaux sociaux, 
              blog, YouTube et Spotify.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/auth"
                className="rounded-md bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
              >
                Essai gratuit 7 jours
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#demo"
                className="text-lg font-semibold leading-6 text-foreground hover:text-primary transition-colors"
              >
                Voir la démo <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="container mx-auto">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Tout ce dont vous avez besoin pour gérer vos podcasts
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Une suite complète d'outils alimentés par l'IA pour transformer votre workflow de création de contenu.
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Transcription IA */}
            <div className="relative overflow-hidden rounded-lg border border-border bg-card p-8 shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">Transcription IA</h3>
              <p className="mt-2 text-muted-foreground">
                Transcription automatique haute qualité avec Deepgram Nova 2. Support de tous les formats audio.
              </p>
            </div>

            {/* Amélioration automatique */}
            <div className="relative overflow-hidden rounded-lg border border-border bg-card p-8 shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Brain className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">Amélioration automatique</h3>
              <p className="mt-2 text-muted-foreground">
                Nettoyage automatique, correction des erreurs et formatage intelligent du contenu.
              </p>
            </div>

            {/* Génération de contenu */}
            <div className="relative overflow-hidden rounded-lg border border-border bg-card p-8 shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <Zap className="h-6 w-6 text-success" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">Génération de contenu</h3>
              <p className="mt-2 text-muted-foreground">
                Descriptions optimisées pour blog, YouTube, Spotify et réseaux sociaux avec Claude 3.5 Sonnet.
              </p>
            </div>

            {/* Publication automatique */}
            <div className="relative overflow-hidden rounded-lg border border-border bg-card p-8 shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                <Share2 className="h-6 w-6 text-warning" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">Publication automatique</h3>
              <p className="mt-2 text-muted-foreground">
                Publication automatique sur Twitter/X, LinkedIn et autres plateformes.
              </p>
            </div>

            {/* Gestion des épisodes */}
            <div className="relative overflow-hidden rounded-lg border border-border bg-card p-8 shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <CheckCircle className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">Gestion des épisodes</h3>
              <p className="mt-2 text-muted-foreground">
                Interface intuitive pour organiser, éditer et suivre tous vos épisodes.
              </p>
            </div>

            {/* Analytics et insights */}
            <div className="relative overflow-hidden rounded-lg border border-border bg-card p-8 shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">Analytics et insights</h3>
              <p className="mt-2 text-muted-foreground">
                Suivi des performances, métriques d'engagement et insights pour optimiser votre contenu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Prêt à transformer votre workflow de podcasts ?
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Rejoignez des centaines de créateurs qui utilisent déjà CMPA pour automatiser leur production de contenu.
            </p>
            <div className="mt-8">
              <Link
                href="/auth/register"
                className="rounded-md bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
              >
                Commencer l'essai gratuit
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Aucune carte de crédit requise • Annulation à tout moment
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Mic className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">CMPA</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                La solution complète pour la gestion et le traitement automatisé de vos podcasts.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-foreground">Produit</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Fonctionnalités</Link></li>
                <li><Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Tarifs</Link></li>
                <li><Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Documentation</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-foreground">Support</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Centre d'aide</Link></li>
                <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link href="/status" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Statut</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-foreground">Légal</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Confidentialité</Link></li>
                <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Conditions</Link></li>
                <li><Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 border-t border-border/40 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 CMPA Podcast Manager. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
