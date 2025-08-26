'use client';

import { useSubscription } from '@/hooks/use-subscription';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function SubscriptionCTA() {
  const { subscription, isLoading } = useSubscription();

  // Ne pas afficher si l'utilisateur a déjà un abonnement actif
  if (isLoading || subscription?.isActive) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            🚀 Débloquez tout le potentiel de votre podcast
          </h3>
          <p className="text-blue-700 text-sm">
            Accédez à la transcription IA, génération de contenu et publication automatique
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <a href="/subscription">
              Voir les plans
            </a>
          </Button>
          
          <Button
            variant="outline"
            asChild
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <a href="/subscription">
              Essai gratuit 7 jours
            </a>
          </Button>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-blue-200">
        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-blue-600">
          <span className="flex items-center">
            <span className="text-green-500 mr-1">✓</span>
            Transcription illimitée
          </span>
          <span className="flex items-center">
            <span className="text-green-500 mr-1">✓</span>
            Génération IA avancée
          </span>
          <span className="flex items-center">
            <span className="text-green-500 mr-1">✓</span>
            Publication automatique
          </span>
        </div>
      </div>
    </Card>
  );
}
