// src/components/custom/polaroid-card.tsx
import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PolaroidCardProps {
  imageUrl: string;
  caption?: string;
  altText: string;
  aiHint: string;
  className?: string;
  style?: React.CSSProperties; // Added for animation delay
}

export function PolaroidCard({ imageUrl, caption, altText, aiHint, className, style }: PolaroidCardProps) {
  return (
    <div
      className={cn(
        "bg-background/80 p-3 pb-8 shadow-lg rounded-sm transform transition-all duration-300 hover:rotate-[-3deg] hover:scale-105 relative glassmorphism border-primary/20",
        className
      )}
      style={style}
    >
      <Image
        src={imageUrl}
        alt={altText}
        width={200}
        height={200}
        className="w-full h-auto object-cover border border-foreground/10"
        data-ai-hint={aiHint}
      />
      {caption && (
        <p className="font-code-mono text-center text-sm mt-3 text-foreground/80 absolute bottom-2 left-0 right-0 px-2">
          {caption}
        </p>
      )}
    </div>
  );
}
