import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, Zap, Shield, Crown, Loader2, AlertTriangle, CloudUpload, CloudDownload, X, Clock } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { usePlanConfig } from '../hooks/usePlanConfig';
import './Dashboard.css';

const PLAN_ICONS: Record<string, any> = {
  free: Zap,
  basic: Shield,
  premium: Crown,
};
const PLAN_BADGES: Record<string, string> = {
  free: 'RISK-FREE START',
  basic: 'MOST POPULAR',
  premium: 'VIP',
};

// Confirmation modal for plan changes with storage implications
interface MigrationModalProps {
  type: 'upgrade' | 'downgrade';
  targetPlan: string;
  price: number;
  interval: 'monthly' | 'yearly';
  onConfirm: () => void;
  onCancel: () => void;
}

function MigrationModal({ type, targetPlan, price, interval, onConfirm, onCancel }: MigrationModalProps) {
  const isUpgrade = type === 'upgrade';
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111114] border border-yellow-500/30 rounded-2xl w-full max-w-md shadow-2xl p-8">
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
              {isUpgrade ? 'Upgrade to Cloud Storage' : 'Downgrade to Local Storage'}
            </h3>
          </div>
          <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Data migration info */}
        <div className={`rounded-xl p-4 mb-6 border ${isUpgrade ? 'bg-blue-500/5 border-blue-500/20' : 'bg-orange-500/5 border-orange-500/20'}`}>
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className={`mt-0.5 shrink-0 ${isUpgrade ? 'text-blue-400' : 'text-orange-400'}`} />
            <p className="text-sm leading-relaxed text-gray-300">
              {isUpgrade
                ? 'Your local trading data will be safely migrated to our secure cloud servers. You\'ll be able to access it from any device.'
                : 'Your cloud data will be transferred back to this browser\'s local storage. Important: this data will only exist on this device and this browser.'}
            </p>
          </div>
        </div>

        {/* Billing info */}
        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/8">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Billing Summary</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-yellow-500">${Number(price).toFixed(2)}</span>
            <span className="text-gray-500 text-sm">/ {interval === 'yearly' ? 'year' : 'month'}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Charged immediately upon confirmation. No prorations applied.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-bold text-gray-400 bg-white/5 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-xl font-black transition-all hover:brightness-110 active:scale-95 ${isUpgrade ? 'bg-blue-500 text-white' : 'bg-yellow-500 text-black'}`}
          >
            Confirm & Pay
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Pricing() {
  const navigate = useNavigate();
  const { plans, loading: plansLoading } = usePlanConfig();
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [currentUserPlan, setCurrentUserPlan] = useState<string | null>(null);
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

  useEffect(() => {
    // Detect trial expired redirect from Auth.tsx
    const params = new URLSearchParams(window.location.search);
    if (params.get('reason') === 'trial_expired') {
      setTrialExpired(true);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      supabase
        .from('profiles')
        .select('plan, storage_mode')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => {
          if (data?.plan) setCurrentUserPlan(data.plan.toLowerCase());
        });
    });
  }, []);

  const initiateCheckout = async (planId: string, isYearlyPlan: boolean) => {
    try {
      setLoadingPlan(planId);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Por favor, faça login para assinar um plano.');
        navigate('/auth');
        return;
      }

      if (planId === 'free') {
        navigate('/dashboard');
        return;
      }

      // Get priceId from the dynamic plans_config
      const targetPlan = plans.find(p => p.id === planId);
      if (!targetPlan) throw new Error('Plan configuration not found');

      const priceId = isYearlyPlan
        ? targetPlan.stripe_price_yearly
        : targetPlan.stripe_price_monthly;

      if (!priceId) throw new Error(`Stripe Price ID not configured for ${targetPlan.name} (${isYearlyPlan ? 'yearly' : 'monthly'})`);

      const price = isYearlyPlan ? targetPlan.price_yearly : targetPlan.price_monthly;
      const interval = isYearlyPlan ? 'yearly' : 'monthly';

      // Decide if we need a migration modal
      const isPremiumTarget = planId === 'premium';
      const isCurrentlyPremium = currentUserPlan === 'premium';
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

      // Direct checkout (no plan change or first subscription)
      await runCheckout(priceId, session);

    } catch (error: any) {
      console.error('Erro no checkout:', error);
      const errorMsg = error.context?.message || error.context?.error || error.message || JSON.stringify(error);
      alert(`Erro ao iniciar o pagamento: ${errorMsg}`);
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
      throw new Error('URL de checkout não retornada.');
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
      console.error('Erro no checkout:', error);
      const errorMsg = error.context?.message || error.context?.error || error.message || JSON.stringify(error);
      alert(`Erro ao iniciar o pagamento: ${errorMsg}`);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans relative overflow-hidden flex flex-col items-center justify-center p-4 py-16">

      {/* Trial Expired Banner */}
      {trialExpired && (
        <div className="fixed inset-0 z-[600] flex items-end justify-center p-6 pointer-events-none">
          <div className="bg-gradient-to-r from-red-900/90 to-orange-900/90 border border-red-500/40 rounded-2xl w-full max-w-2xl shadow-2xl p-6 pointer-events-auto backdrop-blur-md">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-500/20 rounded-xl shrink-0">
                <Clock size={22} className="text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-white text-lg mb-1">Seu período Free Trial expirou</h3>
                <p className="text-red-200 text-sm leading-relaxed">
                  Obrigado por experimentar a Quantara! Para continuar a acessar todas as ferramentas, escolha um plano abaixo.
                  O <strong>Basic</strong> mantém os seus dados localmente. O <strong>Premium</strong> guarda tudo na cloud, acessível de qualquer dispositivo.
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
          onConfirm={handleMigrationConfirm}
          onCancel={() => { setMigrationModal(null); setLoadingPlan(null); }}
        />
      )}

      {/* Ambient background glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-yellow-500/8 blur-[140px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-yellow-500/6 blur-[160px] rounded-full"></div>
        <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] bg-blue-500/4 blur-[120px] rounded-full"></div>
      </div>

      <div className="z-10 w-full max-w-6xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-8 left-8 text-gray-400 hover:text-yellow-500 flex items-center gap-2 transition-colors text-sm font-bold group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        {/* Header */}
        <div className="text-center mb-12 mt-6">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-widest text-yellow-500">Upgrade Your Trading Edge</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 font-display tracking-tight leading-tight"
            style={{ textShadow: '0 0 40px rgba(234,179,8,0.3)' }}>
            Choose Your<br />
            <span className="text-yellow-500">Power Plan</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Unlock professional-grade analytics, real-time insights, and tools built for serious traders.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-4 mb-14">
          <span className={`text-sm font-bold transition-colors ${!isYearly ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="w-14 h-7 bg-white/10 rounded-full relative p-1 cursor-pointer border border-white/10 hover:border-yellow-500/40 transition-colors"
            aria-label="Toggle billing period"
          >
            <div className={`w-5 h-5 bg-yellow-500 rounded-full shadow-[0_0_12px_rgba(234,179,8,0.8)] transition-transform duration-300 ${isYearly ? 'translate-x-7' : 'translate-x-0'}`}></div>
          </button>
          <span className={`text-sm font-bold transition-colors ${isYearly ? 'text-white' : 'text-gray-500'}`}>
            Yearly
            <span className="ml-2 text-xs font-black text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-2 py-0.5">Save 20%</span>
          </span>
        </div>

        {/* Plans Grid */}
        {plansLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-yellow-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const IconComp = PLAN_ICONS[plan.id] || Shield;
              const isBasic = plan.id === 'basic';
              const isFree = plan.id === 'free';
              const isCurrent = currentUserPlan === plan.id;
              const badge = PLAN_BADGES[plan.id];
              const displayPrice = isFree ? '0.00' : (isYearly ? (plan.price_yearly / 12).toFixed(2) : Number(plan.price_monthly).toFixed(2));
              const yearlyDesc = `$${Number(plan.price_yearly).toFixed(2)}/year — save $${(plan.price_monthly * 12 - plan.price_yearly).toFixed(2)}`;
              const monthlyDesc = `Billed monthly — $${Number(plan.price_monthly).toFixed(2)}/mo`;
              const trialValue = plan.trial_duration_value || plan.trial_days;
              const trialUnit = plan.trial_duration_unit || 'days';
              
              const description = isFree
                ? `$0 for the first ${trialValue} ${trialUnit}. Then choose a paid plan to continue.`
                : (isYearly ? yearlyDesc : monthlyDesc);

              let buttonText = isFree ? 'Start Free Trial' : isBasic ? 'Go Basic' : 'Go Premium';
              if (isCurrent) buttonText = 'Current Plan';

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-7 flex flex-col transition-all duration-300 hover:-translate-y-1 group
                    ${isBasic
                      ? 'bg-gradient-to-b from-yellow-500/10 to-transparent border-2 border-yellow-500/60 shadow-[0_0_40px_rgba(234,179,8,0.2)]'
                      : 'bg-[#111114] border border-white/8 hover:border-yellow-500/30 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]'
                    } ${isCurrent ? 'ring-2 ring-green-500/50' : ''}`}
                >
                  {/* Badge */}
                  {badge && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest py-1 px-3 rounded-full whitespace-nowrap
                      ${isCurrent ? 'bg-green-500 text-black' : isBasic ? 'bg-yellow-500 text-black shadow-[0_0_12px_rgba(234,179,8,0.6)]' : 'bg-white/8 text-yellow-500 border border-yellow-500/30'}`}>
                      {isCurrent ? '✓ ACTIVE' : badge}
                    </div>
                  )}

                  {/* Icon + Plan Name */}
                  <div className="flex items-center gap-3 mb-4 mt-2">
                    <div className={`p-2 rounded-lg ${isBasic ? 'bg-yellow-500/20' : 'bg-white/5'}`}>
                      <IconComp size={18} className={isBasic ? 'text-yellow-500' : 'text-gray-400'} />
                    </div>
                    <h3 className="text-lg font-black font-display">{plan.name}</h3>
                  </div>

                  {/* Price */}
                  <div className="mb-5">
                    {isFree ? (
                      <div className="text-3xl font-black text-yellow-500 mb-1" style={{ textShadow: '0 0 10px rgba(234,179,8,0.3)' }} title={`${trialValue} ${trialUnit}`}>
                        {trialValue} {trialUnit.charAt(0).toUpperCase() + trialUnit.slice(1)} Free
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-3xl font-black text-yellow-500" style={{ textShadow: '0 0 10px rgba(234,179,8,0.3)' }}>
                          ${displayPrice}
                        </span>
                        <span className="text-gray-500 font-medium text-sm">/month</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 leading-tight">{description}</p>
                  </div>

                  {/* Storage mode badge */}
                  <div className="mb-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${plan.id === 'premium' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                      {plan.id === 'premium' ? '☁ Cloud Storage' : '💾 Local Storage'}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className={`w-full h-px mb-5 ${isBasic ? 'bg-yellow-500/20' : 'bg-white/5'}`}></div>

                  {/* Features */}
                  <div className="flex-1 mb-6">
                    <ul className="space-y-3">
                      {(plan.features as string[]).map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                          <div className={`mt-0.5 shrink-0 rounded-full p-0.5 ${isBasic ? 'bg-yellow-500/20' : 'bg-white/5'}`}>
                            <Check size={12} className={isBasic ? 'text-yellow-500' : 'text-gray-400'} />
                          </div>
                          <span className={isBasic ? 'text-white' : 'text-gray-400'}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => isCurrent ? undefined : initiateCheckout(plan.id, isYearly)}
                    disabled={loadingPlan === plan.id || isCurrent}
                    className={`w-full py-3.5 flex items-center justify-center gap-2 rounded-xl font-black text-center uppercase tracking-wider text-sm transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                      ${isBasic
                        ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:shadow-[0_0_30px_rgba(234,179,8,0.6)]'
                        : isCurrent
                          ? 'bg-green-500/10 text-green-400 border-2 border-green-500/30 cursor-default'
                          : 'bg-transparent text-yellow-500 border-2 border-yellow-500/50 hover:border-yellow-500 hover:bg-yellow-500/5'
                      }`}
                  >
                    {loadingPlan === plan.id ? <Loader2 size={18} className="animate-spin" /> : buttonText}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Trust Signals */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          {[
            { label: 'Secure Payments', desc: 'Powered by Stripe' },
            { label: 'Cancel Anytime', desc: 'No lock-in contracts' },
            { label: '24h Support', desc: 'Always here to help' },
          ].map(item => (
            <div key={item.label} className="text-center">
              <p className="text-xs font-black text-yellow-500 uppercase tracking-widest">{item.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/5 text-center text-xs text-gray-600 flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8">
          <a href="#" className="hover:text-yellow-500 transition-colors">About Us</a>
          <a href="#" className="hover:text-yellow-500 transition-colors">Features</a>
          <a href="#" className="hover:text-yellow-500 transition-colors">Contact</a>
          <a href="#" className="hover:text-yellow-500 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-yellow-500 transition-colors">Terms of Service</a>
          <span>© 2024 Quantara Trading Lab. All rights reserved.</span>
        </footer>
      </div>
    </div>
  );
}
