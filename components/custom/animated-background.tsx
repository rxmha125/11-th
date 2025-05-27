
// src/components/custom/animated-background.tsx
"use client";

import React, { useEffect, useState } from 'react';

// Interface for particle styles
interface ParticleStyle extends React.CSSProperties {
  animationDelay: string;
  animationDuration: string;
}

// Star particle component (existing dots) - No longer rendered
const StarParticle: React.FC<{ style: ParticleStyle }> = ({ style }) => (
  <div
    className="absolute rounded-full bg-accent/70"
    style={{
      ...style,
      animationName: 'pulse, drift',
      animationTimingFunction: 'ease-in-out, linear',
      animationIterationCount: 'infinite, infinite',
    }}
  />
);

// Heart particle component (new floating hearts) - No longer rendered
const HeartParticle: React.FC<{ style: ParticleStyle }> = ({ style }) => {
  const { width, height, animationDelay, animationDuration, left, top, opacity } = style;

  const wrapperStyle: React.CSSProperties = {
    position: 'absolute',
    left,
    top,
    width,
    height,
    opacity,
    animationName: 'float, drift',
    animationTimingFunction: 'ease-in-out, linear', // For float, For drift
    animationIterationCount: 'infinite, infinite',
    animationDelay,
    animationDuration,
  };

  // Note: Lucide Heart icon is not imported as it's no longer used directly here
  // If it was used elsewhere and we wanted to keep it, the import would remain.
  // For this specific request of removing moving objects, direct usage is gone.
  return (
    <div style={wrapperStyle}>
      {/* SVG Heart would be here, but since we are removing, this content is effectively gone */}
    </div>
  );
};


export function AnimatedBackground() {
  // const [stars, setStars] = useState<Array<ParticleStyle>>([]); // State no longer needed
  // const [hearts, setHearts] = useState<Array<ParticleStyle>>([]); // State no longer needed

  // useEffect(() => {
    // Logic for creating stars and hearts removed
  // }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10 opacity-50" />
      {/* {stars.map((style, index) => (
        <StarParticle key={`star-${index}`} style={style} />
      ))} */}
      {/* {hearts.map((style, index) => (
        <HeartParticle key={`heart-${index}`} style={style} />
      ))} */}
    </div>
  );
}
