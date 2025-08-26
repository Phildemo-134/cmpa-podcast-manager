'use client';

import { useSubscription } from '@/hooks/use-subscription';

interface SubscriptionBadgeProps {
  showDetails?: boolean;
  className?: string;
}

export function SubscriptionBadge({ showDetails = false, className = '' }: SubscriptionBadgeProps) {
  const { subscription, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}>
        <div className="animate-pulse bg-gray-300 rounded-full h-2 w-2 mr-1"></div>
        Chargement...
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  const getBadgeConfig = () => {
    if (subscription.isTrialing) {
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
        icon: '🎁',
        label: 'Essai gratuit',
      };
    }

    if (subscription.isActive) {
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        icon: '✨',
        label: 'Pro',
      };
    }

    return {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200',
      icon: '📱',
      label: 'Gratuit',
    };
  };

  const config = getBadgeConfig();

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text} ${config.border} border ${className}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
      {showDetails && subscription.isTrialing && subscription.trialEnd && (
        <span className="ml-2 text-xs opacity-75">
          (jusqu'au {new Date(subscription.trialEnd).toLocaleDateString('fr-FR')})
        </span>
      )}
    </div>
  );
}
