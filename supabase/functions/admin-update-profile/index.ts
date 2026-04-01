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

    const body = await req.json()
    const { 
      targetUserId, 
      email, 
      firstName, 
      lastName, 
      plan, 
      status, 
      phoneCode, 
      phone, 
      country 
    } = body

    if (!targetUserId) {
      throw new Error('targetUserId is required')
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
    
    // Check if caller is admin
    const { data: callerProfile, error: callerError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      
    if (callerError || !callerProfile || callerProfile.role !== 'admin') {
      throw new Error('Forbidden: Caller is not an admin')
    }

    // 1. Update Auth user if email provided
    if (email) {
      // Pass email_confirm: true so it doesn't await confirmation
      const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
        targetUserId,
        { email: email, email_confirm: true }
      )
      if (updateAuthError) {
        console.warn("Auth update email failed:", updateAuthError.message)
        throw new Error('Failed to update email in auth system: ' + updateAuthError.message)
      }
    }

    // 2. Update Profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
          first_name: firstName,
          last_name: lastName,
          email: email, 
          plan: plan,
          status: status,
          phone_code: phoneCode,
          phone_number: phone,
          country: country,
          updated_at: new Date().toISOString()
      })
      .eq('id', targetUserId)

    if (profileError) {
        console.warn("Profile update failed:", profileError.message)
        throw new Error('Failed to update profile: ' + profileError.message)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Profile updated successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error('admin-update-profile error:', error)
    return new Response(
      JSON.stringify({ _isError: true, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 } 
    )
  }
})
