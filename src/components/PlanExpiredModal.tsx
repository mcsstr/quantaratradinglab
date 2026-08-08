import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { AlertTriangle, LogOut, ArrowRight } from 'lucide-react';
import { getStoredLanguage, t as tFunc } from '../utils/i18n';

interface PlanExpiredModalProps {
  status: 'Suspended' | 'Inactive' | 'Expired';
}

export default function PlanExpiredModal({ status }: PlanExpiredModalProps) {
  const navigate = useNavigate();
  const lang = getStoredLanguage();
  const t = (k: string) => tFunc(k, lang);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleRenew = () => {
    navigate('/pricing');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md">
      <div className="bg-[#111114] border border-white/10 p-8 rounded-2xl max-w-md w-full mx-4 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-red-500/20 blur-[60px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
            <AlertTriangle className="text-red-500" size={32} />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {lang === 'pt' ? 'Plano Inativo' : lang === 'es' ? 'Plan Inactivo' : 'Plan Inactive'}
          </h2>
          
          <p className="text-gray-400 mb-8 leading-relaxed text-sm">
            {status === 'Suspended' 
              ? (lang === 'pt' ? 'Sua conta foi suspensa. Para continuar usando a plataforma, por favor renove sua assinatura.' : lang === 'es' ? 'Su cuenta ha sido suspendida. Para continuar usando la plataforma, renueve su suscripción.' : 'Your account has been suspended. Please renew your subscription to continue using the platform.')
              : (lang === 'pt' ? 'O seu plano expirou ou foi cancelado. Para continuar usando a plataforma, por favor assine um de nossos planos.' : lang === 'es' ? 'Su plan ha expirado o ha sido cancelado. Para continuar usando la plataforma, suscríbase a uno de nuestros planes.' : 'Your plan has expired or was cancelled. Please subscribe to continue using the platform.')}
          </p>

          <div className="w-full space-y-3">
            <button 
              onClick={handleRenew}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold py-3.5 rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <span>{lang === 'pt' ? 'Renovar Plano' : lang === 'es' ? 'Renovar Plan' : 'Renew Plan'}</span>
              <ArrowRight size={18} />
            </button>
            
            <button 
              onClick={handleSignOut}
              className="w-full bg-white/5 text-white font-medium py-3.5 rounded-xl hover:bg-white/10 transition-colors border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={18} />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
