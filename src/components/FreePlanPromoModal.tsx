import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Crown, Shield, Zap, Check } from 'lucide-react';

interface FreePlanPromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: any;
  isDailyLimit?: boolean;
}

const PLAN_HIGHLIGHTS = [
  {
    id: 'basic',
    icon: Shield,
    name: 'Basic',
    tagline: 'Para traders sérios',
    color: '#EAB308',
    perks: ['Trades ilimitados por dia', 'Contas ilimitadas', 'News & Feriados', 'Analytics completo'],
  },
  {
    id: 'premium',
    icon: Crown,
    name: 'Premium',
    tagline: 'Para traders profissionais',
    color: '#a855f7',
    perks: ['Tudo do Basic', 'Dados na nuvem ☁', 'Acesso multi-dispositivo', 'Suporte prioritário'],
  },
];

export default function FreePlanPromoModal({ isOpen, onClose, theme, isDailyLimit = false }: FreePlanPromoModalProps) {
  const navigate = useNavigate();

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
            className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <X size={18} />
          </button>

          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center border border-yellow-500/30">
              <Crown size={16} className="text-yellow-500" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-yellow-500">Oferta Especial</span>
          </div>

          {isDailyLimit ? (
            <>
              <h3 className="text-xl font-black font-display mb-1" style={{ color: text }}>
                Limite diário atingido! 🚀
              </h3>
              <p className="text-xs" style={{ color: secondaryText }}>
                Você usou todos os 10 trades gratuitos de hoje. Faça upgrade e continue usando sem parar.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-black font-display mb-1" style={{ color: text }}>
                Desbloqueie todo o potencial!
              </h3>
              <p className="text-xs" style={{ color: secondaryText }}>
                Você está no plano Free com acesso limitado. Veja o que está esperando por você:
              </p>
            </>
          )}
        </div>

        {/* Plan cards */}
        <div className="px-6 pb-4 grid grid-cols-2 gap-3">
          {PLAN_HIGHLIGHTS.map(plan => {
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
            className="w-full py-3.5 rounded-xl font-black text-sm transition-all hover:brightness-110 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #EAB308 0%, #a855f7 100%)', color: '#000' }}
          >
            Ver Planos e Preços ✨
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-bold text-xs transition-colors hover:bg-white/5"
            style={{ color: secondaryText }}
          >
            Continuar com o plano Free por enquanto
          </button>
        </div>
      </div>
    </div>
  );
}
