
// src/components/custom/memory-timeline-carousel.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { CalendarHeart, Gift, PartyPopper, Sparkles, Image as ImageIcon, Loader2, RefreshCw } from 'lucide-react'; // Added RefreshCw
import { useToast } from '@/hooks/use-toast';
import { generateMemoryImage } from '@/ai/flows/generate-memory-image-flow';
import { getImageForMemory, saveImageForMemory, StoredImage } from '@/services/image-service'; 
import { cn } from '@/lib/utils';

const HeartFilledIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

interface MemoryItemData { 
  id: string;
  title: string;
  icon: React.ElementType;
  date: string;
  description: string;
  aiHint: string;
  aiInteraction: string;
}

interface DisplayableMemory extends MemoryItemData {
  image: string; 
  isPlaceholder: boolean;
}

const initialMemoryDefinitions: MemoryItemData[] = [
  { id: 'mem_1', title: "Our First Spark", icon: Sparkles, date: "Month 1", description: "The beginning of our beautiful story...", aiHint: "couple first date romantic park sunset", aiInteraction: "viewed first memory" },
  { id: 'mem_2', title: "Growing Together", icon: CalendarHeart, date: "Month 3", description: "Sharing laughter and dreams.", aiHint: "happy couple laughing sharing coffee cozy cafe", aiInteraction: "viewed third month memory" },
  { id: 'mem_3', title: "Halfway to a Year!", icon: PartyPopper, date: "Month 6", description: "Six months of pure joy.", aiHint: "joyful couple celebrating with confetti and smiles", aiInteraction: "viewed sixth month memory" },
  { id: 'mem_4', title: "Almost There", icon: Gift, date: "Month 9", description: "Building a universe of love.", aiHint: "couple looking at starry night sky together awe", aiInteraction: "viewed ninth month memory" },
  { id: 'mem_5', title: "Today: 11 Months!", icon: HeartFilledIcon, date: "Today", description: "Celebrating 11 magical months.", aiHint: "romantic anniversary dinner couple holding hands", aiInteraction: "viewed eleventh month memory" },
];


