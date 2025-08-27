'use client';

import { useState } from 'react';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaywallProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function Paywall({ onSuccess, onCancel }: PaywallProps) {
  const { user } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
        }),
      });

      const { sessionId, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      const stripe = await stripePromise;
      if (stripe) {
        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId,
        });

        if (stripeError) {
          throw stripeError;
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    '🎧 Transcription illimitée avec Deepgram Nova 2',
    '🤖 Génération de contenu IA avancée (Claude 3.5 Sonnet)',
    '📱 Contenu optimisé LinkedIn et Twitter/X',
    '📊 Export en multiple formats',
    '🎯 Support prioritaire',
    '📈 Analytics détaillés',
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Débloquez tout le potentiel de votre podcast
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Transformez vos enregistrements audio en contenu optimisé pour toutes les plateformes 
          grâce à l'intelligence artificielle. Un abonnement est requis pour accéder à l'application.
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-8">
        {/* Plan Pro */}
        <Card className="p-6 border-2 border-blue-500 bg-blue-50 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
              Plan Premium
            </span>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Plan Pro
            </h3>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              49€<span className="text-lg text-gray-500">/mois</span>
            </div>
            <div className="text-sm text-green-600 font-medium mb-4">
              🎁 7 jours d'essai gratuit
            </div>
            <ul className="text-left space-y-3 mb-6">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <span className="text-blue-500 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleSubscribe}
              disabled={isLoading}
            >
              {isLoading ? 'Chargement...' : 'Commencer l\'essai gratuit'}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Annulez à tout moment. Pas de frais cachés.
            </p>
          </div>
        </Card>
      </div>

      {/* Garanties */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center">
            <span className="text-green-500 mr-2">🔒</span>
            Paiement sécurisé
          </div>
          <div className="flex items-center">
            <span className="text-green-500 mr-2">💳</span>
            Annulation à tout moment
          </div>
          <div className="flex items-center">
            <span className="text-green-500 mr-2">🎯</span>
            Satisfaction garantie
          </div>
        </div>
      </div>
    </div>
  );
}
