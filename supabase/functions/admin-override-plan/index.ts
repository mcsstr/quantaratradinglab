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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    const { targetUserId, overridePlan, durationValue, durationUnit } = await req.json()

    if (!targetUserId || !overridePlan || durationValue === undefined || !durationUnit) {
      throw new Error('targetUserId, overridePlan, durationValue, and durationUnit are required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } }
    })

    // Validate the caller's JWT and check if they are an admin
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized caller token')
    
    const { data: callerProfile, error: callerError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      
    if (callerError || !callerProfile || callerProfile.role !== 'admin') {
      throw new Error('Forbidden: Caller is not an admin')
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
      httpClient: Stripe.createFetchHttpClient(),
    })

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, stripe_subscription_id, plan')
      .eq('id', targetUserId)
      .single()

    if (profileError || !profile) throw new Error('User profile not found')

    const now = new Date();
    const val = Number(durationValue);
    switch(durationUnit.toLowerCase()) {
      case 'minutes': now.setMinutes(now.getMinutes() + val); break;
      case 'hours': now.setHours(now.getHours() + val); break;
      case 'days': now.setDate(now.getDate() + val); break;
      case 'months': now.setMonth(now.getMonth() + val); break;
      case 'years': now.setFullYear(now.getFullYear() + val); break;
      default: now.setDate(now.getDate() + val); break;
    }
    const overrideUntil = now;

    if (profile.stripe_subscription_id) {
      try {
        const trialEndTimestamp = Math.floor(overrideUntil.getTime() / 1000)
        
        await stripe.subscriptions.update(profile.stripe_subscription_id, {
          trial_end: trialEndTimestamp,
          proration_behavior: 'none',
        })
        console.log(`Stripe subscription ${profile.stripe_subscription_id} trial extended to ${overrideUntil.toISOString()}`)
      } catch (stripeErr: any) {
        console.warn('Could not update Stripe trial_end:', stripeErr.message)
      }
    }

    const storageMode = overridePlan.toLowerCase() === 'premium' ? 'cloud' : 'local'
    
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        admin_override_plan: overridePlan,
        admin_override_until: overrideUntil.toISOString(),
        is_admin_override: true,
        trial_end: overrideUntil.toISOString(), // CRUCIAL for App protection
        plan: overridePlan.toLowerCase(), 
        status: 'active',
        storage_mode: storageMode,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetUserId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ 
        success: true, 
        overrideUntil: overrideUntil.toISOString(),
        message: `User granted ${overridePlan} for ${val} ${durationUnit}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error('admin-override-plan error:', error)
    return new Response(
      JSON.stringify({ _isError: true, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 } // using 400 for errors so the frontend catches it easily
    )
  }
})