export function MemoryTimelineCarousel() {
  const { toast } = useToast();
  const [memories, setMemories] = useState<DisplayableMemory[]>([]);
  const [loadingImageId, setLoadingImageId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const loadInitialMemories = async () => {
      setInitialLoading(true);
      const loadedMemories = await Promise.all(
        initialMemoryDefinitions.map(async (memData) => {
          let imageFromDb: StoredImage | null = null;
          try {
            imageFromDb = await getImageForMemory(memData.id);
          } catch (e) { console.error("Error fetching image for memory " + memData.id, e); }

          return {
            ...memData,
            image: imageFromDb ? imageFromDb.imageDataUri : `https://placehold.co/300x200.png?text=${encodeURIComponent(memData.title)}`,
            isPlaceholder: !imageFromDb,
          };
        })
      );
      setMemories(loadedMemories);
      setInitialLoading(false);
    };
    loadInitialMemories();
  }, []);


  const handleMemoryClick = async (clickedMemory: DisplayableMemory) => {
    window.dispatchEvent(new CustomEvent('loveai-interact', { detail: { interaction: clickedMemory.aiInteraction } }));

    if (loadingImageId !== clickedMemory.id) { // Allow regeneration even if not a placeholder
      setLoadingImageId(clickedMemory.id);
      try {
        const toastTitle = clickedMemory.isPlaceholder 
          ? `Conjuring image for: ${clickedMemory.title}` 
          : `Re-imagining: ${clickedMemory.title}`;
        toast({
          title: toastTitle,
          description: "Our AI is painting a masterpiece... 🎨",
        });
        const genResult = await generateMemoryImage({ promptText: clickedMemory.aiHint, memoryId: clickedMemory.id });

        const savedImage = await saveImageForMemory(clickedMemory.id, genResult.imageDataUri, clickedMemory.aiHint);
        if (savedImage) {
           toast({
            title: "🖼️ Image Saved!",
            description: `Image for "${clickedMemory.title}" stored in our gallery.`,
          });
           setMemories(prevMemories =>
            prevMemories.map(mem =>
              mem.id === clickedMemory.id
                ? { ...mem, image: savedImage.imageDataUri, isPlaceholder: false }
                : mem
            )
          );
        } else {
          toast({
            title: "Database Glitch",
            description: "Couldn't save the image to the gallery this time, but here it is!",
            variant: "destructive",
          });
           setMemories(prevMemories =>
            prevMemories.map(mem =>
              mem.id === clickedMemory.id
                ? { ...mem, image: genResult.imageDataUri, isPlaceholder: false } 
                : mem
            )
          );
        }
        
        toast({
          title: "Magical Image Conjured! ✨",
          description: `A unique vision for "${clickedMemory.title}" has arrived.`,
        });

      } catch (error) {
        console.error("Failed to generate or save memory image:", error);
        toast({
          title: "Oh no, a creative block!",
          description: "The AI couldn't generate/save an image this time. Please try another memory or later!",
          variant: "destructive",
        });
      } finally {
        setLoadingImageId(null);
      }
    } else if (!clickedMemory.isPlaceholder && loadingImageId === null) { // Only show this if not currently loading a new image
       toast({
        title: `Memory: ${clickedMemory.title}`,
        description: `You're viewing the special AI-generated image! Click again to re-imagine it.`,
      });
    }
  };

  if (initialLoading && memories.length === 0) {
     return (
      <div className="my-12 animate-fade-in-delay-2">
        <h2 className="text-3xl font-semibold text-center mb-8 text-accent text-glow">Our Cherished Moments</h2>
        <div className="flex justify-center items-center h-[300px]">
          <Loader2 className="w-12 h-12 text-accent animate-spin" />
          <p className="ml-3 text-foreground/80">Loading memories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-12 animate-fade-in-delay-2">
      <h2 className="text-3xl font-semibold text-center mb-8 text-accent text-glow">Our Cherished Moments</h2>
      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <div className="flex w-max space-x-4 p-4">
          {memories.map((memory, index) => (
            <Card
              key={memory.id}
              className="glassmorphism shadow-xl shadow-primary/10 w-[320px] flex-shrink-0 transform transition-all duration-300 hover:scale-105 hover:shadow-primary/30 cursor-pointer group relative"
              onClick={() => handleMemoryClick(memory)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="items-center text-center">
                <memory.icon className="w-10 h-10 text-accent mb-2" />
                <CardTitle className="text-xl text-primary">{memory.title}</CardTitle>
                <CardDescription className="font-code-mono text-sm text-foreground/70">{memory.date}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative w-[280px] h-[180px] mx-auto mb-4 rounded-md border-2 border-accent/30 overflow-hidden">
                  {loadingImageId === memory.id ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50">
                      <Loader2 className="w-12 h-12 text-accent animate-spin mb-2" />
                      <p className="text-sm text-accent/80">Painting memory...</p>
                    </div>
                  ) : (
                    <Image
                      src={memory.image}
                      alt={memory.title}
                      width={280}
                      height={180}
                      className="object-cover w-full h-full"
                      data-ai-hint={memory.aiHint}
                    />
                  )}
                   {(loadingImageId !== memory.id) && ( // Only show overlay if not currently loading this card
                     <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {memory.isPlaceholder ? (
                          <>
                            <ImageIcon className="w-10 h-10 text-white/80 mb-1" />
                            <p className="text-white/90 text-sm font-semibold">Generate Image</p>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-10 h-10 text-white/80 mb-1" />
                            <p className="text-white/90 text-sm font-semibold">Re-imagine Moment</p>
                          </>
                        )}
                     </div>
                   )}
                </div>
                <p className="text-sm text-foreground/90 min-h-[40px]">{memory.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

