import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  // Log temporaire pour debug en production
  console.log('=== WEBHOOK DEBUG ===');
  console.log('Headers reçus:', Object.fromEntries(headersList.entries()));
  console.log('Signature reçue:', signature);
  console.log('Body length:', body.length);
  console.log('STRIPE_WEBHOOK_SECRET configuré:', !!process.env.STRIPE_WEBHOOK_SECRET);
  console.log('========================');

  if (!signature) {
    console.error('Missing stripe signature header');
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log('✅ Webhook signature verified successfully');
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    console.error('Signature reçue:', signature);
    console.error('Secret configuré:', process.env.STRIPE_WEBHOOK_SECRET ? 'OUI' : 'NON');
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeletion(deletedSubscription);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(failedInvoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id;
  if (!userId) return;

  // Récupérer la subscription complète depuis Stripe pour avoir toutes les propriétés
  let fullSubscription: Stripe.Subscription;
  try {
    fullSubscription = await stripe.subscriptions.retrieve(subscription.id);
  } catch (error) {
    console.error('Error retrieving full subscription:', error);
    return;
  }

  // Gérer tous les statuts possibles de Stripe
  let status: string;
  let tier: string;

  switch (fullSubscription.status) {
    case 'trialing':
      status = 'trialing';
      tier = 'pro';
      break;
    case 'active':
      status = 'active';
      tier = 'pro';
      break;
    case 'past_due':
      status = 'past_due';
      tier = 'pro';
      break;
    case 'canceled':
      status = 'canceled';
      tier = 'free';
      break;
    case 'unpaid':
      status = 'unpaid';
      tier = 'free';
      break;
    case 'incomplete':
      status = 'incomplete';
      tier = 'free';
      break;
    case 'incomplete_expired':
      status = 'incomplete_expired';
      tier = 'free';
      break;
    default:
      status = fullSubscription.status;
      tier = 'free';
  }

  // Validation des propriétés requises
  if (!fullSubscription.current_period_start || !fullSubscription.current_period_end) {
    console.error('Missing required subscription properties:', {
      id: fullSubscription.id,
      current_period_start: fullSubscription.current_period_start,
      current_period_end: fullSubscription.current_period_end
    });
    return;
  }

  // Mettre à jour ou créer l'abonnement dans Supabase
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_subscription_id: fullSubscription.id,
      stripe_price_id: fullSubscription.items.data[0].price.id,
      status: status,
      current_period_start: new Date(fullSubscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(fullSubscription.current_period_end * 1000).toISOString(),
      trial_start: fullSubscription.trial_start 
        ? new Date(fullSubscription.trial_start * 1000).toISOString() 
        : null,
      trial_end: fullSubscription.trial_end 
        ? new Date(fullSubscription.trial_end * 1000).toISOString() 
        : null,
    });

  if (error) {
    console.error('Error updating subscription:', error);
    return;
  }

  // Mettre à jour le statut de l'utilisateur
  await supabase
    .from('users')
    .update({
      subscription_status: status,
      subscription_tier: tier,
    })
    .eq('id', userId);
}

async function handleSubscriptionDeletion(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id;
  if (!userId) return;

  console.log(`Handling subscription deletion for user ${userId}, subscription ${subscription.id}`);

  // Mettre à jour le statut de l'utilisateur
  const { error: userError } = await supabase
    .from('users')
    .update({
      subscription_status: 'canceled',
      subscription_tier: 'free',
    })
    .eq('id', userId);

  if (userError) {
    console.error('Error updating user subscription status:', userError);
  }

  // Mettre à jour le statut de l'abonnement dans la table subscriptions
  const { error: subError } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
    })
    .eq('user_id', userId)
    .eq('stripe_subscription_id', subscription.id);

  if (subError) {
    console.error('Error updating subscription status:', subError);
  }

  console.log(`Successfully updated subscription status to canceled for user ${userId}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    );
    await handleSubscriptionChange(subscription);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    );
    await handleSubscriptionChange(subscription);
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log(`Handling checkout session completed: ${session.id}`);
  
  // Vérifier que c'est une session de subscription
  if (session.mode !== 'subscription') {
    console.log('Session is not a subscription, skipping');
    return;
  }

  const userId = session.metadata?.supabase_user_id;
  if (!userId) {
    console.error('No supabase_user_id found in session metadata');
    return;
  }

  // Récupérer la subscription depuis Stripe
  if (!session.subscription) {
    console.error('No subscription found in session');
    return;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    console.log(`Retrieved subscription: ${subscription.id} for user: ${userId}`);
    
    // Traiter la subscription comme un changement normal
    await handleSubscriptionChange(subscription);
    
    console.log(`Successfully processed checkout session for user ${userId}`);
  } catch (error) {
    console.error('Error processing checkout session:', error);
  }
}
