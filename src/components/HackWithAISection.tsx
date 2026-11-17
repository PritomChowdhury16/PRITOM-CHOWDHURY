import React, { Suspense, useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

const HackWithAISculpture = React.lazy(() =>
  import('./three/HackWithAISculpture').then((mod) => ({
    default: mod.HackWithAISculpture,
  }))
);

interface HackWithAISectionProps {
  hasWebGL: boolean;
  isSoftwareGl: boolean;
  reducedMotion: boolean;
}

export function HackWithAISection({
  hasWebGL,
  isSoftwareGl,
  reducedMotion,
}: HackWithAISectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: '150px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="hack-with-ai"
      ref={sectionRef}
      aria-labelledby="hack-with-ai-heading"
      className="bg-[#09090B] text-[#F5F4F0] py-24 md:py-32 border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Editorial Brand Narrative */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#818CF8]">
                08. Featured Brand · Founder
              </p>
              <h2
                id="hack-with-ai-heading"
                className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white"
              >
                {portfolioData.hackWithAi.name}
              </h2>
              <p className="font-serif italic text-2xl sm:text-3xl text-[#E4E4E7] leading-snug max-w-xl">
                “{portfolioData.hackWithAi.tagline}”
              </p>
            </div>

            <p className="text-base sm:text-lg text-[#A1A1AA] leading-relaxed max-w-2xl">
              {portfolioData.hackWithAi.description}
            </p>

            {/* Editorial Pillars */}
            <div className="divide-y divide-white/10 border-t border-b border-white/10">
              {portfolioData.hackWithAi.pillars.map((pillar, idx) => (
                <div
                  key={pillar.title}
                  className="py-4 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-baseline"
                >
                  <div className="sm:col-span-5 flex items-baseline gap-3">
                    <span className="font-mono text-xs tabular-nums text-[#818CF8]">
                      0{idx + 1}
                    </span>
                    <h3 className="font-display text-base font-semibold text-white">
                      {pillar.title}
                    </h3>
                  </div>
                  <p className="sm:col-span-7 text-sm text-[#A1A1AA]">
                    {pillar.detail}
                  </p>
                </div>
              ))}
            </div>

            <div>
              <a
                href={portfolioData.hackWithAi.blogUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3 text-sm font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg transition-colors duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6366F1]"
              >
                <span>Read Hack with AI Blog</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* 3D Editorial Sculpture Viewport */}
          <div className="lg:col-span-5 relative h-[360px] sm:h-[440px] rounded-2xl border border-white/10 bg-[#111116] overflow-hidden">
            {hasWebGL ? (
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center text-xs font-mono text-[#A1A1AA]">
                    Loading 3D Emblem
                  </div>
                }
              >
                <HackWithAISculpture
                  isSoftwareGl={isSoftwareGl}
                  reducedMotion={reducedMotion}
                  isVisible={isVisible}
                />
              </Suspense>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-8 text-center">
                <p className="font-display text-2xl font-bold tracking-tight text-white">
                  HACK WITH AI
                </p>
              </div>
            )}
            <div className="pointer-events-none absolute bottom-4 left-5 right-5 flex items-center justify-between text-xs font-mono text-[#A1A1AA]">
              <span>Weekly AI Publication</span>
              <span>Est. May 2025</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
