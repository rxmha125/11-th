// src/components/custom/app-header.tsx
import React from 'react';
import { Sparkles } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="py-8 text-center">
      <h1 className="text-5xl md:text-6xl font-bold text-accent text-glow animate-fade-in flex items-center justify-center gap-3">
        <Sparkles className="w-10 h-10 text-accent opacity-80" />
        I love you suha
        <Sparkles className="w-10 h-10 text-accent opacity-80" />
      </h1>
    </header>
  );
}
