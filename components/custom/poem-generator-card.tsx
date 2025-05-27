
// src/components/custom/poem-generator-card.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Typewriter } from '@/components/custom/typewriter';
import { generatePoem } from '@/ai/flows/poem-generator';
import { useToast } from '@/hooks/use-toast';
import { Bot, Sparkles, Trash2, Feather, Image as ImageIcon } from 'lucide-react'; // Added Feather, ImageIcon

export function PoemGeneratorCard() {
  const [poem, setPoem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGeneratePoem = async () => {
    setIsLoading(true);
    setPoem(null); // Clear previous poem
    try {
      const response = await generatePoem({
        monthsTogether: 11,
        userName: "Your Coder",
        partnerName: "Suha",
      });
      setPoem(response.poem);
      toast({
        title: "AI Poem Generated!",
        description: "A new poem has been crafted for you.",
      });
      window.dispatchEvent(new CustomEvent('loveai-interact', { detail: { interaction: "generated a poem" } }));
    } catch (error) {
      console.error("Failed to generate poem:", error);
      toast({
        title: "Error Generating Poem",
        description: "Could not generate a poem at this time. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleDownloadPoemAsImage = () => {
    if (!poem) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      toast({
        title: "Error Downloading Image",
        description: "Could not create image. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const titleText = "A Poem For You";
    const lines = poem.split('\n');
    const padding = 60;
    const titleFontSize = 30;
    const poemFontSize = 22;
    const lineHeight = poemFontSize * 1.5;
    const spaceAfterTitle = 20;
    const spaceAfterPoem = 30;
    const heartSize = 20;
    const heartPaddingBottom = 10;

    let fontFamily = 'Playfair Display, serif';
    if (typeof window !== 'undefined') {
        try {
            const bodyFontVar = getComputedStyle(document.documentElement).getPropertyValue('--font-body-serif').trim();
            if (bodyFontVar) {
                const firstFont = bodyFontVar.split(',')[0].replace(/"/g, '').trim();
                if (firstFont) fontFamily = `${firstFont}, serif`;
            }
        } catch (e) { console.warn("Could not get --font-body-serif, using fallback.", e); }
    }
    
    let canvasBgColor = 'hsl(276, 84%, 94%)'; // Default light lavender
    let poemTextColor = 'hsl(235, 20%, 25%)'; // Default dark
    let embellishmentColor = 'hsl(285, 24%, 50%)'; // Default plum

    if (typeof window !== 'undefined') {
        try {
            const accentColorValues = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
            if (accentColorValues) canvasBgColor = `hsl(${accentColorValues})`;

            const accentFgColorValues = getComputedStyle(document.documentElement).getPropertyValue('--accent-foreground').trim();
            if (accentFgColorValues) poemTextColor = `hsl(${accentFgColorValues})`;
            
            const primaryColorValues = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
            if (primaryColorValues) embellishmentColor = `hsl(${primaryColorValues})`;

        } catch (e) { console.warn("Error getting theme colors for canvas, using fallbacks.", e); }
    }

    // Measure text for width calculation
    ctx.font = `${titleFontSize}px ${fontFamily}`;
    let maxWidth = ctx.measureText(titleText).width;

    ctx.font = `${poemFontSize}px ${fontFamily}`;
    lines.forEach(line => {
      const metrics = ctx.measureText(line);
      if (metrics.width > maxWidth) {
        maxWidth = metrics.width;
      }
    });
    
    canvas.width = Math.max(maxWidth, 400) + 2 * padding; // Min width 400px before padding
    const poemHeight = lines.length * lineHeight;
    canvas.height = padding + titleFontSize + spaceAfterTitle + 2 + poemHeight + spaceAfterPoem + heartSize + heartPaddingBottom + padding; // 2 for line height

    // Start drawing
    ctx.fillStyle = canvasBgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Title
    ctx.font = `${titleFontSize}px ${fontFamily}`;
    ctx.fillStyle = poemTextColor; // Use poemTextColor for title too, or embellishmentColor
    ctx.textAlign = 'center';
    ctx.fillText(titleText, canvas.width / 2, padding + titleFontSize);

    // Draw Decorative Line
    const lineY = padding + titleFontSize + spaceAfterTitle / 2;
    ctx.beginPath();
    ctx.moveTo(padding, lineY);
    ctx.lineTo(canvas.width - padding, lineY);
    ctx.strokeStyle = embellishmentColor;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw Poem
    ctx.font = `${poemFontSize}px ${fontFamily}`;
    ctx.fillStyle = poemTextColor;
    lines.forEach((line, index) => {
      const y = padding + titleFontSize + spaceAfterTitle + 2 + (index * lineHeight) + (lineHeight / 2);
      ctx.fillText(line, canvas.width / 2, y);
    });

    // Draw Heart
    ctx.fillStyle = embellishmentColor;
    const heartX = canvas.width / 2;
    const heartY = canvas.height - padding - heartPaddingBottom - (heartSize / 2);
    
    // Simple SVG-like heart path drawing
    // M (12, 21.35) L (10.55, 20.03) C (5.4, 15.36, 2, 12.28, 2, 8.5) C (2, 5.42, 4.42, 3, 7.5, 3) C (9.24, 3, 10.91, 3.81, 12, 5.09) C (13.09, 3.81, 14.76, 3, 16.5, 3) C (19.58, 3, 22, 5.42, 22, 8.5) C (22, 12.28, 18.6, 15.36, 13.45, 20.03) L (12, 21.35) Z
    // This path is for a 24x24 viewport. We need to scale it to heartSize.
    const scale = heartSize / 24;
    ctx.save();
    ctx.translate(heartX - (12 * scale), heartY - (12 * scale)); // Center the heart
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.moveTo(12, 21.35);
    ctx.lineTo(10.55, 20.03);
    ctx.bezierCurveTo(5.4, 15.36, 2, 12.28, 2, 8.5);
    ctx.bezierCurveTo(2, 5.42, 4.42, 3, 7.5, 3);
    ctx.bezierCurveTo(9.24, 3, 10.91, 3.81, 12, 5.09);
    ctx.bezierCurveTo(13.09, 3.81, 14.76, 3, 16.5, 3);
    ctx.bezierCurveTo(19.58, 3, 22, 5.42, 22, 8.5);
    ctx.bezierCurveTo(22, 12.28, 18.6, 15.36, 13.45, 20.03);
    ctx.lineTo(12, 21.35);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = 'our-love-poem.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Poem Image Downloaded!",
      description: "Check your downloads folder.",
    });
    window.dispatchEvent(new CustomEvent('loveai-interact', { detail: { interaction: "downloaded a poem image" } }));
  };

  const handleClearPoem = () => {
    setPoem(null);
    toast({
      title: "Poem Cleared",
      description: "The poem area has been cleared.",
    });
  };

  return (
    <Card className="glassmorphism shadow-2xl shadow-primary/20 w-full max-w-2xl mx-auto my-8 animate-fade-in-delay-1">
      <CardHeader className="flex flex-row items-center justify-between p-4 bg-background/50 border-b border-primary/20 rounded-t-lg">
        <CardTitle className="text-2xl text-primary text-glow flex items-center gap-2">
          <Feather className="w-7 h-7 text-accent" />
          AI Poem Composer
        </CardTitle>
        <Button onClick={handleGeneratePoem} disabled={isLoading} className="bg-primary hover:bg-primary/80 text-primary-foreground">
          {isLoading ? (
            <Sparkles className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Bot className="mr-2 h-5 w-5" />
          )}
          Generate Poem
        </Button>
      </CardHeader>
      <CardContent className="p-6 min-h-[200px]">
        {isLoading && !poem && (
          <div className="flex items-center justify-center h-full">
            <p className="text-foreground/70 italic">Crafting your poem...</p>
          </div>
        )}
        {poem && (
          <div className="font-body-serif text-lg leading-relaxed text-foreground whitespace-pre-wrap">
            <Typewriter text={poem} speed={25} className="font-body-serif" />
          </div>
        )}
        {!isLoading && !poem && (
            <div className="flex items-center justify-center h-full text-center">
                 <p className="text-foreground/60">Click "Generate Poem" to create a unique verse inspired by your 11 months of love!</p>
            </div>
        )}
        {poem && !isLoading && (
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button onClick={handleDownloadPoemAsImage} variant="outline" className="text-foreground hover:text-accent-foreground hover:bg-accent border-primary/30">
              <ImageIcon className="mr-2 h-4 w-4" />
              Download Image
            </Button>
            <Button onClick={handleClearPoem} variant="outline" className="text-foreground hover:text-accent-foreground hover:bg-accent border-primary/30">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

