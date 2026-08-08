import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Calendar, 
  Layers, 
  Cpu, 
  Check, 
  Award,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { getStoredLanguage, setStoredLanguage, t as tFunc, type Lang } from '../utils/i18n';

// Real Vector SVG Flags for 100% universal OS compatibility
const FlagUS = ({ className = "w-5 h-3.5" }: { className?: string }) => (
  <span className={`${className} inline-flex items-center justify-center rounded-[3px] overflow-hidden shadow-sm shrink-0 border border-white/20`}>
    <svg className="w-full h-full object-cover" viewBox="0 0 640 480">
      <g fillRule="evenodd">
        <path fill="#bd3d44" d="M0 0h640v480H0z"/>
        <path stroke="#fff" strokeWidth="37" d="M0 55.4h640M0 129.2h640M0 203h640M0 277h640M0 350.8h640M0 424.6h640"/>
        <path fill="#192f5d" d="M0 0h260v259H0z"/>
        <g fill="#fff">
          <circle cx="26" cy="24" r="8"/><circle cx="78" cy="24" r="8"/><circle cx="130" cy="24" r="8"/><circle cx="182" cy="24" r="8"/><circle cx="234" cy="24" r="8"/>
          <circle cx="52" cy="48" r="8"/><circle cx="104" cy="48" r="8"/><circle cx="156" cy="48" r="8"/><circle cx="208" cy="48" r="8"/>
          <circle cx="26" cy="72" r="8"/><circle cx="78" cy="72" r="8"/><circle cx="130" cy="72" r="8"/><circle cx="182" cy="72" r="8"/><circle cx="234" cy="72" r="8"/>
        </g>
      </g>
    </svg>
  </span>
);

const FlagBR = ({ className = "w-5 h-3.5" }: { className?: string }) => (
  <span className={`${className} inline-flex items-center justify-center rounded-[3px] overflow-hidden shadow-sm shrink-0 border border-white/20`}>
    <svg className="w-full h-full object-cover" viewBox="0 0 640 480">
      <path fill="#009c3b" d="M0 0h640v480H0z"/>
      <path fill="#ffdf00" d="M320 40L600 240 320 440 40 240z"/>
      <circle fill="#002776" cx="320" cy="240" r="115"/>
      <path fill="#ffffff" d="M208 240c0-15 48-60 112-60s112 45 112 60c-25-10-60-20-112-20s-87 10-112 20z"/>
    </svg>
  </span>
);

const FlagES = ({ className = "w-5 h-3.5" }: { className?: string }) => (
  <span className={`${className} inline-flex items-center justify-center rounded-[3px] overflow-hidden shadow-sm shrink-0 border border-white/20`}>
    <svg className="w-full h-full object-cover" viewBox="0 0 640 480">
      <path fill="#aa151b" d="M0 0h640v480H0z"/>
      <path fill="#f1bf00" d="M0 120h640v240H0z"/>
      <g transform="translate(135, 170) scale(0.65)">
        <rect x="0" y="25" width="80" height="95" rx="8" fill="#aa151b" stroke="#ffffff" strokeWidth="5"/>
        <path d="M0 25 L40 -15 L80 25 Z" fill="#f1bf00"/>
        <circle cx="40" cy="65" r="18" fill="#f1bf00"/>
        <line x1="40" y1="52" x2="40" y2="78" stroke="#aa151b" strokeWidth="5"/>
        <line x1="27" y1="65" x2="53" y2="65" stroke="#aa151b" strokeWidth="5"/>
      </g>
    </svg>
  </span>
);

const LANGUAGES = [
  { code: 'en' as Lang, label: 'English', FlagComponent: FlagUS },
  { code: 'pt' as Lang, label: 'Português', FlagComponent: FlagBR },
  { code: 'es' as Lang, label: 'Español', FlagComponent: FlagES },
];

