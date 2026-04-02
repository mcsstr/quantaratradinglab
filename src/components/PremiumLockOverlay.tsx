import React from 'react';
import { Crown } from 'lucide-react';

interface PremiumLockOverlayProps {
  onUpgradeClick: () => void;
  className?: string;
}

export default function PremiumLockOverlay({ onUpgradeClick, className = '' }: PremiumLockOverlayProps) {
  return (
    <div 
      className={`absolute inset-0 z-[50] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md cursor-pointer rounded-xl transition-all hover:bg-black/70 ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onUpgradeClick();
      }}
    >
      <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mb-2 border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
        <Crown size={24} className="text-yellow-500" />
      </div>
      <span className="text-xs font-black uppercase tracking-widest text-yellow-500">Premium Only</span>
    </div>
  );
}
