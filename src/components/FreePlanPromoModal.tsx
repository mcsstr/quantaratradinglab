import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Crown, Shield, Zap, Check } from 'lucide-react';
import { getStoredLanguage, t as tFunc } from '../utils/i18n';

interface FreePlanPromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: any;
  isDailyLimit?: boolean;
}

export default function FreePlanPromoModal({ isOpen, onClose, theme, isDailyLimit = false }: FreePlanPromoModalProps) {
  const navigate = useNavigate();
  const lang = getStoredLanguage();

  if (!isOpen) return null;

  const bg = theme ? theme.fundoGeral || '#0a0a0c' : '#0a0a0c';
  const cardBg = theme ? theme.fundoCards : '#111114';
  const text = theme ? theme.textoPrincipal : '#fff';
  const secondaryText = theme ? theme.textoSecundario : '#9ca3af';
  const border = theme ? theme.contornoGeral : 'rgba(255,255,255,0.08)';

  const goToPricing = () => {
    onClose();
    navigate('/pricing');
  };

  const planHighlights = [
    {
      id: 'basic',
      icon: Shield,
      name: 'Basic',
      tagline: lang === 'pt' ? 'Para traders sérios' : lang === 'es' ? 'Para traders serios' : 'For serious traders',
      color: '#EAB308',
      perks: [
        lang === 'pt' ? 'Trades ilimitados por dia' : lang === 'es' ? 'Trades ilimitados por día' : 'Unlimited daily trades',
        lang === 'pt' ? 'Contas ilimitadas' : lang === 'es' ? 'Cuentas ilimitadas' : 'Unlimited accounts',
        lang === 'pt' ? 'News & Feriados' : lang === 'es' ? 'Noticias y Festivos' : 'News & Holidays',
        lang === 'pt' ? 'Analytics completo' : lang === 'es' ? 'Analytics completo' : 'Full Analytics suite'
      ],
    },
    {
      id: 'premium',
      icon: Crown,
      name: 'Premium',
      tagline: lang === 'pt' ? 'Para traders profissionais' : lang === 'es' ? 'Para traders profesionales' : 'For professional traders',
      color: '#a855f7',
      perks: [
        lang === 'pt' ? 'Tudo do Basic' : lang === 'es' ? 'Todo de Basic' : 'Everything in Basic',
        lang === 'pt' ? 'Dados na nuvem ☁' : lang === 'es' ? 'Datos en la nube ☁' : 'Cloud sync ☁',
        lang === 'pt' ? 'Acesso multi-dispositivo' : lang === 'es' ? 'Acceso multi-dispositivo' : 'Multi-device access',
        lang === 'pt' ? 'Suporte prioritário' : lang === 'es' ? 'Soporte prioritario' : 'Priority support'
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="rounded-2xl w-full max-w-md shadow-[0_24px_80px_rgba(0,0,0,0.8)] border overflow-hidden animate-tab-enter"
        style={{ backgroundColor: cardBg, borderColor: border }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.08) 0%, rgba(168,85,247,0.06) 100%)' }}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center border border-yellow-500/30">
              <Crown size={16} className="text-yellow-500" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-yellow-500">
              {lang === 'pt' ? 'Oferta Especial' : lang === 'es' ? 'Oferta Especial' : 'Special Offer'}
            </span>
          </div>

          {isDailyLimit ? (
            <>
              <h3 className="text-xl font-black font-display mb-1" style={{ color: text }}>
                {lang === 'pt' ? 'Limite diário atingido! 🚀' : lang === 'es' ? '¡Límite diario alcanzado! 🚀' : 'Daily limit reached! 🚀'}
              </h3>
              <p className="text-xs" style={{ color: secondaryText }}>
                {lang === 'pt'
                  ? 'Você usou todos os 10 trades gratuitos de hoje. Faça upgrade e continue usando sem parar.'
                  : lang === 'es'
                  ? 'Ha utilizado los 10 trades gratuitos de hoy. Actualice para continuar sin interrupciones.'
                  : 'You have used all 10 free trades for today. Upgrade to continue trading without limits.'}
              </p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-black font-display mb-1" style={{ color: text }}>
                {lang === 'pt' ? 'Desbloqueie todo o potencial!' : lang === 'es' ? '¡Desbloquea todo el potencial!' : 'Unlock full potential!'}
              </h3>
              <p className="text-xs" style={{ color: secondaryText }}>
                {lang === 'pt'
                  ? 'Você está no plano Free com acesso limitado. Veja o que está esperando por você:'
                  : lang === 'es'
                  ? 'Está en el plan Free con acceso limitado. Descubra lo que le espera:'
                  : 'You are on the Free plan with limited access. See what awaits you:'}
              </p>
            </>
          )}
        </div>

        {/* Plan cards */}
        <div className="px-6 pb-4 grid grid-cols-2 gap-3">
          {planHighlights.map(plan => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className="rounded-xl p-4 border"
                style={{ backgroundColor: `${bg}cc`, borderColor: `${plan.color}30` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${plan.color}15`, border: `1px solid ${plan.color}30` }}>
                    <Icon size={14} style={{ color: plan.color }} />
                  </div>
                  <div>
                    <p className="text-xs font-black" style={{ color: plan.color }}>{plan.name}</p>
                    <p className="text-[10px]" style={{ color: secondaryText }}>{plan.tagline}</p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {plan.perks.map((perk, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Check size={10} className="mt-0.5 shrink-0" style={{ color: plan.color }} />
                      <span className="text-[10px] leading-tight" style={{ color: secondaryText }}>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* CTAs */}
        <div className="px-6 pb-6 space-y-2">
          <button
            onClick={goToPricing}
            className="w-full py-3.5 rounded-xl font-black text-sm transition-all hover:brightness-110 active:scale-95 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #EAB308 0%, #a855f7 100%)', color: '#000' }}
          >
            {lang === 'pt' ? 'Ver Planos e Preços ✨' : lang === 'es' ? 'Ver Planes y Precios ✨' : 'View Plans & Pricing ✨'}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-bold text-xs transition-colors hover:bg-white/5 cursor-pointer"
            style={{ color: secondaryText }}
          >
            {lang === 'pt' ? 'Continuar com o plano Free por enquanto' : lang === 'es' ? 'Continuar con el plan Free por ahora' : 'Continue with Free plan for now'}
          </button>
        </div>
      </div>
    </div>
  );
}
