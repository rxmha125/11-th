// src/components/custom/drawing-canvas-section.tsx
"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Trash2, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const CANVAS_DRAWING_WIDTH = 600; // Intrinsic drawing width
const CANVAS_DRAWING_HEIGHT = 400; // Intrinsic drawing height
const ASPECT_RATIO = CANVAS_DRAWING_HEIGHT / CANVAS_DRAWING_WIDTH;

const DEFAULT_COLOR = '#FFFFFF'; // White, as foreground is light on dark bg
const COLORS = ['#FFFFFF', '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#34C759', '#5AC8FA', '#007AFF', '#AF52DE', '#FF2D55'];

export function DrawingCanvasSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState(DEFAULT_COLOR);
  const [currentLineWidth, setCurrentLineWidth] = useState(5);
  const { toast } = useToast();

  const getCanvasBackgroundColor = () => {
    if (typeof window !== 'undefined') {
      const cardBg = getComputedStyle(document.documentElement).getPropertyValue('--card').trim();
      if (cardBg) return `hsl(${cardBg})`;
    }
    return 'hsl(235 20% 25%)'; // Fallback if CSS var not available
  }

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scale = window.devicePixelRatio || 1;
    
    // Use clientWidth for displayed width, calculate height based on aspect ratio
    const displayWidth = canvas.clientWidth;
    const displayHeight = displayWidth * ASPECT_RATIO;

    canvas.style.height = `${displayHeight}px`; // Set style height to maintain aspect ratio

    canvas.width = Math.floor(displayWidth * scale);
    canvas.height = Math.floor(displayHeight * scale);

    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.scale(scale, scale);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = currentColor;
    context.lineWidth = currentLineWidth;
    contextRef.current = context;

    // Set initial background
    context.fillStyle = getCanvasBackgroundColor();
    context.fillRect(0, 0, displayWidth, displayHeight); // Use displayWidth/Height for fillRect
  }, [currentColor, currentLineWidth]); // Add dependencies

  useEffect(() => {
    setupCanvas(); // Initial setup

    window.addEventListener('resize', setupCanvas);
    return () => {
      window.removeEventListener('resize', setupCanvas);
    };
  }, [setupCanvas]);


  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = currentColor;
    }
  }, [currentColor]);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.lineWidth = currentLineWidth;
    }
  }, [currentLineWidth]);

  const getCoordinates = (event: MouseEvent | TouchEvent | React.MouseEvent['nativeEvent'] | React.TouchEvent['nativeEvent']) => {
    if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        if ('touches' in event && event.touches.length > 0) {
            return { offsetX: event.touches[0].clientX - rect.left, offsetY: event.touches[0].clientY - rect.top };
        } else if ('clientX' in event) {
            return { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
        }
    }
    return { offsetX: undefined, offsetY: undefined };
  };

  const startDrawing = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    const { offsetX, offsetY } = getCoordinates(event.nativeEvent);
    if (!contextRef.current || offsetX === undefined || offsetY === undefined) return;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    event.preventDefault(); // Prevent page scrolling on touch
  }, []);

  const draw = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !contextRef.current) return;
    const { offsetX, offsetY } = getCoordinates(event.nativeEvent);
     if (offsetX === undefined || offsetY === undefined) return;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
    event.preventDefault(); // Prevent page scrolling on touch
  }, [isDrawing]);

  const stopDrawing = useCallback(() => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);
  }, []);


  const handleClearCanvas = () => {
    const context = contextRef.current;
    const canvas = canvasRef.current;
    if (context && canvas) {
      context.fillStyle = getCanvasBackgroundColor();
      // Use unscaled (display) width and height for clearing
      context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      toast({
        title: "Canvas Cleared",
        description: "Ready for your next masterpiece!",
      });
    }
  };

  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = 'my-drawing.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Drawing Downloaded!",
        description: "Check your downloads folder.",
      });
      window.dispatchEvent(new CustomEvent('loveai-interact', { detail: { interaction: "downloaded a drawing" } }));
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto my-12 glassmorphism shadow-2xl shadow-primary/20 animate-fade-in-delay-1">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl text-primary text-glow flex items-center justify-center gap-2">
          <Palette className="w-8 h-8 text-accent" />
          Creative Canvas
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 p-4 md:p-6">
        <div className="w-full max-w-[600px]"> {/* Wrapper to constrain canvas width and allow 100% width */}
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="border-2 border-primary/30 rounded-md cursor-crosshair w-full block" // w-full and block
            // Aspect ratio will be maintained by style.height set in JS
            style={{ aspectRatio: `${CANVAS_DRAWING_WIDTH}/${CANVAS_DRAWING_HEIGHT}` }}
          />
        </div>
        <div className="flex flex-wrap justify-center gap-2 my-4">
          {COLORS.map(color => (
            <Button
              key={color}
              variant="outline"
              size="icon"
              onClick={() => setCurrentColor(color)}
              className={cn(
                "w-9 h-9 rounded-full border-2 shadow-md transition-all duration-150 ease-in-out",
                currentColor === color ? 'ring-2 ring-offset-2 ring-accent scale-110' : 'border-foreground/20 hover:border-accent/70',
              )}
              style={{ backgroundColor: color }}
              aria-label={`Set color to ${color}`}
            />
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm justify-center">
            <label htmlFor="lineWidth" className="text-sm text-foreground/80 font-code-mono whitespace-nowrap">Brush Size:</label>
            <input 
                type="range" 
                id="lineWidth" 
                min="1" 
                max="30" 
                value={currentLineWidth} 
                onChange={(e) => setCurrentLineWidth(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <span className="text-sm text-foreground/80 font-code-mono w-10 text-center tabular-nums">{currentLineWidth}px</span>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <Button onClick={handleClearCanvas} variant="outline" className="text-foreground hover:text-accent-foreground hover:bg-accent border-primary/30">
            <Trash2 className="mr-2 h-5 w-5" /> Clear Canvas
          </Button>
          <Button onClick={handleDownloadImage} variant="default" className="bg-primary hover:bg-primary/80 text-primary-foreground">
            <Download className="mr-2 h-5 w-5" /> Download Drawing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
