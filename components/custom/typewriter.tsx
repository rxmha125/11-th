// src/components/custom/typewriter.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  onFinished?: () => void;
  cursorClassName?: string;
  keywordClass?: string;
  keywords?: string[];
}

export function Typewriter({
  text,
  speed = 50,
  className,
  onFinished,
  cursorClassName = "bg-accent",
  keywordClass = "text-accent font-bold",
  keywords = []
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  const parts = useMemo(() => {
    if (!keywords || keywords.length === 0) {
      return [{ text, isKeyword: false }];
    }
    const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
    const rawParts = text.split(regex);
    return rawParts.map(part => ({
      text: part,
      isKeyword: keywords.some(kw => kw.toLowerCase() === part.toLowerCase())
    }));
  }, [text, keywords]);

  const fullTextToDisplay = useMemo(() => {
    return parts.map((part, index) => (
      <span key={index} className={part.isKeyword ? keywordClass : ''}>
        {part.text}
      </span>
    ));
  }, [parts, keywordClass]);


  useEffect(() => {
    if (currentIndex < text.length) {
      const timeoutId = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeoutId);
    } else {
      if (onFinished) onFinished();
    }
  }, [currentIndex, speed, text, onFinished]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);
  
  const displayedParts = useMemo(() => {
    let count = 0;
    const result = [];
    for (const part of parts) {
      if (count + part.text.length <= displayText.length) {
        result.push(
          <span key={result.length} className={part.isKeyword ? keywordClass : ''}>
            {part.text}
          </span>
        );
        count += part.text.length;
      } else {
        const remainingLength = displayText.length - count;
        if (remainingLength > 0) {
          result.push(
            <span key={result.length} className={part.isKeyword ? keywordClass : ''}>
              {part.text.substring(0, remainingLength)}
            </span>
          );
        }
        break;
      }
    }
    return result;
  }, [displayText, parts, keywordClass]);

  return (
    <span className={cn('whitespace-pre-wrap', className)}>
      {displayedParts}
      {currentIndex < text.length && showCursor && (
        <span className={cn("inline-block w-2 h-[1em] ml-1 animate-pulse", cursorClassName)} style={{ verticalAlign: 'text-bottom' }}></span>
      )}
      {currentIndex >= text.length && showCursor && (
         <span className={cn("inline-block w-2 h-[1em] ml-1 animate-pulse", cursorClassName)} style={{ verticalAlign: 'text-bottom' }}></span>
      )}
    </span>
  );
}
