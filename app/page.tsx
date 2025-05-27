// src/app/page.tsx
import { AppHeader } from '@/components/custom/app-header';
import { CodeEditorLoveLetter } from '@/components/custom/code-editor-love-letter';
import { LiveCountdown } from '@/components/custom/live-countdown';
import { LoveAICompanion } from '@/components/custom/love-ai-companion';
import { MemoryTimelineCarousel } from '@/components/custom/memory-timeline-carousel';
import { SurpriseUniverseUnlock } from '@/components/custom/surprise-universe-unlock';
import { DrawingCanvasSection } from '@/components/custom/drawing-canvas-section';
import { ReactionTimeGame } from '@/components/custom/reaction-time-game';
import { AppFooter } from '@/components/custom/app-footer';
import { PoemGeneratorCard } from '@/components/custom/poem-generator-card';
import { ImageGenerationSection } from '@/components/custom/image-generation-section';
// Import the version with responsive preview logic
import { ImageGallerySectionWithResponsivePreview as ImageGallerySection } from '@/components/custom/image-gallery-section';


export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col min-h-screen">
      <AppHeader />
      
      <div className="my-8 md:my-12 max-w-lg mx-auto">
        <LiveCountdown />
      </div>
      
      <CodeEditorLoveLetter />

      <PoemGeneratorCard />
      
      <MemoryTimelineCarousel />

      <ImageGenerationSection /> 

      <ImageGallerySection />
      
      <SurpriseUniverseUnlock />

      <DrawingCanvasSection />

      <ReactionTimeGame />
      
      <LoveAICompanion />
      
      <AppFooter />
    </div>
  );
}
