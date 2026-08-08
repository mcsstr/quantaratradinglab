import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, X, BarChart2, Newspaper, CalendarDays, Palette, PlusCircle, Zap } from 'lucide-react';
import { getStoredLanguage } from '../utils/i18n';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
  theme?: any;
  /** If true, shows "Limite diário atingido" message instead of generic locked feature text */
  isDailyLimit?: boolean;
}

export default function PremiumUpgradeModal({ isOpen, onClose, featureName, theme, isDailyLimit = false }: PremiumUpgradeModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const lang = getStoredLanguage();

  const bg = theme ? theme.fundoCards : '#111114';
  const text = theme ? theme.textoPrincipal : '#fff';
  const secondaryText = theme ? theme.textoSecundario : '#9ca3af';
  const border = theme ? theme.contornoGeral : 'rgba(255,255,255,0.08)';

  const premiumPerks = [
    { icon: BarChart2, label: lang === 'pt' ? 'Analytics completo com todos os gráficos' : lang === 'es' ? 'Analytics completo con todos los gráficos' : 'Full Analytics with all institutional charts' },
    { icon: Newspaper, label: lang === 'pt' ? 'Inserção ilimitada de notícias' : lang === 'es' ? 'Inserción ilimitada de noticias' : 'Unlimited macro news events' },
    { icon: CalendarDays, label: lang === 'pt' ? 'Gerenciamento de feriados' : lang === 'es' ? 'Gestión de días festivos' : 'Market holiday calendar management' },
    { icon: Palette, label: lang === 'pt' ? 'Personalização completa de tema' : lang === 'es' ? 'Personalización completa de tema' : 'Full theme & layout customization' },
    { icon: PlusCircle, label: lang === 'pt' ? 'Contas ilimitadas' : lang === 'es' ? 'Cuentas ilimitadas' : 'Unlimited trading accounts' },
    { icon: Zap, label: lang === 'pt' ? 'Trades ilimitados por dia' : lang === 'es' ? 'Trades ilimitados por día' : 'Unlimited trades per day' },
  ];

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
          <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer">
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
                <h3 className="text-xl font-black font-display mb-2" style={{ color: text }}>
                  {lang === 'pt' ? 'Limite diário atingido' : lang === 'es' ? 'Límite diario alcanzado' : 'Daily limit reached'}
                </h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: secondaryText }}>
                  {lang === 'pt' ? (
                    <>Você atingiu o limite de <strong className="text-yellow-500">10 trades por dia</strong> do plano Free. Faça upgrade para continuar usando sem restrições!</>
                  ) : lang === 'es' ? (
                    <>Ha alcanzado el límite de <strong className="text-yellow-500">10 trades por día</strong> del plan Free. ¡Actualice para continuar sin restricciones!</>
                  ) : (
                    <>You have reached the <strong className="text-yellow-500">10 trades/day</strong> limit on Free. Upgrade to continue trading with zero restrictions!</>
                  )}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-black font-display mb-2" style={{ color: text }}>
                  {lang === 'pt' ? 'Recurso Premium' : lang === 'es' ? 'Recurso Premium' : 'Premium Feature'}
                </h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: secondaryText }}>
                  {lang === 'pt' ? (
                    <>O recurso <strong className="text-yellow-500">{featureName || 'selecionado'}</strong> está disponível apenas nos planos pagos. Faça upgrade para ter acesso completo!</>
                  ) : lang === 'es' ? (
                    <>El recurso <strong className="text-yellow-500">{featureName || 'seleccionado'}</strong> está disponible solo en planes de pago. ¡Actualice para tener acceso completo!</>
                  ) : (
                    <>The feature <strong className="text-yellow-500">{featureName || 'selected'}</strong> is exclusive to paid plans. Upgrade for unrestricted access!</>
                  )}
                </p>
              </>
            )}

            <button
              onClick={goToPricing}
              className="w-full py-3.5 rounded-xl font-black bg-yellow-500 text-black transition-all hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(234,179,8,0.4)] mb-3 cursor-pointer"
            >
              {lang === 'pt' ? 'Fazer Upgrade ✨' : lang === 'es' ? 'Hacer Upgrade ✨' : 'Upgrade Now ✨'}
            </button>
            <button
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl font-bold text-sm transition-colors hover:bg-white/5 cursor-pointer"
              style={{ color: secondaryText }}
            >
              {lang === 'pt' ? 'Continuar com o Free' : lang === 'es' ? 'Continuar con el Free' : 'Continue with Free'}
            </button>
          </div>
        ) : (
          /* STEP 2: What you're missing */
          <div className="px-8 pb-8 pt-2">
            <div className="text-center mb-5">
              <h3 className="text-lg font-black font-display mb-1" style={{ color: text }}>
                {lang === 'pt' ? 'O que você está perdendo...' : lang === 'es' ? 'Lo que te estás perdiendo...' : 'What you are missing...'}
              </h3>
              <p className="text-xs" style={{ color: secondaryText }}>
                {lang === 'pt' ? 'Com um plano pago, você tem acesso a:' : lang === 'es' ? 'Con un plan de pago, obtienes acceso a:' : 'With a paid plan, you unlock:'}
              </p>
            </div>

            <ul className="space-y-2.5 mb-6">
              {premiumPerks.map((perk, i) => (
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
              className="w-full py-3.5 rounded-xl font-black bg-yellow-500 text-black transition-all hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(234,179,8,0.4)] mb-3 cursor-pointer"
            >
              {lang === 'pt' ? 'Upgrade agora →' : lang === 'es' ? 'Upgrade ahora →' : 'Upgrade now →'}
            </button>
            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl font-bold text-xs transition-colors hover:bg-white/5 cursor-pointer"
              style={{ color: secondaryText }}
            >
              {lang === 'pt' ? 'Não, obrigado — continuar no Free' : lang === 'es' ? 'No, gracias — continuar en Free' : 'No thanks — stay on Free'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