type AuthMode = 'login' | 'signup' | 'forgot_password' | 'reset_password';

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [lang, setLang] = useState<Lang>(getStoredLanguage());
  const [langDropdownOpen, setLangDropdownOpen] = useState<boolean>(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

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

  const handleSelectLanguage = (newLang: Lang) => {
    setLang(newLang);
    setStoredLanguage(newLang);
    setLangDropdownOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          if (profileError) console.error('Error saving profile:', profileError);
        }

        setSuccessMessage(lang === 'pt' ? 'Conta criada com sucesso! Redirecionando...' : lang === 'es' ? '¡Cuenta creada con éxito! Redirigiendo...' : 'Account created! Redirecting...');
      }

      if (authMode === 'login' && userId) {
        const { data: profileCheck, error: profileError } = await supabase
          .from('profiles')
          .select('id, plan, status, trial_end, storage_mode')
          .eq('id', userId)
          .maybeSingle();

        if (!profileError && profileCheck === null) {
          const { error: insertError } = await supabase
            .from('profiles')
            .upsert({
              id: userId,
              first_name: email.split('@')[0],
              last_name: '',
              email: email,
              plan: '',
              status: 'active',
              trial_started_at: null,
              trial_end: null,
              storage_mode: 'local',
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            await supabase.auth.signOut();
            throw new Error('Failed to initialize user profile. Please try again.');
          }
          
          navigate('/pricing');
          return;
        }

        if (profileCheck) {
          const plan = (profileCheck.plan || '').toLowerCase();
          const status = profileCheck.status;
          const trialEnd = profileCheck.trial_end;

          if (!plan || plan === 'none' || status === 'Suspended' || status === 'Inactive') {
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
        }, 1200);
        return;
      }
      
      navigate('/loading');
    } catch (err: any) {
      setError(err.message || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Social Login Handler (Google)
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
        throw new Error(`Unable to get authentication URL for ${provider.toUpperCase()}.`);
      }
    } catch (err: any) {
      console.error(`OAuth error (${provider}):`, err);
      const msg = err.message || '';
      const provName = provider === 'google' ? 'Google' : provider === 'facebook' ? 'Facebook' : 'Apple';
      
      if (msg.includes('provider is not enabled') || msg.includes('Unsupported provider') || msg.includes('validation_failed')) {
        setError(`${provName} sign-in needs to be enabled in your Supabase dashboard.`);
      } else {
        setError(msg || `Could not connect with ${provName}.`);
      }
    } finally {
      setSocialLoading(null);
    }
  };

  // Forgot Password Request Handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(lang === 'pt' ? 'Por favor, insira o seu e-mail.' : lang === 'es' ? 'Por favor, ingrese su correo electrónico.' : 'Please provide your email address.');
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

      setSuccessMessage(lang === 'pt' ? 'E-mail de recuperação enviado! Verifique sua caixa de entrada.' : lang === 'es' ? '¡Correo de recuperación enviado! Revise su bandeja de entrada.' : 'Password recovery email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Error sending password reset email.');
    } finally {
      setLoading(false);
    }
  };

  // New Password Reset Handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError(lang === 'pt' ? 'Digite a nova senha.' : lang === 'es' ? 'Ingrese la nueva contraseña.' : 'Please enter a new password.');
      return;
    }
    if (password !== confirmPassword) {
      setError(lang === 'pt' ? 'As senhas não coincidem.' : lang === 'es' ? 'Las contraseñas no coinciden.' : 'Passwords do not match.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setSuccessMessage(lang === 'pt' ? 'Senha atualizada com sucesso! Redirecionando...' : lang === 'es' ? '¡Contraseña actualizada con éxito! Redirigiendo...' : 'Password successfully updated! Redirecting...');
      setTimeout(() => {
        navigate('/loading');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error updating password.');
    } finally {
      setLoading(false);
    }
  };

  const t = (k: string) => tFunc(k, lang);
  const currentLangObj = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <div className="min-h-screen bg-[#070709] text-white font-sans relative overflow-x-hidden selection:bg-amber-500 selection:text-black select-none">
      
      {/* Background Ambient Glows */}
      <div className="fixed -top-40 -left-40 w-[800px] h-[800px] bg-amber-500/10 blur-[180px] rounded-full pointer-events-none z-0" />
      <div className="fixed -bottom-40 -right-40 w-[800px] h-[800px] bg-yellow-500/10 blur-[180px] rounded-full pointer-events-none z-0" />

      {/* Floating Language Dropdown on top right */}
      <div className="absolute top-6 right-6 z-30" ref={langDropdownRef}>
        <button
          type="button"
          onClick={() => setLangDropdownOpen(!langDropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-gray-200 transition-all cursor-pointer shadow-sm active:scale-95"
          title="Select Language"
        >
          <currentLangObj.FlagComponent className="w-5 h-3.5" />
          <span className="uppercase text-[11px] font-extrabold text-gray-200">{currentLangObj.code}</span>
          <ChevronDown size={12} className={`text-gray-400 transition-transform ${langDropdownOpen ? 'rotate-180 text-amber-400' : ''}`} />
        </button>

        {langDropdownOpen && (
          <div className="absolute right-0 mt-2 w-36 bg-[#0e0e14]/98 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl py-1.5 z-50 animate-fadeIn">
            {LANGUAGES.map((l) => {
              const Flag = l.FlagComponent;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => handleSelectLanguage(l.code)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                    lang === l.code ? 'bg-amber-500/15 text-amber-400' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Flag className="w-5 h-3.5" />
                    <span>{l.label}</span>
                  </div>
                  {lang === l.code && <Check size={14} className="text-amber-400" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Background SVG Grid & Gold Trend Vector */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 1600 1000" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="fullGoldTrend" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="30%" stopColor="#fbbf24" stopOpacity="0.7" />
              <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4" />
            </linearGradient>
            <filter id="goldGlowBig" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <line x1="0" y1="200" x2="1600" y2="200" stroke="rgba(255,255,255,0.025)" strokeWidth="1" strokeDasharray="6 6" />
          <line x1="0" y1="400" x2="1600" y2="400" stroke="rgba(255,255,255,0.025)" strokeWidth="1" strokeDasharray="6 6" />
          <line x1="0" y1="600" x2="1600" y2="600" stroke="rgba(255,255,255,0.025)" strokeWidth="1" strokeDasharray="6 6" />
          <line x1="0" y1="800" x2="1600" y2="800" stroke="rgba(255,255,255,0.025)" strokeWidth="1" strokeDasharray="6 6" />

          {/* Large Candlesticks */}
          <line x1="120" y1="600" x2="120" y2="850" stroke="#10b981" strokeWidth="3" opacity="0.6" />
          <rect x="108" y="650" width="24" height="150" fill="#10b981" rx="4" opacity="0.7" />

          <line x1="360" y1="380" x2="360" y2="700" stroke="#10b981" strokeWidth="4" opacity="0.8" />
          <rect x="344" y="440" width="32" height="220" fill="#10b981" rx="5" opacity="0.85" />

          <line x1="680" y1="180" x2="680" y2="580" stroke="#fbbf24" strokeWidth="5" opacity="0.9" />
          <rect x="662" y="240" width="36" height="280" fill="#fbbf24" rx="6" opacity="0.95" />

          <line x1="1040" y1="80" x2="1040" y2="340" stroke="#f59e0b" strokeWidth="4" opacity="0.9" />
          <rect x="1024" y="120" width="32" height="160" fill="#f59e0b" rx="6" opacity="0.95" />

          <path
            d="M0,820 C150,780 250,720 360,540 C470,360 570,520 680,360 C800,180 920,270 1040,150 C1180,30 1340,240 1600,80"
            fill="none"
            stroke="url(#fullGoldTrend)"
            strokeWidth="5"
            filter="url(#goldGlowBig)"
          />
        </svg>
      </div>

      {/* Main Two-Column Container */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-stretch max-w-[1700px] mx-auto">
        
        {/* Left Side: Deep Text Content & Trading Philosophy */}
        <div className="flex-1 flex flex-col justify-between p-8 sm:p-12 lg:p-16 xl:p-20">
          
          {/* Top Brand Logo */}
          <div>
            <div className="flex items-center gap-3 cursor-pointer group inline-flex" onClick={() => navigate('/')}>
              <img
                src="/logo.png"
                alt="Quantara Logo"
                className="w-12 h-12 object-contain rounded-xl drop-shadow-[0_0_20px_rgba(245,158,11,0.4)] group-hover:scale-105 transition-transform"
                onError={(e: any) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div style={{ display: 'none' }} className="w-12 h-12 bg-yellow-500 rounded-xl items-center justify-center text-2xl drop-shadow-md">
                🐾
              </div>
              <div>
                <span className="text-2xl lg:text-3xl font-black font-display tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  Quantara
                </span>
                <span className="block text-[11px] uppercase tracking-widest text-amber-400 font-bold -mt-1">
                  Trading Lab
                </span>
              </div>
            </div>
          </div>

          {/* Middle Body: Rich Text & Institutional Pillars */}
          <div className="my-10 space-y-8 max-w-2xl">
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase shadow-[0_0_25px_rgba(245,158,11,0.15)]">
                <Zap size={14} className="text-amber-400 animate-pulse" />
                <span>{t('auth.quoteBadge')}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight font-display leading-[1.15] text-white">
                "{t('auth.quotePrefix')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
                  {t('auth.quoteHighlight')}
                </span>"
              </h1>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {t('auth.quoteDesc')}
              </p>
            </div>

            {/* 4 Deep Institutional Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-500/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
                  <BarChart3 size={20} />
                </div>
                <h2 className="text-sm font-black text-white mb-1.5">{t('auth.pillar1.title')}</h2>
                <p className="text-xs text-gray-400 leading-relaxed">{t('auth.pillar1.desc')}</p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-500/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={20} />
                </div>
                <h2 className="text-sm font-black text-white mb-1.5">{t('auth.pillar2.title')}</h2>
                <p className="text-xs text-gray-400 leading-relaxed">{t('auth.pillar2.desc')}</p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-500/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
                  <Layers size={20} />
                </div>
                <h2 className="text-sm font-black text-white mb-1.5">{t('auth.pillar3.title')}</h2>
                <p className="text-xs text-gray-400 leading-relaxed">{t('auth.pillar3.desc')}</p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-500/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
                  <Calendar size={20} />
                </div>
                <h2 className="text-sm font-black text-white mb-1.5">{t('auth.pillar4.title')}</h2>
                <p className="text-xs text-gray-400 leading-relaxed">{t('auth.pillar4.desc')}</p>
              </div>

            </div>

            {/* Feature Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-gray-300">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{t('auth.check1')}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-300">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{t('auth.check2')}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-300">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{t('auth.check3')}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-300">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{t('auth.check4')}</span>
              </div>
            </div>

          </div>

          {/* Bottom Trust Indicators */}
          <div className="pt-6 border-t border-white/5 flex flex-wrap items-center gap-6 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-amber-400" />
              <span>{t('auth.trust1')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu size={16} className="text-yellow-400" />
              <span>{t('auth.trust2')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-400" />
              <span>{t('auth.trust3')}</span>
            </div>
          </div>

        </div>

        {/* Right Side: Auth Form Card */}
        <div className="lg:w-[480px] xl:w-[520px] flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16">
          
          <div className="w-full max-w-md bg-[#101014]/90 border border-amber-500/20 rounded-3xl p-8 sm:p-10 shadow-[0_0_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl relative">
            
            {/* Header & Mode Selector */}
            {(authMode === 'login' || authMode === 'signup') && (
              <div className="flex items-center justify-center gap-2 mb-8 p-1.5 bg-black/40 border border-white/10 rounded-2xl">
                <button
                  type="button"
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md shadow-amber-500/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => { setAuthMode('login'); setError(null); setSuccessMessage(null); }}
                >
                  {t('auth.tabLogin')}
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md shadow-amber-500/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => { setAuthMode('signup'); setError(null); setSuccessMessage(null); }}
                >
                  {t('auth.tabSignup')}
                </button>
              </div>
            )}

            {authMode === 'forgot_password' && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setError(null); setSuccessMessage(null); }}
                  className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors mb-4 cursor-pointer"
                >
                  <ArrowLeft size={14} /> {t('auth.backToLogin')}
                </button>
                <h2 className="text-xl font-black font-display text-white">{t('auth.resetPasswordTitle')}</h2>
                <p className="text-xs text-gray-400 mt-1">{t('auth.resetPasswordDesc')}</p>
              </div>
            )}

            {authMode === 'reset_password' && (
              <div className="mb-6">
                <h2 className="text-xl font-black font-display text-white">{t('auth.setNewPasswordTitle')}</h2>
                <p className="text-xs text-gray-400 mt-1">{t('auth.setNewPasswordDesc')}</p>
              </div>
            )}

            {/* Feedback Alerts */}
            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 animate-shake">
                <AlertCircle size={16} className="shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* LOGIN & SIGNUP FORM */}
            {(authMode === 'login' || authMode === 'signup') && (
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">{t('auth.emailLabel')}</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 text-white placeholder-gray-600 transition-all select-text cursor-text"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">{t('auth.passwordLabel')}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 text-white placeholder-gray-600 transition-all pr-10 select-text cursor-text"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {authMode === 'login' && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => { setAuthMode('forgot_password'); setError(null); setSuccessMessage(null); }}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      {t('auth.forgotPassword')}
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-black font-extrabold py-3.5 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] hover:brightness-110 active:scale-[0.98] transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin text-black" />
                  ) : (
                    authMode === 'login' ? t('auth.btnSignIn') : t('auth.btnSignUp')
                  )}
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {authMode === 'forgot_password' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">{t('auth.registeredEmail')}</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 text-white placeholder-gray-600 transition-all select-text cursor-text"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-black font-extrabold py-3.5 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] hover:brightness-110 active:scale-[0.98] transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? <Loader2 size={18} className="animate-spin text-black" /> : t('auth.sendRecovery')}
                </button>
              </form>
            )}

            {/* RESET PASSWORD FORM */}
            {authMode === 'reset_password' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">{t('auth.newPassword')}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 text-white placeholder-gray-600 transition-all pr-10 select-text cursor-text"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">{t('auth.confirmNewPassword')}</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 text-white placeholder-gray-600 transition-all pr-10 select-text cursor-text"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-black font-extrabold py-3.5 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] hover:brightness-110 active:scale-[0.98] transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? <Loader2 size={18} className="animate-spin text-black" /> : t('auth.saveNewPassword')}
                </button>
              </form>
            )}

            {/* Social Logins */}
            {(authMode === 'login' || authMode === 'signup') && (
              <>
                <div className="mt-6 relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-[#101014] px-3 text-gray-500 font-semibold">{t('auth.orContinueWith')}</span>
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    type="button"
                    disabled={socialLoading !== null}
                    onClick={() => handleSocialLogin('google')}
                    className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/5 rounded-xl py-3 text-sm font-bold text-white transition-all disabled:opacity-50 group cursor-pointer"
                  >
                    {socialLoading === 'google' ? (
                      <Loader2 size={18} className="animate-spin text-amber-400" />
                    ) : (
                      <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    )}
                    <span>{t('auth.googleBtn')}</span>
                  </button>
                </div>
              </>
            )}

            {/* Privacy & Terms */}
            <div className="mt-8 text-center text-[11px] text-gray-500">
              {t('auth.footerNotice')}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
