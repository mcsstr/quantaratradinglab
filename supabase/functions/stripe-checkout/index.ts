import Stripe from 'npm:stripe@^14.21.0'
import { createClient } from 'npm:@supabase/supabase-js@^2.42.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { priceId } = await req.json()
    if (!priceId) throw new Error('priceId is required')

    // Auth: extract JWT from frontend call
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
      httpClient: Stripe.createFetchHttpClient(),
    })

    const origin = req.headers.get('origin') || 'http://localhost:5173'

    // Fetch the user's existing profile for customer ID & existing subscription
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id, stripe_subscription_id, email, plan')
      .eq('id', user.id)
      .single()

    // ===================================================================
    // PHASE 6: Immediate billing — cancel existing subscription NOW
    // before creating a new one, so no prorations are applied.
    // The user always pays 100% of the new plan from day 1.
    // ===================================================================
    if (profile?.stripe_subscription_id) {
      try {
        const existingSub = await stripe.subscriptions.retrieve(profile.stripe_subscription_id)
        if (existingSub && existingSub.status !== 'canceled') {
          // Cancel immediately — do not wait for period end
          await stripe.subscriptions.cancel(profile.stripe_subscription_id, {
            // Prorate to $0 credit so user does not get a refund
            // (they are switching plans by choice)
            prorate: false,
          })
          console.log(`Cancelled existing subscription ${profile.stripe_subscription_id} for plan change`)

          // Clear the old subscription ID from the profile so webhook doesn't get confused
          await supabaseAdmin
            .from('profiles')
            .update({ stripe_subscription_id: null, stripe_price_id: null })
            .eq('id', user.id)
        }
      } catch (stripeErr: any) {
        // If the sub was already cancelled or not found, just continue
        console.warn('Could not cancel old subscription (may already be cancelled):', stripeErr.message)
      }
    }

    // Build checkout session config
    const sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${origin}/loading?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancel`,
      client_reference_id: user.id, // Webhook uses this to find the user
    }

    if (profile?.stripe_customer_id) {
      sessionConfig.customer = profile.stripe_customer_id
    } else if (profile?.email || user.email) {
      sessionConfig.customer_email = profile?.email || user.email
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error('Erro no Checkout:', error)
    return new Response(
      JSON.stringify({ _isError: true, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
})
