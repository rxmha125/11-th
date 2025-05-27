// src/components/custom/code-editor-love-letter.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Typewriter } from '@/components/custom/typewriter';
import { FileTerminal, Heart } from 'lucide-react';

const loveMessage = `Hey love,

Happy 11 breathtaking months.

From every bug I fixed to every line of life we’ve written together —  
you’ve been my favorite function, my constant, my cleanest code.

Even in silence, you speak to my soul.  
Even in chaos, you bring peace to my heart.

You’re not just part of my life —  
you’ve rewritten my universe.

I still fall for you,  
like it’s the first hello —  
every single day.

Here’s to forever,  
compiled with care,  
and deployed in love. 🤍

— Yours, always. Your Coder.`;

const keywords = ["bug", "line of life", "function", "constant", "code", "universe", "hello", "compiled", "deployed"];

export function CodeEditorLoveLetter() {
  return (
    <Card className="glassmorphism shadow-2xl shadow-primary/20 w-full max-w-2xl mx-auto my-8 animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between p-3 bg-background/50 border-b border-primary/20 rounded-t-lg">
        <div className="flex items-center gap-2">
          <FileTerminal className="w-5 h-5 text-accent" />
          <span className="font-code-mono text-sm text-foreground/80">love-letter.rx</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-yellow-500 rounded-full opacity-70"></span>
          <span className="w-3 h-3 bg-green-500 rounded-full opacity-70"></span>
          <span className="w-3 h-3 bg-red-500 rounded-full opacity-70"></span>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="font-body-serif text-lg leading-relaxed text-foreground">
          <Typewriter 
            text={loveMessage} 
            speed={30} 
            className="font-body-serif"
            keywordClass="text-accent font-body-serif font-semibold italic"
            keywords={keywords}
          />
        </div>
        <div className="mt-6 flex justify-end items-center">
            <Heart className="w-5 h-5 text-primary animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
