import React, { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { portfolioData, type ExperienceItem } from '../data/portfolioData';

gsap.registerPlugin(ScrollTrigger);

type FilterKey = 'all' | 'engineering' | 'content' | 'analytics';

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'All Roles' },
  { key: 'engineering', label: 'Engineering' },
  { key: 'content', label: 'AI & Design' },
  { key: 'analytics', label: 'Analytics & Advisory' },
];

const CATEGORY_LABEL: Record<ExperienceItem['category'], string> = {
  engineering: 'Engineering',
  content: 'AI, Content & Design',
  analytics: 'Analytics & Consulting',
};

export function ExperienceSection({ reducedMotion }: { reducedMotion: boolean }) {
  const [filter, setFilter] = useState<FilterKey>('all');
  const sectionRef = useRef<HTMLElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const filteredExperiences = useMemo(() => {
    if (filter === 'all') return portfolioData.experiences;
    return portfolioData.experiences.filter((item) => item.category === filter);
  }, [filter]);

  useEffect(() => {
    if (reducedMotion || !sectionRef.current || !progressBarRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        progressBarRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            end: 'bottom 75%',
            scrub: 0.4,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion, filteredExperiences.length]);

  return (
    <section
      id="journey"
      ref={sectionRef}
      aria-labelledby="journey-heading"
      className="bg-[#F6F5F1] text-[#111114] py-24 md:py-32 border-t border-black/10"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#4F46E5]">
              03. Experience &amp; Professional Journey
            </p>
            <h2
              id="journey-heading"
              className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#111114] text-balance"
            >
              Building across internships, simulations, and editorial leadership.
            </h2>
          </div>

          {/* Functional Segmented Filter Buttons */}
          <div
            role="group"
            aria-label="Filter experience by discipline"
            className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#EAE8E1] rounded-xl self-start lg:self-auto"
          >
            {FILTERS.map((tab) => {
              const active = filter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilter(tab.key)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4F46E5] ${
                    active
                      ? 'bg-white text-[#111114] shadow-sm'
                      : 'text-[#52525B] hover:text-[#111114]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scroll-Driven Timeline */}
        <div className="relative pl-6 sm:pl-10">
          {/* Background Spine */}
          <div
            aria-hidden="true"
            className="absolute left-2 sm:left-3 top-2 bottom-2 w-px bg-black/10"
          />
          {/* GSAP ScrollTrigger Animated Progress Spine */}
          <div
            ref={progressBarRef}
            aria-hidden="true"
            className="absolute left-2 sm:left-3 top-2 bottom-2 w-px bg-[#4F46E5] origin-top"
          />

          <div className="space-y-6">
            {filteredExperiences.map((exp, index) => (
              <article
                key={exp.id}
                className="group relative rounded-2xl bg-white border border-black/8 p-6 sm:p-8 transition-transform duration-200 hover:-translate-y-0.5"
              >
                {/* Timeline Node */}
                <span
                  aria-hidden="true"
                  className="absolute -left-[22px] sm:-left-[34px] top-8 w-2.5 h-2.5 rounded-full bg-[#F6F5F1] border-2 border-[#4F46E5] transition-colors group-hover:bg-[#4F46E5]"
                />

                <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 md:gap-8">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#52525B]">
                      <span className="font-mono tabular-nums text-[#4F46E5]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{CATEGORY_LABEL[exp.category]}</span>
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#111114]">
                      {exp.organization}
                    </h3>
                    <p className="text-sm sm:text-base font-medium text-[#27272A]">
                      {exp.role}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm font-mono tabular-nums text-[#52525B] whitespace-nowrap shrink-0">
                    {exp.period}
                  </p>
                </div>

                {exp.description && (
                  <p className="mt-4 pt-4 border-t border-black/8 text-sm sm:text-base text-[#3F3F46] leading-relaxed max-w-3xl">
                    {exp.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
