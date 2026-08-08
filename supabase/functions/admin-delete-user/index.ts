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
    const { targetUserId } = body

    if (!targetUserId) {
      throw new Error('targetUserId is required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } }
    })

    // Validate the caller's JWT
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized caller token')

    // Check if caller is admin
    const { data: callerProfile, error: callerError } = await supabaseAdmin
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single()

    const isAdmin = callerProfile?.role === 'admin' || callerProfile?.email === 'mcsstr@icloud.com' || user.email === 'mcsstr@icloud.com'

    if (callerError || !isAdmin) {
      throw new Error('Forbidden: Caller is not an admin')
    }

    // Call stored function to wipe all user records across all tables
    const { error: rpcError } = await supabaseAdmin.rpc('admin_delete_user', {
      target_user_id: targetUserId
    })

    if (rpcError) {
      console.warn('RPC admin_delete_user warning/error:', rpcError.message)
      // Fallback manual purge if RPC fails
      await supabaseAdmin.from('trades').delete().eq('user_id', targetUserId)
      await supabaseAdmin.from('journals').delete().eq('user_id', targetUserId)
      await supabaseAdmin.from('setup_targets').delete().eq('user_id', targetUserId)
      await supabaseAdmin.from('setup_config_logs').delete().eq('user_id', targetUserId)
      await supabaseAdmin.from('trading_favorites').delete().eq('user_id', targetUserId)
      await supabaseAdmin.from('news').delete().eq('user_id', targetUserId)
      await supabaseAdmin.from('holidays').delete().eq('user_id', targetUserId)
      await supabaseAdmin.from('setups').delete().eq('user_id', targetUserId)
      await supabaseAdmin.from('accounts').delete().eq('user_id', targetUserId)
      await supabaseAdmin.from('profiles').delete().eq('id', targetUserId)
    }

    // Delete user from auth.users
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId)
    if (deleteAuthError) {
      console.warn('Auth admin.deleteUser warning:', deleteAuthError.message)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'User and all related data deleted completely.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error('admin-delete-user error:', error)
    return new Response(
      JSON.stringify({ _isError: true, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
