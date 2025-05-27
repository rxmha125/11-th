
// src/components/custom/love-ai-companion.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Zap } from 'lucide-react';
import { getLoveAiMessage } from '@/ai/flows/love-ai-companion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function LoveAICompanion() {
  const [message, setMessage] = useState<string | null>(null); // For the small popup
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Controls the small popup
  const [isThoughtDialogOpen, setIsThoughtDialogOpen] = useState(false); // Controls the new dialog
  const [thoughtDialogMessage, setThoughtDialogMessage] = useState<string | null>(null); // Message for the new dialog
  const { toast } = useToast();

  const fetchInitialMessage = async () => {
    setIsLoading(true);
    try {
      const response = await getLoveAiMessage({ milestone: "11 months", userInteraction: "opened the experience" });
      setMessage(response.message);
    } catch (error) {
      console.error("Failed to fetch initial AI message:", error);
      setMessage("Our love story is truly special! ❤️");
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    fetchInitialMessage();
    
    const handleCustomEvent = async (event: CustomEvent) => {
      setIsLoading(true);
      setIsOpen(true); // Open chat on interaction
      try {
        const response = await getLoveAiMessage({ userInteraction: event.detail.interaction });
        setMessage(response.message); // Update small popup message
         toast({
            title: "Love AI Companion 💖",
            description: response.message,
        });
      } catch (error) {
        console.error("Failed to fetch AI message from custom event:", error);
        setMessage("Every moment with you is magic! ✨");
         toast({
            title: "Love AI Companion 💖",
            description: "Every moment with you is magic! ✨",
            variant: "destructive"
        });
      }
      setIsLoading(false);
    };

    window.addEventListener('loveai-interact', handleCustomEvent as EventListener);
    return () => window.removeEventListener('loveai-interact', handleCustomEvent as EventListener);

  }, []);


  const triggerRequestAnotherThought = async (baseInteraction: string) => {
    setIsLoading(true);
    setThoughtDialogMessage(null); // Clear previous dialog message
    setIsThoughtDialogOpen(true); // Open dialog immediately with loading state
    try {
      // Add a random element to the interaction to encourage varied responses
      const interaction = `${baseInteraction} (${Math.random().toString(36).substring(7)})`;
      const response = await getLoveAiMessage({ userInteraction: interaction });
      setThoughtDialogMessage(response.message);
    } catch (error) {
      console.error("Failed to fetch AI message for interaction 'requested another thought':", error);
      // Log the full error object for more details
      console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
      setThoughtDialogMessage("You make my heart skip a beat! 💓 Even when the AI is shy. (Error fetching new thought)");
    }
    setIsLoading(false);
  };


  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        {isOpen && message && (
          <div className="glassmorphism p-4 rounded-lg shadow-xl mb-2 max-w-xs animate-fade-in text-sm">
            <div className="flex items-start gap-2">
              <Heart className="w-8 h-8 text-primary flex-shrink-0 mt-1 animate-pulse" />
              <div>
                <p className="font-semibold text-primary">Love AI Companion</p>
                {isLoading && !message ? ( 
                  <p className="text-foreground/80 italic">Thinking...💖</p>
                ) : (
                  <p className="text-foreground/90">{message}</p>
                )}
              </div>
            </div>
            <Button variant="link" size="sm" className="text-accent mt-2 px-0" onClick={() => triggerRequestAnotherThought("requested another thought")}>
              <Zap size={14} className="mr-1" /> Another loving thought?
            </Button>
          </div>
        )}
        <Button
          variant="default"
          size="icon"
          className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-full w-14 h-14 shadow-2xl shadow-primary/40 animate-float"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen && !message) fetchInitialMessage(); 
          }}
          aria-label="Toggle Love AI Companion"
        >
          {isOpen ? <MessageCircle className="w-7 h-7" /> : <Heart className="w-7 h-7 animate-ping animation-delay-1000" />}
        </Button>
      </div>

      <Dialog open={isThoughtDialogOpen} onOpenChange={setIsThoughtDialogOpen}>
        <DialogContent className="glassmorphism sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Heart className="w-6 h-6 text-accent animate-pulse" />
              A Special Message For You
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 min-h-[60px]">
            {isLoading && !thoughtDialogMessage ? (
              <p className="text-foreground/80 italic text-center">Fetching a new thought...💖</p>
            ) : (
              <p className="text-foreground/90 text-center text-lg">
                {thoughtDialogMessage || "My love for you is beyond words! 💕"}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
