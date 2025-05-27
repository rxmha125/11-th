// src/components/custom/app-footer.tsx
import React from 'react';
import { Heart, Code } from 'lucide-react';

export function AppFooter() {
  return (
    <footer className="py-8 text-center text-foreground/70 font-code-mono text-xs border-t border-primary/20 mt-16">
      <div className="flex items-center justify-center gap-1 mb-1">
        crafted with <Code className="w-4 h-4 text-accent" /> + <Heart className="w-4 h-4 text-primary fill-primary" /> by Your Coder
      </div>
      <div>
        powered by: Rx Codex Medium v1 (Love Mode Enabled)
      </div>
    </footer>
  );
}
