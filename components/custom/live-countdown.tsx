// src/components/custom/live-countdown.tsx
"use client";

import React from 'react';
import { TimerIcon } from 'lucide-react';

export function LiveCountdown() {
  return (
    <div className="flex flex-col items-center justify-center p-4 glassmorphism rounded-lg shadow-lg text-center animate-fade-in-delay-1">
      <TimerIcon className="w-8 h-8 text-accent mb-2" />
      <h3 className="text-xl font-semibold mb-1 text-foreground">Our Journey So Far</h3>
      <div className="font-body-serif text-3xl text-accent mt-1">
        11 Months🫶😽
      </div>
    </div>
  );
}
