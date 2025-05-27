
// src/components/custom/reaction-time-game.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Zap, Play, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';

type GameState = 'idle' | 'waiting' | 'active' | 'finished';

export function ReactionTimeGame() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [targetStyle, setTargetStyle] = useState<React.CSSProperties>({ display: 'none' });
  const startTimeRef = useRef<number>(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const triggerTarget = useCallback(() => {
    if (!gameAreaRef.current) return;

    const gameAreaWidth = gameAreaRef.current.offsetWidth;
    const gameAreaHeight = gameAreaRef.current.offsetHeight;
    const targetSize = 64; // Corresponds to w-16 h-16

    // Ensure target is fully within bounds
    const top = Math.random() * (gameAreaHeight - targetSize);
    const left = Math.random() * (gameAreaWidth - targetSize);

    setTargetStyle({
      display: 'block',
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
    });
    startTimeRef.current = Date.now();
    setGameState('active');
  }, []);

  const startGame = useCallback(() => {
    setGameState('waiting');
    setReactionTime(null);
    setTargetStyle({ display: 'none' });

    // Clear any existing timeout
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    const randomDelay = Math.random() * 2000 + 1000; // 1-3 seconds
    timeoutIdRef.current = setTimeout(triggerTarget, randomDelay);
  }, [triggerTarget]);

  const handleTargetClick = useCallback(() => {
    if (gameState === 'active') {
      const endTime = Date.now();
      setReactionTime(endTime - startTimeRef.current);
      setGameState('finished');
      setTargetStyle({ display: 'none' });
      window.dispatchEvent(new CustomEvent('loveai-interact', { detail: { interaction: `played reaction game, score: ${endTime - startTimeRef.current}ms` } }));
    }
  }, [gameState]);

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto my-12 glassmorphism shadow-2xl shadow-primary/20 animate-fade-in-delay-2">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl text-primary text-glow flex items-center justify-center gap-2">
          <Zap className="w-8 h-8 text-accent" />
          Quick Reflex!
        </CardTitle>
        {gameState === 'idle' && <CardDescription className="text-foreground/80">Test your reaction time.</CardDescription>}
        {gameState === 'waiting' && <CardDescription className="text-foreground/80">Get ready...</CardDescription>}
        {gameState === 'active' && <CardDescription className="text-foreground/80">Click the target!</CardDescription>}
        {gameState === 'finished' && reactionTime !== null && (
          <CardDescription className="text-foreground/80">Nice one!</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 p-6">
        <div
          ref={gameAreaRef}
          className="relative w-full h-64 bg-background/30 rounded-md border-2 border-primary/30 overflow-hidden"
        >
          {gameState === 'active' && (
            <div
              onClick={handleTargetClick}
              className="w-16 h-16 bg-accent rounded-full cursor-pointer shadow-xl animate-ping-once"
              style={targetStyle}
              aria-label="Clickable target"
            />
          )}
        </div>

        {gameState === 'idle' && (
          <Button onClick={startGame} size="lg" className="bg-primary hover:bg-primary/80 text-primary-foreground">
            <Play className="mr-2 h-5 w-5" /> Start Game
          </Button>
        )}

        {gameState === 'finished' && reactionTime !== null && (
          <div className="text-center">
            <p className="text-2xl font-semibold text-accent mb-4">
              Your time: {reactionTime} ms
            </p>
            <Button onClick={startGame} size="lg" variant="outline" className="text-foreground hover:text-accent-foreground hover:bg-accent border-primary/30">
              <Repeat className="mr-2 h-5 w-5" /> Play Again
            </Button>
          </div>
        )}
        <style jsx global>{`
          @keyframes ping-once {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.2);
              opacity: 0.7;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          .animate-ping-once {
            animation: ping-once 0.5s ease-out;
          }
        `}</style>
      </CardContent>
    </Card>
  );
}
