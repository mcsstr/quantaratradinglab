import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import Stripe from "https://esm.sh/stripe@14.21.0"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('Stripe-Signature')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    if (!signature || !webhookSecret) {
      return new Response('Missing signature or secret', { status: 400 })
    }

    const body = await req.text()
    
    // Validate Stripe payload signature
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret,
        undefined,
        cryptoProvider
      )
    } catch (err: any) {
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Processing event: ${event.type}`)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Pega o supabase_user_id ou do metadata, ou do client_reference_id (graças ao seu novo checkout)
        const userId = session.metadata?.supabase_user_id || session.client_reference_id
        
        if (userId) {
          // Identify plan from price or metadata
          const priceId = session.line_items?.data[0]?.price?.id || ''
          let planName = 'Premium'
          if (priceId) {
             // Opcional: Inferir nome consoante o ID do preço, ou colocar fixo até a db atualizar.
             // O próximo evento (subscription.updated) vai consolidar isto.
          }

          // Atualizar o profile com o Customer ID e colocar Active
          await supabaseAdmin.from('profiles').update({
            stripe_customer_id: session.customer as string,
            status: 'Active',
            plan: planName,
          }).eq('id', userId)
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        let userId = subscription.metadata?.supabase_user_id
        
        // Se a subscrição não tiver metadata, vamos procurar na Base de Dados usando o stripe_customer_id
        if (!userId && subscription.customer) {
           const { data: profile } = await supabaseAdmin
              .from('profiles')
              .select('id')
              .eq('stripe_customer_id', subscription.customer)
              .single()
              
           if (profile) userId = profile.id;
        }

        if (userId) {
          const price = subscription.items.data[0].price
          // Tentar inferir o nome do plano se houver metadata, senão Premium
          const planName = price.id.includes('pro') ? 'Pro' : price.id.includes('premium') ? 'Premium' : 'Premium'
          const interval = price.recurring?.interval === 'year' ? 'yearly' : 'monthly'
          const expiresAt = new Date(subscription.current_period_end * 1000).toISOString()
          const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null
          
          let subStatus = 'Active'
          if (subscription.status === 'past_due' || subscription.status === 'canceled' || subscription.status === 'unpaid') {
              subStatus = 'Inactive'
          }

          await supabaseAdmin.from('profiles').update({
            stripe_subscription_id: subscription.id,
            stripe_price_id: price.id,
            plan: planName,
            status: subStatus,
            plan_expires_at: expiresAt,
            billing_interval: interval,
            trial_end: trialEnd
          }).eq('id', userId)
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        let userId = subscription.metadata?.supabase_user_id
        
        if (!userId && subscription.customer) {
           const { data: profile } = await supabaseAdmin.from('profiles').select('id').eq('stripe_customer_id', subscription.customer).single()
           if (profile) userId = profile.id;
        }
        
        if (userId) {
          await supabaseAdmin.from('profiles').update({
            status: 'Inactive',
            plan: 'Free' // Revert to free on cancel
          }).eq('id', userId)
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        // Find user by customer ID
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          await supabaseAdmin.from('profiles').update({
            status: 'Inactive' // Require payment update
          }).eq('id', profile.id)
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  } catch (err: any) {
    console.error(`Webhook error: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})