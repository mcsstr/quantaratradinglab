import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Activity, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabase';

type AuthMode = 'login' | 'signup' | 'forgot_password' | 'reset_password';

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | 'apple' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check if user came from a password recovery link or hash
  useEffect(() => {
    const hash = window.location.hash;
    const modeParam = searchParams.get('mode');
    const typeParam = searchParams.get('type');

    if (modeParam === 'reset_password' || typeParam === 'recovery' || hash.includes('type=recovery')) {
      setAuthMode('reset_password');
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setAuthMode('reset_password');
      }
    });

    return () => subscription.unsubscribe();
  }, [searchParams]);

  // Main Email/Password Login or Signup Handler
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let userId: string | null = null;

      if (authMode === 'login') {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        if (authData?.user) userId = authData.user.id;
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/loading`
          }
        });
        if (authError) throw authError;
        if (authData?.user) userId = authData.user.id;

        if (userId) {
          // Fetch free plan trial config
          const { data: freePlan } = await supabase
            .from('plans_config')
            .select('trial_duration_value, trial_duration_unit')
            .eq('id', 'free')
            .maybeSingle();
            
          let trialEndIso: string | null = null;
          if (freePlan && freePlan.trial_duration_value) {
            const now = new Date();
            const val = freePlan.trial_duration_value;
            switch(freePlan.trial_duration_unit) {
              case 'minutes': now.setMinutes(now.getMinutes() + val); break;
              case 'hours': now.setHours(now.getHours() + val); break;
              case 'days': now.setDate(now.getDate() + val); break;
              case 'months': now.setMonth(now.getMonth() + val); break;
              case 'years': now.setFullYear(now.getFullYear() + val); break;
              default: now.setDate(now.getDate() + val); break;
            }
            trialEndIso = now.toISOString();
          }

          // Upsert default profile
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: userId,
              first_name: email.split('@')[0],
              last_name: '',
              email: email,
              plan: '',
              status: 'active',
              trial_end: trialEndIso,
              storage_mode: 'local',
              updated_at: new Date().toISOString()
            });
          if (profileError) console.error('Erro ao salvar perfil:', profileError);
        }

        setSuccessMessage('Conta criada! Se a confirmação de e-mail estiver habilitada no seu Supabase, verifique sua caixa de entrada.');
      }

      if (authMode === 'login' && userId) {
        // Check profile status
        const { data: profileCheck, error: profileError } = await supabase
          .from('profiles')
          .select('id, plan, status, trial_end, storage_mode')
          .eq('id', userId)
          .maybeSingle();

        if (!profileError && profileCheck === null) {
          // Restore profile if missing
          const { data: freePlan } = await supabase
            .from('plans_config')
            .select('trial_duration_value, trial_duration_unit')
            .eq('id', 'free')
            .maybeSingle();
            
          let trialEndIso: string | null = null;
          if (freePlan && freePlan.trial_duration_value) {
            const now = new Date();
            const val = freePlan.trial_duration_value;
            switch(freePlan.trial_duration_unit) {
              case 'minutes': now.setMinutes(now.getMinutes() + val); break;
              case 'hours': now.setHours(now.getHours() + val); break;
              case 'days': now.setDate(now.getDate() + val); break;
              case 'months': now.setMonth(now.getMonth() + val); break;
              case 'years': now.setFullYear(now.getFullYear() + val); break;
              default: now.setDate(now.getDate() + val); break;
            }
            trialEndIso = now.toISOString();
          }

          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: email,
              plan: '',
              status: 'active',
              trial_end: trialEndIso,
              storage_mode: 'local',
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            await supabase.auth.signOut();
            throw new Error('Falha ao restaurar perfil da conta. Tente novamente.');
          }
          
          navigate('/loading');
          return;
        }

        if (profileCheck) {
          const plan = (profileCheck.plan || '').toLowerCase();
          const status = profileCheck.status;
          const trialEnd = profileCheck.trial_end;

          if (!plan || status === 'Suspended' || status === 'Inactive') {
            navigate('/pricing');
            return;
          }

          if (plan === 'free') {
            if (trialEnd && new Date(trialEnd) < new Date()) {
              navigate('/pricing?reason=trial_expired');
              return;
            }
          }
        }
      }
      
      if (authMode === 'signup' && userId) {
        setTimeout(() => {
          navigate('/pricing');
        }, 1500);
        return;
      }
      
      navigate('/loading');
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar autenticação.');
    } finally {
      setLoading(false);
    }
  };

  // Social Login Handler (Google, Facebook, Apple)
  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    setSocialLoading(provider);
    setError(null);
    setSuccessMessage(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/loading`,
          skipBrowserRedirect: true
        }
      });
      
      if (authError) throw authError;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error(`Não foi possível obter a URL de autenticação para ${provider.toUpperCase()}.`);
      }
    } catch (err: any) {
      console.error(`Erro OAuth (${provider}):`, err);
      const msg = err.message || '';
      const provName = provider === 'google' ? 'Google' : provider === 'facebook' ? 'Facebook' : 'Apple';
      
      if (msg.includes('provider is not enabled') || msg.includes('Unsupported provider') || msg.includes('validation_failed')) {
        setError(`O login por ${provName} precisa ser habilitado no painel do seu Supabase em: Authentication → Providers → ${provName}.`);
      } else {
        setError(msg || `Não foi possível conectar com ${provName}.`);
      }
    } finally {
      setSocialLoading(null);
    }
  };

  // Forgot Password Request Handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Por favor, informe seu e-mail.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset_password`
      });
      if (resetError) throw resetError;

      setSuccessMessage('E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada e pasta de spam.');
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar e-mail de redefinição de senha.');
    } finally {
      setLoading(false);
    }
  };

  // New Password Reset Handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Informe a nova senha.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setSuccessMessage('Sua senha foi redefinida com sucesso! Redirecionando...');
      setTimeout(() => {
        navigate('/loading');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir a nova senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans flex flex-col md:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden md:flex flex-1 flex-col justify-center p-12 lg:p-24 relative overflow-hidden">
        {/* Abstract Chart Background */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <svg viewBox="0 0 800 600" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,400 L100,350 L200,450 L300,200 L400,300 L500,100 L600,250 L700,50 L800,150" fill="none" stroke="#00B0F0" strokeWidth="4" />
            <rect x="95" y="300" width="10" height="100" fill="#22c55e" />
            <rect x="195" y="400" width="10" height="80" fill="#ef4444" />
            <rect x="295" y="150" width="10" height="120" fill="#22c55e" />
            <rect x="395" y="250" width="10" height="90" fill="#ef4444" />
            <rect x="495" y="50" width="10" height="150" fill="#22c55e" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-[#00B0F0] rounded-xl flex items-center justify-center text-black font-bold">
              <Activity size={24} />
            </div>
            <span className="text-2xl font-bold font-display">Quantara</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight font-display leading-tight mb-6">
            "Constância é a chave para o sucesso no trading.<br />
            <span className="text-[#00B0F0]">Domine seus padrões com a Quantara.</span>"
          </h1>
          <p className="text-gray-400 text-lg">Quantara: Trading Lab</p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Glow effect behind card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#00B0F0]/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-md bg-[#111114] border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10">

          {/* Header & Mode Selector */}
          {(authMode === 'login' || authMode === 'signup') && (
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-sm font-bold cursor-pointer transition-colors ${authMode === 'login' ? 'text-white' : 'text-gray-500'}`} onClick={() => { setAuthMode('login'); setError(null); setSuccessMessage(null); }}>
                Entrar
              </span>
              <button
                type="button"
                onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setError(null); setSuccessMessage(null); }}
                className="relative w-12 h-6 bg-white/10 rounded-full transition-colors"
              >
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${authMode === 'signup' ? 'translate-x-6' : ''}`}></div>
              </button>
              <span className={`text-sm font-bold cursor-pointer transition-colors ${authMode === 'signup' ? 'text-white' : 'text-gray-500'}`} onClick={() => { setAuthMode('signup'); setError(null); setSuccessMessage(null); }}>
                Criar Conta
              </span>
            </div>
          )}

          {authMode === 'forgot_password' && (
            <div className="mb-6">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setError(null); setSuccessMessage(null); }}
                className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors mb-4"
              >
                <ArrowLeft size={14} /> Voltar para o Login
              </button>
              <h2 className="text-xl font-bold font-display text-white">Recuperar Senha</h2>
              <p className="text-xs text-gray-400 mt-1">Informe seu e-mail cadastrado para enviarmos as instruções de redefinição.</p>
            </div>
          )}

          {authMode === 'reset_password' && (
            <div className="mb-6">
              <h2 className="text-xl font-bold font-display text-white">Redefinir Senha</h2>
              <p className="text-xs text-gray-400 mt-1">Digite sua nova senha abaixo para atualizar seu acesso.</p>
            </div>
          )}

          {/* Feedback Messages */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form: LOGIN & SIGNUP */}
          {(authMode === 'login' || authMode === 'signup') && (
            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400">E-mail</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-[#00B0F0] transition-colors"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-[#00B0F0] transition-colors pr-10"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {authMode === 'login' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('forgot_password'); setError(null); setSuccessMessage(null); }}
                    className="text-xs font-bold text-[#00B0F0] hover:text-[#00B0F0]/80 transition-colors"
                  >
                    Esqueci minha senha
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00B0F0] text-white font-bold py-3 rounded-lg hover:brightness-110 active:scale-95 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  authMode === 'login' ? 'Entrar' : 'Criar Conta'
                )}
              </button>
            </form>
          )}

          {/* Form: FORGOT PASSWORD */}
          {authMode === 'forgot_password' && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400">E-mail Cadastrado</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-[#00B0F0] transition-colors"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00B0F0] text-white font-bold py-3 rounded-lg hover:brightness-110 active:scale-95 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Enviar E-mail de Recuperação'}
              </button>
            </form>
          )}

          {/* Form: RESET PASSWORD */}
          {authMode === 'reset_password' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400">Nova Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-[#00B0F0] transition-colors pr-10"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400">Confirmar Nova Senha</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="********"
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-[#00B0F0] transition-colors pr-10"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00B0F0] text-white font-bold py-3 rounded-lg hover:brightness-110 active:scale-95 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Salvar Nova Senha'}
              </button>
            </form>
          )}

          {/* Social Logins Section */}
          {(authMode === 'login' || authMode === 'signup') && (
            <>
              <div className="mt-8 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[#111114] px-2 text-gray-500">Ou entre com:</span>
                </div>
              </div>

              <div className="mt-6">
                {/* Google */}
                <button
                  type="button"
                  disabled={socialLoading !== null}
                  onClick={() => handleSocialLogin('google')}
                  className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-lg py-3 text-sm font-bold hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  {socialLoading === 'google' ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  )}
                  Entrar com Google
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
