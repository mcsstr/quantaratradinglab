import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  ArrowLeft, 
  Zap, 
  Shield, 
  Crown, 
  Loader2, 
  AlertTriangle, 
  CloudUpload, 
  CloudDownload, 
  X, 
  Clock,
  ChevronDown
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { usePlanConfig } from '../hooks/usePlanConfig';
import { getStoredLanguage, setStoredLanguage, t as tFunc, type Lang } from '../utils/i18n';
import './Dashboard.css';

// Real Vector SVG Flags for cross-platform compatibility
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

const PLAN_ICONS: Record<string, any> = {
  free: Zap,
  basic: Shield,
  premium: Crown,
};

// Confirmation modal for plan changes with storage implications
interface MigrationModalProps {
  type: 'upgrade' | 'downgrade';
  targetPlan: string;
  price: number;
  interval: 'monthly' | 'yearly';
  lang: Lang;
  onConfirm: () => void;
  onCancel: () => void;
}

function MigrationModal({ type, targetPlan, price, interval, lang, onConfirm, onCancel }: MigrationModalProps) {
  const isUpgrade = type === 'upgrade';
  const t = (k: string) => tFunc(k, lang);

  const title = isUpgrade 
    ? (lang === 'pt' ? 'Upgrade para Armazenamento em Nuvem' : lang === 'es' ? 'Actualización a Almacenamiento en Nube' : 'Upgrade to Cloud Storage')
    : (lang === 'pt' ? 'Downgrade para Armazenamento Local' : lang === 'es' ? 'Cambio a Almacenamiento Local' : 'Downgrade to Local Storage');

  const desc = isUpgrade
    ? (lang === 'pt' ? 'Seus dados de trading serão migrados com segurança para nossos servidores em nuvem, acessíveis de qualquer dispositivo.' : lang === 'es' ? 'Tus operaciones se transferirán de forma segura a nuestros servidores en la nube, accesibles desde cualquier dispositivo.' : 'Your trading data will be safely migrated to our secure cloud servers, accessible from any device.')
    : (lang === 'pt' ? 'Seus dados serão transferidos para o armazenamento local deste navegador. Importante: os dados existirão apenas neste dispositivo.' : lang === 'es' ? 'Tus datos se transferirán al almacenamiento local de este navegador. Importante: los datos solo existirán en este dispositivo.' : "Your data will be stored in this browser's local storage only.");

  const summary = lang === 'pt' ? 'Resumo da Cobrança' : lang === 'es' ? 'Resumen de Cobro' : 'Billing Summary';
  const perInterval = interval === 'yearly' 
    ? (lang === 'pt' ? '/ ano' : lang === 'es' ? '/ año' : '/ year')
    : (lang === 'pt' ? '/ mês' : lang === 'es' ? '/ mes' : '/ month');

  const chargedNotice = lang === 'pt' ? 'Cobrado imediatamente após a confirmação.' : lang === 'es' ? 'Cobrado inmediatamente tras la confirmación.' : 'Charged immediately upon confirmation.';
  const cancelBtn = lang === 'pt' ? 'Cancelar' : lang === 'es' ? 'Cancelar' : 'Cancel';
  const confirmBtn = lang === 'pt' ? 'Confirmar & Pagar' : lang === 'es' ? 'Confirmar y Pagar' : 'Confirm & Pay';

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-[#111114] border border-amber-500/30 rounded-2xl w-full max-w-md shadow-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isUpgrade ? 'bg-blue-500/10' : 'bg-orange-500/10'}`}>
              {isUpgrade ? (
                <CloudUpload size={22} className="text-blue-400" />
              ) : (
                <CloudDownload size={22} className="text-orange-400" />
              )}
            </div>
            <h3 className="text-lg font-black font-display">
              {title}
            </h3>
          </div>
          <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Data migration info */}
        <div className={`rounded-xl p-4 mb-6 border ${isUpgrade ? 'bg-blue-500/5 border-blue-500/20' : 'bg-orange-500/5 border-orange-500/20'}`}>
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className={`mt-0.5 shrink-0 ${isUpgrade ? 'text-blue-400' : 'text-orange-400'}`} />
            <p className="text-sm leading-relaxed text-gray-300">
              {desc}
            </p>
          </div>
        </div>

        {/* Billing info */}
        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/8">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">{summary}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-amber-400">${Number(price).toFixed(2)}</span>
            <span className="text-gray-400 text-sm">{perInterval}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {chargedNotice}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-bold text-gray-400 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            {cancelBtn}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-xl font-black transition-all hover:brightness-110 active:scale-95 cursor-pointer ${isUpgrade ? 'bg-blue-500 text-white' : 'bg-amber-500 text-black'}`}
          >
            {confirmBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

// Success modal for Free Plan acquisition
interface FreePlanModalProps {
  trialDays: number;
  trialUnit: string;
  lang: Lang;
  onUnderstand: () => void;
}

function FreePlanModal({ trialDays, trialUnit, lang, onUnderstand }: FreePlanModalProps) {
  const t = (k: string) => tFunc(k, lang);
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-[#111114] border border-[#00B0F0]/30 rounded-2xl w-full max-w-sm shadow-2xl p-8 text-center animate-tab-enter">
        <div className="w-16 h-16 bg-[#00B0F0]/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#00B0F0]/30 shadow-[0_0_20px_rgba(0,176,240,0.3)]">
          <Zap size={32} className="text-[#00B0F0]" />
        </div>
        <h3 className="text-2xl font-black font-display mb-2">{t('pricing.freeSuccessTitle')}</h3>
        <p className="text-sm leading-relaxed text-gray-300 mb-6">
          {lang === 'pt' 
            ? `Você agora está no Plano Grátis! Seu período de testes é válido por ${trialDays} ${trialUnit} a partir de hoje. Ao término, você poderá escolher um upgrade para continuar a usar recursos premium.`
            : lang === 'es'
            ? `¡Ahora estás en el Plan Gratis! Tu periodo de prueba es válido por ${trialDays} ${trialUnit} a partir de hoy. Al terminar, podrás elegir un upgrade para continuar usando recursos premium.`
            : `You are now on the Free Plan! Your trial period is active for ${trialDays} ${trialUnit}. Once it ends, you can upgrade to continue using all premium features.`}
        </p>
        <button
          onClick={onUnderstand}
          className="w-full py-3.5 rounded-xl font-black bg-[#00B0F0] text-black transition-all hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(0,176,240,0.4)] cursor-pointer"
        >
          {t('pricing.understandBtn')}
        </button>
      </div>
    </div>
  );
}

export default function Pricing() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>(getStoredLanguage());
  const [langDropdownOpen, setLangDropdownOpen] = useState<boolean>(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const { plans, loading: plansLoading } = usePlanConfig();
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [currentUserPlan, setCurrentUserPlan] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [trialExpired, setTrialExpired] = useState(false);
  
  // Migration modal state
  const [migrationModal, setMigrationModal] = useState<{
    show: boolean;
    type: 'upgrade' | 'downgrade';
    targetPlanId: string;
    targetPlanName: string;
    price: number;
    interval: 'monthly' | 'yearly';
    priceId: string;
  } | null>(null);

  // Free Plan Success Modal State
  const [freePlanModal, setFreePlanModal] = useState<{
    show: boolean;
    trialDays: number;
    trialUnit: string;
  } | null>(null);

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reason') === 'trial_expired') {
      setTrialExpired(true);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      supabase
        .from('profiles')
        .select('plan, storage_mode, trial_end, status, is_admin_override, admin_override_until')
        .eq('id', session.user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setUserProfile(data);
            if (data.plan) setCurrentUserPlan(data.plan.toLowerCase());
          }
        });
    });
  }, []);

  const isFreeTrialUsed = useMemo(() => {
    if (!userProfile) return false;
    if (userProfile.is_admin_override && userProfile.admin_override_until && new Date(userProfile.admin_override_until) > new Date()) {
      return false;
    }
    if (userProfile.trial_end && new Date(userProfile.trial_end) < new Date()) {
      return true;
    }
    if (userProfile.plan && userProfile.plan.toLowerCase() !== 'free' && userProfile.plan.trim() !== '') {
      return true;
    }
    return false;
  }, [userProfile]);

  const initiateCheckout = async (planId: string, isYearlyPlan: boolean) => {
    try {
      setLoadingPlan(planId);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert(lang === 'pt' ? 'Por favor, faça login para assinar um plano.' : lang === 'es' ? 'Por favor, inicie sesión para suscribirse a un plan.' : 'Please sign in to choose a plan.');
        navigate('/auth');
        return;
      }

      const targetPlan = plans.find(p => p.id === planId);
      if (!targetPlan) throw new Error('Plan configuration not found');

      if (planId === 'free') {
        if (isFreeTrialUsed || trialExpired) {
          alert(tFunc('pricing.trialAlreadyUsed', lang));
          return;
        }

        const trialValue = targetPlan.trial_duration_value || targetPlan.trial_days;
        const trialUnit = targetPlan.trial_duration_unit || 'days';

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            email: session.user.email || '',
            first_name: session.user.email?.split('@')[0] || 'Trader',
            plan: 'free',
            status: 'active',
            trial_started_at: null,
            trial_end: null,
            storage_mode: 'local',
            updated_at: new Date().toISOString()
          });
          
        if (profileError) throw profileError;

        setFreePlanModal({
          show: true,
          trialDays: trialValue,
          trialUnit: trialUnit
        });
        
        return;
      }

      const priceId = isYearlyPlan
        ? targetPlan.stripe_price_yearly
        : targetPlan.stripe_price_monthly;

      if (!priceId) throw new Error(`Stripe Price ID not configured for ${targetPlan.name}`);

      const price = isYearlyPlan ? targetPlan.price_yearly : targetPlan.price_monthly;
      const interval = isYearlyPlan ? 'yearly' : 'monthly';

      const isPremiumTarget = planId === 'premium';
      const isChangingPlan = currentUserPlan && currentUserPlan !== planId && currentUserPlan !== 'free';

      if (isChangingPlan) {
        const type: 'upgrade' | 'downgrade' = isPremiumTarget ? 'upgrade' : 'downgrade';
        setMigrationModal({
          show: true,
          type,
          targetPlanId: planId,
          targetPlanName: targetPlan.name,
          price,
          interval,
          priceId,
        });
        setLoadingPlan(null);
        return;
      }

      await runCheckout(priceId, session);

    } catch (error: any) {
      console.error('Checkout error:', error);
      const errorMsg = error.context?.message || error.context?.error || error.message || JSON.stringify(error);
      alert(`Error starting checkout: ${errorMsg}`);
    } finally {
      setLoadingPlan(null);
    }
  };

  const runCheckout = async (priceId: string, session: any) => {
    const { data, error } = await supabase.functions.invoke('stripe-checkout', {
      body: { priceId }
    });

    if (error) throw error;
    if (data?._isError) throw new Error(data.error);

    if (data?.url) {
      window.location.href = data.url;
    } else {
      throw new Error('Checkout URL not returned.');
    }
  };

  const handleMigrationConfirm = async () => {
    if (!migrationModal) return;
    try {
      setLoadingPlan(migrationModal.targetPlanId);
      setMigrationModal(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth'); return; }

      await runCheckout(migrationModal.priceId, session);
    } catch (error: any) {
      console.error('Checkout error:', error);
      const errorMsg = error.context?.message || error.context?.error || error.message || JSON.stringify(error);
      alert(`Error starting checkout: ${errorMsg}`);
      setLoadingPlan(null);
    }
  };

  const t = (k: string) => tFunc(k, lang);
  const currentLangObj = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  const planBadges: Record<string, string> = {
    free: lang === 'pt' ? 'INÍCIO SEM RISCO' : lang === 'es' ? 'INICIO SIN RIESGO' : 'RISK-FREE START',
    basic: lang === 'pt' ? 'MAIS POPULAR' : lang === 'es' ? 'MÁS POPULAR' : 'MOST POPULAR',
    premium: 'VIP',
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white font-sans relative overflow-x-hidden flex flex-col items-center justify-center p-4 py-16 select-none">

      {/* Free Plan Success Modal */}
      {freePlanModal?.show && (
        <FreePlanModal 
          trialDays={freePlanModal.trialDays} 
          trialUnit={freePlanModal.trialUnit} 
          lang={lang}
          onUnderstand={() => {
            setFreePlanModal(null);
            navigate('/dashboard');
          }} 
        />
      )}

      {/* Trial Expired Banner */}
      {trialExpired && (
        <div className="fixed inset-0 z-[600] flex items-end justify-center p-6 pointer-events-none">
          <div className="bg-gradient-to-r from-red-900/90 to-amber-900/90 border border-red-500/40 rounded-2xl w-full max-w-2xl shadow-2xl p-6 pointer-events-auto backdrop-blur-md">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-500/20 rounded-xl shrink-0">
                <Clock size={22} className="text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-white text-lg mb-1">{t('pricing.expiredBannerTitle')}</h3>
                <p className="text-red-200 text-sm leading-relaxed">
                  {t('pricing.expiredBannerDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Migration Modal */}
      {migrationModal?.show && (
        <MigrationModal
          type={migrationModal.type}
          targetPlan={migrationModal.targetPlanName}
          price={migrationModal.price}
          interval={migrationModal.interval}
          lang={lang}
          onConfirm={handleMigrationConfirm}
          onCancel={() => { setMigrationModal(null); setLoadingPlan(null); }}
        />
      )}

      {/* Ambient background glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-amber-500/8 blur-[140px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-amber-500/6 blur-[160px] rounded-full"></div>
        <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] bg-cyan-500/4 blur-[120px] rounded-full"></div>
      </div>

      {/* Top Header Bar with Back Button and Language Selector */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20 max-w-6xl mx-auto w-[calc(100%-3rem)]">
        <button
          onClick={() => {
            sessionStorage.setItem('quantara_expired_redirect_shown', 'true');
            navigate('/dashboard');
          }}
          className="text-gray-300 hover:text-amber-400 flex items-center gap-2 transition-colors text-xs font-bold px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer shadow-sm"
        >
          <ArrowLeft size={16} />
          <span>{t('nav.back')}</span>
        </button>

        {/* Flag Language Dropdown */}
        <div className="relative" ref={langDropdownRef}>
          <button
            type="button"
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-gray-200 transition-all cursor-pointer shadow-sm active:scale-95 select-none"
            title="Select Language"
          >
            <currentLangObj.FlagComponent className="w-5 h-3.5" />
            <span className="uppercase text-[11px] font-extrabold text-gray-200">{currentLangObj.code}</span>
            <ChevronDown size={12} className={`text-gray-400 transition-transform ${langDropdownOpen ? 'rotate-180 text-amber-400' : ''}`} />
          </button>

          {langDropdownOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-[#0e0e14]/98 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl py-1.5 z-50 animate-fadeIn select-none">
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
      </div>

      <div className="z-10 w-full max-w-6xl mx-auto mt-12 sm:mt-8">

        {/* Header */}
        <div className="text-center mb-12 mt-6">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">{t('pricing.badge')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 font-display tracking-tight leading-tight">
            {t('pricing.title')}
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            {t('pricing.subtitle')}
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-4 mb-14">
          <span className={`text-sm font-bold transition-colors ${!isYearly ? 'text-white' : 'text-gray-500'}`}>{t('pricing.monthly')}</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="w-14 h-7 bg-white/10 rounded-full relative p-1 cursor-pointer border border-white/10 hover:border-amber-500/40 transition-colors"
            aria-label="Toggle billing period"
          >
            <div className={`w-5 h-5 bg-amber-400 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.8)] transition-transform duration-300 ${isYearly ? 'translate-x-7' : 'translate-x-0'}`}></div>
          </button>
          <span className={`text-sm font-bold transition-colors ${isYearly ? 'text-white' : 'text-gray-500'}`}>
            {t('pricing.yearly')}
            <span className="ml-2 text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">{t('pricing.save20')}</span>
          </span>
        </div>

        {/* Plans Grid */}
        {plansLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-amber-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const IconComp = PLAN_ICONS[plan.id] || Shield;
              const isBasic = plan.id === 'basic';
              const isFree = plan.id === 'free';
              const isCurrent = currentUserPlan === plan.id;
              const badge = planBadges[plan.id];
              const displayPrice = isFree ? '0.00' : (isYearly ? (plan.price_yearly / 12).toFixed(2) : Number(plan.price_monthly).toFixed(2));
              const trialValue = plan.trial_duration_value || plan.trial_days;
              const trialUnit = plan.trial_duration_unit || 'days';
              
              const description = isFree
                ? (lang === 'pt' ? `R$0 durante os primeiros ${trialValue} ${trialUnit}. Depois escolha um plano para continuar.` : lang === 'es' ? `$0 durante los primeros ${trialValue} ${trialUnit}. Luego elige un plan para continuar.` : `$0 for the first ${trialValue} ${trialUnit}. Then choose a paid plan to continue.`)
                : (isYearly 
                  ? `$${Number(plan.price_yearly).toFixed(2)}${lang === 'pt' ? '/ano' : lang === 'es' ? '/año' : '/year'}` 
                  : (lang === 'pt' ? `Cobrado mensalmente — $${Number(plan.price_monthly).toFixed(2)}/mês` : lang === 'es' ? `Facturado mensualmente — $${Number(plan.price_monthly).toFixed(2)}/mes` : `Billed monthly — $${Number(plan.price_monthly).toFixed(2)}/mo`));

              const isFreeDisabled = isFree && (isFreeTrialUsed || trialExpired);
              let buttonText = isFree ? (isFreeDisabled ? t('pricing.trialExpired') : t('pricing.startFreeTrial')) : isBasic ? t('pricing.goBasic') : t('pricing.goPremium');
              if (isCurrent) buttonText = t('pricing.currentPlan');

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-7 flex flex-col transition-all duration-300 hover:-translate-y-1 group
                    ${isBasic
                      ? 'bg-gradient-to-b from-amber-500/10 to-transparent border-2 border-amber-500/60 shadow-[0_0_40px_rgba(245,158,11,0.2)]'
                      : 'bg-[#111114] border border-white/8 hover:border-amber-500/30 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]'
                    } ${isCurrent ? 'ring-2 ring-emerald-500/50' : ''}`}
                >
                  {/* Badge */}
                  {badge && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest py-1 px-3 rounded-full whitespace-nowrap
                      ${isCurrent ? 'bg-emerald-500 text-black' : isBasic ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.6)]' : 'bg-white/8 text-amber-400 border border-amber-500/30'}`}>
                      {isCurrent ? t('pricing.activeBadge') : badge}
                    </div>
                  )}

                  {/* Icon + Plan Name */}
                  <div className="flex items-center gap-3 mb-4 mt-2">
                    <div className={`p-2 rounded-lg ${isBasic ? 'bg-amber-500/20' : 'bg-white/5'}`}>
                      <IconComp size={18} className={isBasic ? 'text-amber-400' : 'text-gray-400'} />
                    </div>
                    <h3 className="text-lg font-black font-display">{plan.name}</h3>
                  </div>

                  {/* Price */}
                  <div className="mb-5">
                    {isFree ? (
                      <div className="text-3xl font-black text-amber-400 mb-1" style={{ textShadow: '0 0 10px rgba(245,158,11,0.3)' }} title={`${trialValue} ${trialUnit}`}>
                        {trialValue} {trialUnit.charAt(0).toUpperCase() + trialUnit.slice(1)} Free
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-3xl font-black text-amber-400" style={{ textShadow: '0 0 10px rgba(245,158,11,0.3)' }}>
                          ${displayPrice}
                        </span>
                        <span className="text-gray-400 font-medium text-sm">{lang === 'pt' ? '/mês' : lang === 'es' ? '/mes' : '/month'}</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 leading-tight">{description}</p>
                  </div>

                  {/* Storage mode badge */}
                  <div className="mb-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${plan.id === 'premium' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                      {plan.id === 'premium' ? t('pricing.cloudStorage') : t('pricing.localStorage')}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className={`w-full h-px mb-5 ${isBasic ? 'bg-amber-500/20' : 'bg-white/5'}`}></div>

                  {/* Features */}
                  <div className="flex-1 mb-6">
                    <ul className="space-y-3">
                      {(plan.features as string[]).map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                          <div className={`mt-0.5 shrink-0 rounded-full p-0.5 ${isBasic ? 'bg-amber-500/20' : 'bg-white/5'}`}>
                            <Check size={12} className={isBasic ? 'text-amber-400' : 'text-gray-400'} />
                          </div>
                          <span className={isBasic ? 'text-white' : 'text-gray-300'}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => (isCurrent || isFreeDisabled) ? undefined : initiateCheckout(plan.id, isYearly)}
                    disabled={loadingPlan === plan.id || isCurrent || isFreeDisabled}
                    className={`w-full py-3.5 flex items-center justify-center gap-2 rounded-xl font-black text-center uppercase tracking-wider text-sm transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                      ${isBasic
                        ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)]'
                        : isCurrent
                          ? 'bg-emerald-500/10 text-emerald-400 border-2 border-emerald-500/30 cursor-default'
                          : isFreeDisabled
                            ? 'bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed'
                            : 'bg-transparent text-amber-400 border-2 border-amber-500/50 hover:border-amber-400 hover:bg-amber-500/5'
                      }`}
                  >
                    {loadingPlan === plan.id ? <Loader2 size={18} className="animate-spin" /> : buttonText}
                  </button>
                  {isFree && isFreeDisabled && (
                    <p className="text-[11px] text-center text-gray-500 mt-2">
                      {t('pricing.trialAlreadyUsed')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Trust Signals */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          {[
            { label: t('pricing.securePayments'), desc: t('pricing.poweredByStripe') },
            { label: t('pricing.cancelAnytime'), desc: t('pricing.noLockIn') },
            { label: t('pricing.support24h'), desc: t('pricing.alwaysHere') },
          ].map(item => (
            <div key={item.label} className="text-center">
              <p className="text-xs font-black text-amber-400 uppercase tracking-widest">{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/5 text-center text-xs text-gray-500 flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8">
          <a href="#" className="hover:text-amber-400 transition-colors">About Us</a>
          <a href="#" className="hover:text-amber-400 transition-colors">Features</a>
          <a href="#" className="hover:text-amber-400 transition-colors">Contact</a>
          <span>© {new Date().getFullYear()} Quantara Trading Lab. All rights reserved.</span>
        </footer>
      </div>
    </div>
  );
}
