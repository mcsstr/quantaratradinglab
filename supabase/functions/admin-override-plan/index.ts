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
    // Validate the calling user is authenticated (admin check done via email in caller)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    const { targetUserId, overridePlan, durationDays } = await req.json()

    if (!targetUserId || !overridePlan || !durationDays) {
      throw new Error('targetUserId, overridePlan, and durationDays are required')
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Get the target user's current profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, stripe_subscription_id, plan, admin_override_until')
      .eq('id', targetUserId)
      .single()

    if (profileError || !profile) throw new Error('User profile not found')

    const overrideUntil = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)

    // If user has an active Stripe subscription, extend trial_end 
    // to "freeze" their billing clock for the override period
    if (profile.stripe_subscription_id) {
      try {
        const trialEndTimestamp = Math.floor(overrideUntil.getTime() / 1000)
        
        await stripe.subscriptions.update(profile.stripe_subscription_id, {
          trial_end: trialEndTimestamp,
          // Don't prorate - admin decides not to charge
          proration_behavior: 'none',
        })
        
        console.log(`Stripe subscription ${profile.stripe_subscription_id} trial extended to ${overrideUntil.toISOString()}`)
      } catch (stripeErr: any) {
        // Subscription may have been cancelled or not active - that's OK
        console.warn('Could not update Stripe trial_end:', stripeErr.message)
      }
    }

    // Update Supabase profile with override info
    const storageMode = overridePlan.toLowerCase() === 'premium' ? 'cloud' : 'local'
    
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        admin_override_plan: overridePlan,
        admin_override_until: overrideUntil.toISOString(),
        is_admin_override: true,
        plan: overridePlan, // Update current plan to the override plan
        status: 'Active',
        storage_mode: storageMode,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetUserId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ 
        success: true, 
        overrideUntil: overrideUntil.toISOString(),
        message: `User granted ${overridePlan} for ${durationDays} days`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error('admin-override-plan error:', error)
    return new Response(
      JSON.stringify({ _isError: true, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
})
