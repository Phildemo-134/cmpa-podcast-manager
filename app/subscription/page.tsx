'use client';

import { useEffect, useState } from 'react';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { Paywall } from '@/components/subscription/paywall';
import { SubscriptionManager } from '@/components/subscription/subscription-manager';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UserSubscription {
  subscription_status: string;
  subscription_tier: string;
  trial_end?: string;
  current_period_end?: string;
}

export default function SubscriptionPage() {
  const { user } = useSupabaseAuth();
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserSubscription() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('subscription_status, subscription_tier')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user subscription:', error);
        } else {
          setUserSubscription(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserSubscription();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Veuillez vous connecter pour accéder à cette page.</p>
      </div>
    );
  }

  const hasActiveSubscription = userSubscription?.subscription_status === 'active' || 
                              userSubscription?.subscription_status === 'trialing';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: 'Plans & Abonnement' }]} className="mb-6" />
        {hasActiveSubscription ? (
          <SubscriptionManager
            subscriptionStatus={userSubscription?.subscription_status}
            subscriptionTier={userSubscription?.subscription_tier}
            currentPeriodEnd={userSubscription?.current_period_end}
          />
        ) : (
          <Paywall 
            onSuccess={() => {
              // Recharger la page après un succès
              window.location.reload();
            }}
            onCancel={() => {
              // Rediriger vers le dashboard
              window.location.href = '/dashboard';
            }}
          />
        )}
      </div>
    </div>
  );
}
