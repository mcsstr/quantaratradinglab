import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { migrateLocalToCloud, migrateCloudToLocal } from '../utils/storageMigration';

export default function Loading() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [userName, setUserName] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('We are preparing your trading lab...');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // Fetch logged-in user name
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single();
        if (profile?.first_name) {
          setUserName(profile.first_name);
        } else {
          setUserName(user.email?.split('@')[0] || 'Trader');
        }
      }
    };
    fetchUser();
  }, []);

  // Normal Loading / Checkout Polling Logic
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutStatus = urlParams.get('checkout');

    if (checkoutStatus === 'success') {
      setIsProcessingCheckout(true);
      setLoadingMessage('Confirming your subscription...');

      const pollSubscription = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/auth'); return; }

        let attempts = 0;
        const maxAttempts = 20; // up to 20 * 2s = 40s wait

        while (attempts < maxAttempts) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('status, plan, storage_mode')
            .eq('id', user.id)
            .single();

          // Webhook has processed and plan is active
          if (profile && profile.status === 'Active' && profile.plan && profile.plan.toLowerCase() !== 'free') {
            setLoadingMessage('Subscription confirmed! Syncing your data...');
            setProgress(90);

            // ============================================================
            // PHASE 5: Run storage migration based on the new plan
            // ============================================================
            try {
              const newPlan = (profile.plan || '').toLowerCase();
              const storageMode = profile.storage_mode;

              if (newPlan === 'premium' || storageMode === 'cloud') {
                // Upgraded to Premium → push local data to Supabase cloud
                setLoadingMessage('Migrating your data to the cloud ☁...');
                const result = await migrateLocalToCloud(user.id);
                if (result.migrated > 0) {
                  setLoadingMessage(`${result.migrated} trades synced to cloud! Redirecting...`);
                } else {
                  setLoadingMessage('Subscription confirmed! Redirecting...');
                }
              } else if (newPlan === 'basic' || storageMode === 'local') {
                // Downgraded to Basic → pull cloud data back to local storage
                setLoadingMessage('Saving your data to local storage 💾...');
                const result = await migrateCloudToLocal(user.id);
                if (result.migrated > 0) {
                  setLoadingMessage(`${result.migrated} trades saved locally! Redirecting...`);
                } else {
                  setLoadingMessage('Subscription confirmed! Redirecting...');
                }
              } else {
                setLoadingMessage('Subscription confirmed! Redirecting...');
              }
            } catch (migrationErr) {
              // Migration failure is non-fatal — user still gets access
              console.warn('Data migration encountered an issue:', migrationErr);
              setLoadingMessage('Subscription confirmed! Redirecting...');
            }

            setProgress(100);
            setTimeout(() => { navigate('/dashboard'); }, 1500);
            return;
          }

          attempts++;
          setProgress(Math.min((attempts / maxAttempts) * 100, 85));
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Timed out — send to dashboard anyway
        navigate('/dashboard');
      };

      pollSubscription();

    } else {
      // Normal Loading (not checkout return)
      const duration = 2500;
      const intervalTime = 50;
      const steps = duration / intervalTime;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const newProgress = Math.min(Math.round((currentStep / steps) * 100), 100);
        setProgress(newProgress);

        if (currentStep >= steps) {
          clearInterval(timer);
          setTimeout(() => { navigate('/dashboard'); }, 300);
        }
      }, intervalTime);

      return () => clearInterval(timer);
    }
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
            <circle
              cx="50" cy="50" r="45"
              fill="transparent"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
            />
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
          <p className={isProcessingCheckout ? 'text-green-400 font-medium animate-pulse' : 'text-gray-400'}>
            {loadingMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
