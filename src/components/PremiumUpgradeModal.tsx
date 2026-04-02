import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, X, BarChart2, Newspaper, CalendarDays, Palette, PlusCircle, Zap, Check } from 'lucide-react';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
  theme?: any;
  /** If true, shows "Limite diário atingido" message instead of generic locked feature text */
  isDailyLimit?: boolean;
}

const PREMIUM_PERKS = [
  { icon: BarChart2, label: 'Analytics completo com todos os gráficos' },
  { icon: Newspaper, label: 'Inserção ilimitada de notícias' },
  { icon: CalendarDays, label: 'Gerenciamento de feriados' },
  { icon: Palette, label: 'Personalização completa de tema' },
  { icon: PlusCircle, label: 'Contas ilimitadas' },
  { icon: Zap, label: 'Trades ilimitados por dia' },
];

export default function PremiumUpgradeModal({ isOpen, onClose, featureName, theme, isDailyLimit = false }: PremiumUpgradeModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);

  const bg = theme ? theme.fundoCards : '#111114';
  const text = theme ? theme.textoPrincipal : '#fff';
  const secondaryText = theme ? theme.textoSecundario : '#9ca3af';
  const border = theme ? theme.contornoGeral : 'rgba(255,255,255,0.08)';

  const goToPricing = () => {
    onClose();
    setStep(1);
    navigate('/pricing');
  };

  const handleClose = () => {
    onClose();
    setStep(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={handleClose}>
      <div
        className="rounded-2xl w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col border animate-tab-enter overflow-hidden"
        style={{ backgroundColor: bg, borderColor: border }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="flex justify-end p-3 pb-0">
          <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
            <X size={18} />
          </button>
        </div>

        {step === 1 ? (
          /* STEP 1: Initial upgrade prompt */
          <div className="px-8 pb-8 pt-2 text-center">
            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-yellow-500/30 shadow-[0_0_25px_rgba(234,179,8,0.25)]">
              <Crown size={30} className="text-yellow-500" />
            </div>

            {isDailyLimit ? (
              <>
                <h3 className="text-xl font-black font-display mb-2" style={{ color: text }}>Limite diário atingido</h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: secondaryText }}>
                  Você atingiu o limite de <strong className="text-yellow-500">10 trades por dia</strong> do plano Free. Faça upgrade para continuar usando sem restrições!
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-black font-display mb-2" style={{ color: text }}>Recurso Premium</h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: secondaryText }}>
                  O recurso <strong className="text-yellow-500">{featureName || 'selecionado'}</strong> está disponível apenas nos planos pagos. Faça upgrade para ter acesso completo!
                </p>
              </>
            )}

            <button
              onClick={goToPricing}
              className="w-full py-3.5 rounded-xl font-black bg-yellow-500 text-black transition-all hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(234,179,8,0.4)] mb-3"
            >
              Fazer Upgrade ✨
            </button>
            <button
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl font-bold text-sm transition-colors hover:bg-white/5"
              style={{ color: secondaryText }}
            >
              Continuar com o Free
            </button>
          </div>
        ) : (
          /* STEP 2: What you're missing */
          <div className="px-8 pb-8 pt-2">
            <div className="text-center mb-5">
              <h3 className="text-lg font-black font-display mb-1" style={{ color: text }}>O que você está perdendo...</h3>
              <p className="text-xs" style={{ color: secondaryText }}>Com um plano pago, você teria acesso a:</p>
            </div>

            <ul className="space-y-2.5 mb-6">
              {PREMIUM_PERKS.map((perk, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                    <perk.icon size={13} className="text-yellow-500" />
                  </div>
                  <span className="text-xs font-medium" style={{ color: secondaryText }}>{perk.label}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={goToPricing}
              className="w-full py-3.5 rounded-xl font-black bg-yellow-500 text-black transition-all hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(234,179,8,0.4)] mb-3"
            >
              Upgrade agora →
            </button>
            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl font-bold text-xs transition-colors hover:bg-white/5"
              style={{ color: secondaryText }}
            >
              Não, obrigado — continuar com o Free
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
