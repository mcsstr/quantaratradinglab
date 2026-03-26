import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, Zap, Shield, Crown, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabase';
import './Dashboard.css';

const plans = [
  {
    id: 'free',
    name: 'Trial Plan',
    badge: 'RISK-FREE START',
    icon: Zap,
    priceMonthly: 0,
    priceYearly: 0,
    description: '$0 for the first 30 days, then auto-bills at $49/month.',
    features: [
      'Advanced Analytics',
      'Limited Backtesting (Last 3 years)',
      'Daily Market Briefs',
      'Community Access'
    ],
    buttonText: 'Start Free Trial',
    stripeLink: '#'
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    badge: 'MOST POPULAR',
    icon: Shield,
    priceMonthly: 99,
    priceYearly: 990,
    description: '$1,188 billed annually – save $180',
    features: [
      'Unlimited Advanced Analytics',
      'Full Backtesting (All available data)',
      'Real-time Alerts & Notifications',
      'API Access',
      'Priority Support',
      'Exclusive Strategy Webinars'
    ],
    buttonText: 'Go Pro',
    stripeLink: '#'
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    badge: 'VIP',
    icon: Crown,
    priceMonthly: 199,
    priceYearly: 1990,
    description: '$2,388 billed annually – save $398',
    features: [
      'Everything in Pro',
      '1-on-1 Mentorship Sessions',
      'Custom Algorithm Development',
      'Dedicated Account Manager',
      'Early Access to New Features',
      'VIP Networking Events'
    ],
    buttonText: 'Go Premium',
    stripeLink: '#'
  }
];

export default function Pricing() {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCheckout = async (planId: string, isYearlyPlan: boolean) => {
    try {
      setLoadingPlan(planId);
      
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        navigate('/auth');
        return;
      }

      // Determine correct Price ID (Replace these with your actual Stripe Price IDs later in .env or hardcoded here)
      // Example placeholders:
      let priceId = '';
      if (planId === 'free') priceId = 'trial'; // Handle trial logic in edge function
      if (planId === 'pro') priceId = isYearlyPlan ? 'price_pro_yearly_id' : 'price_pro_monthly_id';
      if (planId === 'premium') priceId = isYearlyPlan ? 'price_premium_yearly_id' : 'price_premium_monthly_id';

      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: { priceId, billing_interval: isYearlyPlan ? 'yearly' : 'monthly' }
      });

      if (error) {
        throw new Error(error.message || 'Failed to initialize checkout');
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert(`Error starting checkout: ${err.message}`);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans relative overflow-hidden flex flex-col items-center justify-center p-4 py-16">

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
            Unlock professional-grade analytics, real-time insights, and tools built for serious traders. Cancel anytime.
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const IconComp = plan.icon;
            const isPro = plan.id === 'pro';
            const isFree = plan.id === 'free';
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-7 flex flex-col transition-all duration-300 hover:-translate-y-1 group
                  ${isPro
                    ? 'bg-gradient-to-b from-yellow-500/10 to-transparent border-2 border-yellow-500/60 shadow-[0_0_40px_rgba(234,179,8,0.2)]'
                    : 'bg-[#111114] border border-white/8 hover:border-yellow-500/30 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]'
                  }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest py-1 px-3 rounded-full whitespace-nowrap
                    ${isPro ? 'bg-yellow-500 text-black shadow-[0_0_12px_rgba(234,179,8,0.6)]' : 'bg-white/8 text-yellow-500 border border-yellow-500/30'}`}>
                    {plan.badge}
                  </div>
                )}

                {/* Icon + Plan Name */}
                <div className="flex items-center gap-3 mb-4 mt-2">
                  <div className={`p-2 rounded-lg ${isPro ? 'bg-yellow-500/20' : 'bg-white/5'}`}>
                    <IconComp size={18} className={isPro ? 'text-yellow-500' : 'text-gray-400'} />
                  </div>
                  <h3 className="text-lg font-black font-display">{plan.name}</h3>
                </div>

                {/* Price */}
                <div className="mb-5">
                  {isFree ? (
                    <div className="text-3xl font-black text-yellow-500 mb-1" style={{ textShadow: '0 0 10px rgba(234,179,8,0.3)' }}>
                      30 Days Free
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-3xl font-black text-yellow-500" style={{ textShadow: '0 0 10px rgba(234,179,8,0.3)' }}>
                        ${isYearly ? Math.round(plan.priceYearly / 12) : plan.priceMonthly}
                      </span>
                      <span className="text-gray-500 font-medium text-sm">/month</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 leading-tight">{isYearly && !isFree ? plan.description : (!isFree ? `Billed monthly — $${plan.priceMonthly}/mo` : plan.description)}</p>
                </div>

                {/* Divider */}
                <div className={`w-full h-px mb-5 ${isPro ? 'bg-yellow-500/20' : 'bg-white/5'}`}></div>

                {/* Features */}
                <div className="flex-1 mb-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                        <div className={`mt-0.5 shrink-0 rounded-full p-0.5 ${isPro ? 'bg-yellow-500/20' : 'bg-white/5'}`}>
                          <Check size={12} className={isPro ? 'text-yellow-500' : 'text-gray-400'} />
                        </div>
                        <span className={isPro ? 'text-white' : 'text-gray-400'}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleCheckout(plan.id, isYearly)}
                  disabled={loadingPlan === plan.id}
                  className={`w-full py-3.5 flex items-center justify-center gap-2 rounded-xl font-black text-center uppercase tracking-wider text-sm transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                    ${isPro
                      ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:shadow-[0_0_30px_rgba(234,179,8,0.6)]'
                      : 'bg-transparent text-yellow-500 border-2 border-yellow-500/50 hover:border-yellow-500 hover:bg-yellow-500/5'
                    }`}
                >
                  {loadingPlan === plan.id ? <Loader2 size={18} className="animate-spin" /> : plan.buttonText}
                </button>
              </div>
            );
          })}
        </div>

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
