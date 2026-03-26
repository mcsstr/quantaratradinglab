import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { AlertTriangle, LogOut, ArrowRight } from 'lucide-react';

interface PlanExpiredModalProps {
  status: 'Suspended' | 'Inactive' | 'Expired';
}

export default function PlanExpiredModal({ status }: PlanExpiredModalProps) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
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

          <h2 className="text-2xl font-bold text-white mb-2">Plano Inativo</h2>
          
          <p className="text-gray-400 mb-8 leading-relaxed">
            {status === 'Suspended' 
              ? 'Sua conta foi suspensa por problemas no pagamento. Para continuar usando a plataforma, por favor renove sua assinatura.'
              : 'O seu plano expirou ou foi cancelado. Para continuar usando a plataforma, por favor assine um de nossos planos.'}
          </p>

          <div className="w-full space-y-3">
            <button 
              onClick={handleRenew}
              className="w-full bg-yellow-500 text-black font-bold py-3.5 rounded-xl hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
            >
              Renovar Plano <ArrowRight size={18} />
            </button>
            
            <button 
              onClick={handleSignOut}
              className="w-full bg-white/5 text-white font-medium py-3.5 rounded-xl hover:bg-white/10 transition-colors border border-white/10 flex items-center justify-center gap-2"
            >
              <LogOut size={18} /> Sair da conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
