'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';

export function SubscriptionNotification() {
  const searchParams = useSearchParams();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'canceled' | null>(null);

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      setNotificationType('success');
      setShowNotification(true);
    } else if (canceled === 'true') {
      setNotificationType('canceled');
      setShowNotification(true);
    }
  }, [searchParams]);

  if (!showNotification) return null;

  const handleClose = () => {
    setShowNotification(false);
    // Nettoyer l'URL
    const url = new URL(window.location.href);
    url.searchParams.delete('success');
    url.searchParams.delete('canceled');
    window.history.replaceState({}, '', url.toString());
  };

  if (notificationType === 'success') {
    return (
      <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
        <Card className="p-4 bg-green-50 border-green-200 max-w-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-green-600 text-xl">🎉</span>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-green-800">
                Abonnement activé avec succès !
              </h3>
              <p className="mt-1 text-sm text-green-700">
                Votre essai gratuit de 7 jours a commencé. Profitez de toutes les fonctionnalités Pro !
              </p>
            </div>
            <button
              onClick={handleClose}
              className="ml-3 text-green-400 hover:text-green-600"
            >
              <span className="sr-only">Fermer</span>
              ×
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (notificationType === 'canceled') {
    return (
      <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
        <Card className="p-4 bg-yellow-50 border-yellow-200 max-w-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-yellow-600 text-xl">ℹ️</span>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Abonnement annulé
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Vous pouvez toujours vous abonner plus tard depuis votre tableau de bord.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="ml-3 text-yellow-400 hover:text-yellow-600"
            >
              <span className="sr-only">Fermer</span>
              ×
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
