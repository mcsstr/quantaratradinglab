import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

export default function Loading() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [userName, setUserName] = useState('');

  // Buscar nome do usuário logado
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Tentar pegar first_name do perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single();
        if (profile?.first_name) {
          setUserName(profile.first_name);
        } else {
          // Fallback: usar email antes do @
          setUserName(user.email?.split('@')[0] || 'Trader');
        }
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const duration = 2500; // 2.5 seconds
    const intervalTime = 50;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min(Math.round((currentStep / steps) * 100), 100);
      setProgress(newProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(() => {
          navigate('/dashboard');
        }, 300);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-16">
          <img src="/logo.png" alt="Quantara Logo" className="w-12 h-12 object-contain" />
          <span className="text-3xl font-bold font-display">Quantara</span>
        </div>

        {/* Circular Progress */}
        <div className="relative w-32 h-32 mb-10">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50" cy="50" r="45"
              fill="transparent"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
            />
            {/* Progress circle */}
            <circle
              cx="50" cy="50" r="45"
              fill="transparent"
              stroke="#EAB308"
              strokeWidth="4"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * progress) / 100}
              strokeLinecap="round"
              className="transition-all duration-75 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold font-mono">{progress}%</span>
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-medium">
            Welcome back{userName ? `, ${userName}` : ''}.
          </h2>
          <p className="text-gray-400">We are preparing your trading lab...</p>
        </div>
      </div>
    </div>
  );
}
