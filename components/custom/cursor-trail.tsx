
// src/components/custom/cursor-trail.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Heart } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  createdAt: number;
}

const TRAIL_DURATION = 300; // milliseconds for trail particles (reduced from 500)
const MAX_PARTICLES = 15;  // (reduced from 20)
const CLEANUP_INTERVAL = 20; // milliseconds (reduced from 25)

const CUSTOM_CURSOR_SIZE = 20; // px for the main cursor
const TRAIL_PARTICLE_SIZE = 16; // px for trail particles

export function CursorTrail() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [currentMousePosition, setCurrentMousePosition] = useState<{ x: number; y: number } | null>(null);
  const nextParticleId = useRef(0);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const newPosition = { x: event.clientX, y: event.clientY };
    setCurrentMousePosition(newPosition);
    
    setParticles((prevParticles) => {
      const newParticle: Particle = {
        id: nextParticleId.current++,
        x: newPosition.x,
        y: newPosition.y,
        createdAt: Date.now(),
      };
      const updatedParticles = [...prevParticles, newParticle];
      return updatedParticles.slice(-MAX_PARTICLES); 
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setParticles((prevParticles) =>
        prevParticles.filter((p) => now - p.createdAt < TRAIL_DURATION)
      );
    }, CLEANUP_INTERVAL); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[110]">
      {/* Custom Cursor */}
      {currentMousePosition && (
        <Heart
          className="absolute text-accent fill-accent" 
          style={{
            left: currentMousePosition.x - CUSTOM_CURSOR_SIZE / 2, 
            top: currentMousePosition.y - CUSTOM_CURSOR_SIZE / 2,  
            width: CUSTOM_CURSOR_SIZE,
            height: CUSTOM_CURSOR_SIZE,
            filter: `drop-shadow(0 0 5px hsl(var(--accent)))`, 
            willChange: 'transform', 
            zIndex: 111, 
          }}
        />
      )}

      {/* Trail Particles */}
      {particles.map((particle) => {
        const age = Date.now() - particle.createdAt;
        const progress = age / TRAIL_DURATION;
        const opacity = Math.max(0, 1 - progress);
        const scale = Math.max(0, 1 - progress * 0.8); 
        
        if (opacity <= 0.01 && scale <= 0.01) return null;

        return (
          <Heart
            key={particle.id}
            className="absolute text-accent fill-accent/50" 
            style={{
              left: particle.x - TRAIL_PARTICLE_SIZE / 2, 
              top: particle.y - TRAIL_PARTICLE_SIZE / 2,  
              width: TRAIL_PARTICLE_SIZE * scale,
              height: TRAIL_PARTICLE_SIZE * scale,
              opacity: opacity,
              transform: `scale(${scale}) translateZ(0)`, // Added translateZ for potential perf hint
              filter: `drop-shadow(0 0 3px hsl(var(--accent)))`, 
              willChange: 'transform, opacity',
              zIndex: 110, 
            }}
          />
        );
      })}
    </div>
  );
}

