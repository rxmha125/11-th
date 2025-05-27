// src/components/custom/image-gallery-section.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PolaroidCard } from './polaroid-card';
import { Camera, Loader2, Image as ImageIcon, RefreshCw, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAllImagesFromDb, StoredImage } from '@/services/image-service';
import { cn } from '@/lib/utils';

const PREVIEW_IMAGE_COUNT = 2; // Number of images to show initially on mobile

export function ImageGallerySection() {
  const [images, setImages] = useState<StoredImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const fetchedImages = await getAllImagesFromDb();
      setImages(fetchedImages);
      
      if (fetchedImages.length === 0) {
        // Toast already handled by the service or initial load if desired
      } else {
        // Toast for loaded images can be here if not too noisy
      }

    } catch (error) {
      console.error("Failed to fetch images for gallery:", error);
      toast({
        title: "Error Loading Gallery",
        description: "Could not fetch images from the database. Ensure the database service is running and configured.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchImages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const previewImages = images.slice(0, PREVIEW_IMAGE_COUNT);

  return (
    <>
      <Card className="glassmorphism shadow-2xl shadow-primary/20 w-full max-w-4xl mx-auto my-12 animate-fade-in-delay-3">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2">
              <Camera className="w-8 h-8 text-accent" />
              <CardTitle className="text-3xl text-primary text-glow">
              Our AI Image Gallery
              </CardTitle>
              <button 
                  onClick={fetchImages} 
                  disabled={isLoading} 
                  title="Refresh Gallery"
                  className="p-1.5 rounded-full hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                  <RefreshCw className={`w-5 h-5 text-accent ${isLoading ? 'animate-spin' : ''}`} />
              </button>
          </div>
          <CardDescription className="text-foreground/80">
            A collection of moments and dreams, visualized by AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <Loader2 className="w-12 h-12 text-accent animate-spin mb-3" />
              <p className="text-foreground/70 italic">Loading gallery...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center text-foreground/60 min-h-[100px] flex flex-col justify-center items-center">
              <ImageIcon className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-lg">The gallery is currently empty.</p>
              <p>Generate some images in the "AI Image Studio" to see them here!</p>
              <p className="text-xs mt-2 italic">(Ensure MongoDB is connected and `MONGODB_URI` is set)</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.slice(0, window.innerWidth < 640 ? 2 : 4).map((img, index) => ( // Show 2 on mobile, 4 on larger for preview
                  <PolaroidCard
                    key={img.id || index}
                    imageUrl={img.imageDataUri}
                    caption={img.prompt.substring(0, 30) + (img.prompt.length > 30 ? '...' : '')}
                    altText={img.prompt}
                    aiHint={img.prompt}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  />
                ))}
              </div>
              {images.length > (window.innerWidth < 640 ? 2 : 4) && (
                <div className="text-center mt-8">
                  <Button onClick={() => setIsGalleryModalOpen(true)} variant="outline" className="text-foreground hover:text-accent-foreground hover:bg-accent border-primary/30">
                    <Eye className="mr-2 h-5 w-5" />
                    View All {images.length} Images
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isGalleryModalOpen} onOpenChange={setIsGalleryModalOpen}>
        <DialogContent className="glassmorphism sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] max-h-[85vh] p-0 flex flex-col">
          <DialogHeader className="p-6 border-b border-primary/20 flex-shrink-0">
            <DialogTitle className="text-2xl text-primary flex items-center">
              <Camera className="w-6 h-6 mr-2 text-accent" /> Full Image Gallery
            </DialogTitle>
            <DialogDescription className="text-foreground/80">
              Browse all {images.length} AI-generated images.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 overflow-y-auto flex-grow min-h-0">
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {images.map((img, index) => (
                <PolaroidCard
                  key={img.id || `modal-${index}`}
                  imageUrl={img.imageDataUri}
                  caption={img.prompt.substring(0, 25) + (img.prompt.length > 25 ? '...' : '')}
                  altText={img.prompt}
                  aiHint={img.prompt}
                  className={`animate-fade-in`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Helper hook to get window width, to be used safely in effects or event handlers
function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}

// In ImageGallerySection, use the hook for dynamic preview count
export function ImageGallerySectionWithResponsivePreview() {
  const [images, setImages] = useState<StoredImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const { toast } = useToast();
  const windowWidth = useWindowWidth(); // Safely get window width

  const PREVIEW_IMAGE_DISPLAY_COUNT = windowWidth < 640 ? 2 : 4;


  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const fetchedImages = await getAllImagesFromDb();
      setImages(fetchedImages);
    } catch (error) {
      console.error("Failed to fetch images for gallery:", error);
      toast({
        title: "Error Loading Gallery",
        description: "Could not fetch images from the database.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchImages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const previewImagesToDisplay = images.slice(0, PREVIEW_IMAGE_DISPLAY_COUNT);

  return (
    <>
      <Card className="glassmorphism shadow-2xl shadow-primary/20 w-full max-w-4xl mx-auto my-12 animate-fade-in-delay-3">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2">
              <Camera className="w-8 h-8 text-accent" />
              <CardTitle className="text-3xl text-primary text-glow">
              Our AI Image Gallery
              </CardTitle>
              <button 
                  onClick={fetchImages} 
                  disabled={isLoading} 
                  title="Refresh Gallery"
                  className="p-1.5 rounded-full hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                  <RefreshCw className={`w-5 h-5 text-accent ${isLoading ? 'animate-spin' : ''}`} />
              </button>
          </div>
          <CardDescription className="text-foreground/80">
            A collection of moments and dreams, visualized by AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <Loader2 className="w-12 h-12 text-accent animate-spin mb-3" />
              <p className="text-foreground/70 italic">Loading gallery...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center text-foreground/60 min-h-[100px] flex flex-col justify-center items-center">
              <ImageIcon className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-lg">The gallery is currently empty.</p>
              <p>Generate some images in the "AI Image Studio" to see them here!</p>
              <p className="text-xs mt-2 italic">(Ensure MongoDB is connected and `MONGODB_URI` is set)</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {previewImagesToDisplay.map((img, index) => (
                  <PolaroidCard
                    key={img.id || index}
                    imageUrl={img.imageDataUri}
                    caption={img.prompt.substring(0, 30) + (img.prompt.length > 30 ? '...' : '')}
                    altText={img.prompt}
                    aiHint={img.prompt}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  />
                ))}
              </div>
              {images.length > PREVIEW_IMAGE_DISPLAY_COUNT && (
                <div className="text-center mt-8">
                  <Button onClick={() => setIsGalleryModalOpen(true)} variant="outline" className="text-foreground hover:text-accent-foreground hover:bg-accent border-primary/30">
                    <Eye className="mr-2 h-5 w-5" />
                    View All {images.length} Images
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isGalleryModalOpen} onOpenChange={setIsGalleryModalOpen}>
        <DialogContent className="glassmorphism sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] max-h-[85vh] p-0 flex flex-col">
          <DialogHeader className="p-6 border-b border-primary/20 flex-shrink-0">
            <DialogTitle className="text-2xl text-primary flex items-center">
              <Camera className="w-6 h-6 mr-2 text-accent" /> Full Image Gallery
            </DialogTitle>
            <DialogDescription className="text-foreground/80">
              Browse all {images.length} AI-generated images.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 overflow-y-auto flex-grow min-h-0">
             {/* Added xs:grid-cols-2 for very small screens if needed, sm already covers small */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {images.map((img, index) => (
                <PolaroidCard
                  key={img.id || `modal-${index}`}
                  imageUrl={img.imageDataUri}
                  caption={img.prompt.substring(0, 25) + (img.prompt.length > 25 ? '...' : '')}
                  altText={img.prompt}
                  aiHint={img.prompt}
                  className={`animate-fade-in`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
// Replace the export in page.tsx with ImageGallerySectionWithResponsivePreview
// or rename ImageGallerySectionWithResponsivePreview to ImageGallerySection and export it.
// For simplicity, I'll rename it directly assuming it replaces the old one.
