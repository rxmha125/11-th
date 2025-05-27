// src/components/custom/image-generation-section.tsx
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Image as ImageIcon, Loader2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateImageFromPrompt } from '@/ai/flows/generate-image-from-prompt-flow';
import { saveImageToDb } from '@/services/image-service'; // Actual service import

export function ImageGenerationSection() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Needed",
        description: "Please enter a prompt to generate an image.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setGeneratedImage(null);
    try {
      toast({
        title: "🎨 Painting Your Vision...",
        description: "Our AI is working its magic!",
      });
      const result = await generateImageFromPrompt({ promptText: prompt });
      setGeneratedImage(result.imageDataUri);
      toast({
        title: "✨ Image Generated!",
        description: "Your vision has come to life.",
      });
      window.dispatchEvent(new CustomEvent('loveai-interact', { detail: { interaction: `generated image with prompt: ${prompt}` } }));
      
      // Save to DB using the actual service
      const savedImage = await saveImageToDb(result.imageDataUri, prompt);
      if (savedImage) {
        toast({
          title: "💾 Image Saved to Gallery!",
          description: "Your image has been saved and will appear in the gallery.",
        });
      } else {
        toast({
          title: "⚠️ Save Issue",
          description: "Image generated, but there was an issue saving it to the gallery.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error("Failed to generate or save image:", error);
      toast({
        title: "Oops, a creative hiccup!",
        description: "The AI couldn't generate/save an image this time. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleDownloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `ai-generated-${prompt.substring(0,20).replace(/\s/g, '_') || 'image'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Image Downloaded!",
        description: "Check your downloads folder.",
      });
    }
  };

  return (
    <Card className="glassmorphism shadow-2xl shadow-primary/20 w-full max-w-2xl mx-auto my-12 animate-fade-in-delay-2">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl text-primary text-glow flex items-center justify-center gap-2">
          <ImageIcon className="w-8 h-8 text-accent" />
          AI Image Studio
        </CardTitle>
        <CardDescription className="text-foreground/80">
          Craft unique images from your imagination.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <Textarea
          placeholder="Describe the image you want to create (e.g., 'a dreamy castle in the clouds at sunset')..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px] text-base"
          disabled={isLoading}
        />
        <Button onClick={handleGenerateImage} disabled={isLoading} className="w-full bg-primary hover:bg-primary/80 text-primary-foreground">
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-5 w-5" />
          )}
          Generate & Save Image
        </Button>

        {isLoading && !generatedImage && (
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-primary/30 rounded-md min-h-[200px]">
            <Loader2 className="w-12 h-12 text-accent animate-spin mb-3" />
            <p className="text-foreground/70 italic">Conjuring your masterpiece...</p>
          </div>
        )}

        {generatedImage && !isLoading && (
          <div className="space-y-4">
            <div className="border-2 border-primary/30 rounded-md overflow-hidden aspect-square max-w-md mx-auto">
              <Image
                src={generatedImage}
                alt={prompt || "AI Generated Image"}
                width={500}
                height={500}
                className="object-contain w-full h-full"
              />
            </div>
            <Button onClick={handleDownloadImage} variant="outline" className="w-full text-foreground hover:text-accent-foreground hover:bg-accent border-primary/30">
              <Download className="mr-2 h-5 w-5" /> Download Image
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
