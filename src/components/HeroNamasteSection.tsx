import React, { Suspense, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

gsap.registerPlugin(ScrollTrigger);

const HeroStageScene = React.lazy(() =>
  import('./three/HeroStageScene').then((mod) => ({ default: mod.HeroStageScene }))
);

interface HeroNamasteSectionProps {
  hasWebGL: boolean;
  isSoftwareGl: boolean;
  reducedMotion: boolean;
}

export function HeroNamasteSection({
  hasWebGL,
  isSoftwareGl,
  reducedMotion,
}: HeroNamasteSectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const scrollProgressRef = useRef<number>(reducedMotion ? 0.65 : 0);
  const [progressPct, setProgressPct] = useState<number>(reducedMotion ? 100 : 0);
  const [sceneReady, setSceneReady] = useState<boolean>(false);

  useEffect(() => {
    if (reducedMotion || !containerRef.current) {
      scrollProgressRef.current = 0.65;
      setProgressPct(100);
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.35,
        onUpdate: (self) => {
          const p = self.progress;
          scrollProgressRef.current = p;
          setProgressPct(Math.round(p * 100));
        },
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [reducedMotion]);

  const scrollToSection = (selector: string) => {
    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  };

  const isNamaskarActive = progressPct >= 28 && progressPct <= 85;

  return (
    <section
      id="hero"
      ref={containerRef}
      aria-label="Pritom Chowdhury — AI Graphics Designer and AI Web Developer"
      className={`relative bg-[#09090B] text-[#F5F4F0] ${
        reducedMotion ? 'min-h-screen' : 'h-[220vh]'
      }`}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* 3D Canvas Viewport featuring Pritom's photo giving Namaskar on scroll */}
        <div className="absolute inset-0 z-0">
          {hasWebGL ? (
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center bg-[#09090B]">
                  <div className="text-center space-y-3">
                    <div className="w-10 h-10 mx-auto border border-white/20 border-t-[#6366F1] rounded-full animate-spin" />
                    <p className="text-xs font-mono text-[#A1A1AA] tracking-wider">
                      Preparing 3D Portrait
                    </p>
                  </div>
                </div>
              }
            >
              <HeroStageScene
                scrollProgressRef={scrollProgressRef}
                portraitUrl={portfolioData.hero.portraitUrl}
                isSoftwareGl={isSoftwareGl}
                reducedMotion={reducedMotion}
                onReady={() => setSceneReady(true)}
              />
            </Suspense>
          ) : (
            <div className="w-full h-full flex items-center justify-center lg:justify-end px-8 md:px-20 bg-[#09090B]">
              <div className="relative w-72 sm:w-80 md:w-96 aspect-square rounded-2xl overflow-hidden border border-white/10 bg-[#121217]">
                <img
                  src={portfolioData.hero.portraitUrl}
                  alt={portfolioData.brand.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-transparent" />
              </div>
            </div>
          )}
        </div>

        {/* Subtle Initial Loading Veil */}
        {hasWebGL && !sceneReady && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center pb-24 bg-[#09090B]/60 transition-opacity duration-500">
            <span className="text-xs font-mono text-[#A1A1AA] tracking-wider">
              Loading Portrait
            </span>
          </div>
        )}

        {/* Measured Contrast Scrims */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#09090B]/92 via-[#09090B]/45 to-transparent lg:via-[#09090B]/20" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-60 lg:h-40 z-10 bg-gradient-to-t from-[#09090B] via-[#09090B]/70 to-transparent" />

        {/* Editorial Hero Typography & Primary Actions */}
        <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end lg:justify-center pb-16 lg:pb-0 pt-20 pointer-events-none">
          <div className="max-w-xl space-y-5 pointer-events-auto">
            <div className="space-y-3">
              <p className="text-xs sm:text-sm font-mono uppercase tracking-[0.16em] text-[#818CF8]">
                {portfolioData.hero.roleLabel}
              </p>

              <h1 className="font-display text-5xl sm:text-6xl md:text-[4.25rem] font-bold tracking-tight leading-[0.95] text-white">
                {portfolioData.brand.firstName}
                <br />
                {portfolioData.brand.lastName}
              </h1>
            </div>

            <p className="font-serif italic text-xl sm:text-2xl text-[#E4E4E7] max-w-md leading-snug">
              “{portfolioData.hero.revealTagline}”
            </p>

            <p className="text-sm sm:text-base text-[#A1A1AA] max-w-md leading-relaxed">
              {portfolioData.hero.welcomeSubheadline}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => scrollToSection('#about')}
                className="inline-flex items-center gap-2.5 px-6 py-3 text-sm font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6366F1]"
              >
                <span>{portfolioData.hero.primaryCta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('#contact')}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-[#F5F4F0] bg-white/8 hover:bg-white/14 border border-white/15 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6366F1]"
              >
                <span>{portfolioData.hero.secondaryCta}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Subtle Namaskar Caption beneath portrait during scroll greeting */}
        <div
          className={`pointer-events-none hidden lg:block absolute bottom-16 right-16 z-20 text-right transition-all duration-300 ${
            isNamaskarActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <p className="font-serif italic text-2xl text-[#F5F4F0]">Namaskar</p>
          <p className="text-xs text-[#A1A1AA] mt-0.5">Warm welcome to my portfolio</p>
        </div>

        {/* Scroll Guidance & Progress Rail */}
        {!reducedMotion && (
          <div className="absolute bottom-7 left-6 right-6 z-30 max-w-7xl mx-auto flex items-center justify-between pointer-events-none">
            <div
              className={`flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-[#A1A1AA] transition-opacity duration-300 ${
                progressPct < 25 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <span>Scroll for Namaskar</span>
              <ArrowDown className="w-3.5 h-3.5 text-[#818CF8]" />
            </div>

            <div className="pointer-events-auto flex items-center gap-4 ml-auto">
              <button
                type="button"
                onClick={() => scrollToSection('#about')}
                className="text-xs font-mono text-[#A1A1AA] hover:text-white transition-colors px-2 py-1.5 rounded focus-visible:outline-2 focus-visible:outline-[#6366F1] cursor-pointer whitespace-nowrap"
              >
                Skip to Bio ↓
              </button>
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-16 h-0.5 bg-white/15 overflow-hidden rounded-full">
                  <div
                    className="h-full bg-[#6366F1] transition-[width] duration-75"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono tabular-nums text-[#A1A1AA] w-8 text-right">
                  {progressPct}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
