'use client';
import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export default function LoadingSpinner({
  label = 'Loading PitchConnect...',
  fullScreen = false,
  size = 'md',
}) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing halo */}
        <div className="absolute w-16 h-16 rounded-3xl bg-emerald/20 animate-ping opacity-60 pointer-events-none" />
        
        {/* Core emblem container */}
        <div className="w-14 h-14 rounded-2xl bg-forest text-white flex items-center justify-center shadow-lg border border-emerald/40 relative z-10">
          <Sparkles className="w-6 h-6 text-emerald animate-pulse" />
        </div>

        {/* Orbiting spinner ring */}
        <Loader2 className="absolute w-20 h-20 text-emerald animate-spin stroke-[1.5] -inset-3" />
      </div>

      <div className="text-center space-y-1 z-10 pt-2">
        <p className="text-xs font-bold uppercase tracking-wider text-charcoal">
          {label}
        </p>
        <p className="text-[11px] text-charcoal-muted">
          Synchronizing institutional venture ledger...
        </p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center w-full">
        {spinner}
      </div>
    );
  }

  return spinner;
}
