// src/components/custom/surprise-universe-unlock.tsx
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PolaroidCard } from './polaroid-card';
import { Sparkles, Rocket } from 'lucide-react';
import { getLoveAiMessage } from '@/ai/flows/love-ai-companion';
import { useToast } from '@/hooks/use-toast';

const galleryMoments = Array.from({ length: 11 }, (_, i) => ({
  id: i + 1,
  imageUrl: `https://placehold.co/250x250.png?a=${i}`, // Placeholder, unique for caching
  caption: `Moment ${i + 1}`,
  altText: `Our special moment ${i + 1}`,
  aiHint: `couple happy moments` // Generic hint for placeholder images
}));

export function SurpriseUniverseUnlock() {
  const [isOpen, setIsOpen] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const { toast } = useToast();

  const handleUnlock = async () => {
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 1500); // Particle effect duration
    
    setIsOpen(true);
    
    // Dispatch custom event for LoveAICompanion
    window.dispatchEvent(new CustomEvent('loveai-interact', { detail: { interaction: "unlocked our universe" } }));
    
    try {
      // Optional: Trigger AI message for toast
      const aiResponse = await getLoveAiMessage({ userInteraction: "unlocked our universe" });
      toast({
        title: "AI Companion 💖",
        description: aiResponse.message,
      });
    } catch (error) {
      console.error("AI message error:", error);
      toast({
        title: "AI Companion 💖",
        description: "Our universe is full of wonders! ✨", // Fallback toast
        variant: "default"
      });
    }
  };

  return (
    <div className="text-center my-12 animate-fade-in-delay-3 relative">
      <Button
        onClick={handleUnlock}
        variant="default"
        size="lg"
        className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-8 px-10 rounded-full shadow-xl shadow-primary/30 transform transition-all duration-300 hover:scale-110 group"
      >
        <Rocket className="w-6 h-6 mr-3 group-hover:animate-ping" />
        Click to unlock our universe
        <Sparkles className="w-6 h-6 ml-3 group-hover:animate-spin" />
      </Button>

      {showParticles && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Particle Burst Effect */}
          {Array.from({ length: 20 }).map((_, i) => (
            <Sparkles
              key={i}
              className="absolute text-accent animate-ping opacity-0" // animate-ping is a quick placeholder, custom 'explode' is better
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 20 + 10}px`, // Random size
                height: `${Math.random() * 20 + 10}px`,
                animationName: 'explode', // Use custom keyframe animation
                animationDuration: `${Math.random() * 0.5 + 0.5}s`, // Random duration
                animationDelay: `${Math.random() * 0.2}s`, // Staggered start
                animationFillMode: 'forwards',
                animationTimingFunction: 'ease-out',
              }}
            />
          ))}
        </div>
      )}
      {/* Keyframes for explode animation will be in globals.css */}
      <style jsx global>{`
        @keyframes explode {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(2) translate(${Math.random()*100-50}px, ${Math.random()*100-50}px); opacity: 0; }
        }
      `}</style>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="glassmorphism sm:max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw] max-h-[80vh] p-0 flex flex-col">
          <DialogHeader className="p-6 border-b border-primary/20 flex-shrink-0">
            <DialogTitle className="text-2xl text-primary flex items-center">
              <Sparkles className="w-6 h-6 mr-2 text-accent" /> Our Universe of Memories
            </DialogTitle>
            <DialogDescription className="text-foreground/80">
              11 months, 11 cherished moments.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 overflow-y-auto flex-grow min-h-0"> {/* Added min-h-0 for flex-grow to work correctly */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {galleryMoments.map((moment, index) => (
                <PolaroidCard
                  key={moment.id}
                  imageUrl={moment.imageUrl}
                  caption={moment.caption}
                  altText={moment.altText}
                  aiHint={moment.aiHint}
                  className={`animate-fade-in`} // Basic fade-in for each card
                  style={{ animationDelay: `${index * 0.1}s` }} // Staggered fade-in
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
