import React, { Suspense, useEffect, useRef, useState } from 'react';
import { portfolioData, type SkillDomain } from '../data/portfolioData';

const SkillConstellationCanvas = React.lazy(() =>
  import('./three/SkillConstellationCanvas').then((mod) => ({
    default: mod.SkillConstellationCanvas,
  }))
);

interface ExpertiseSectionProps {
  hasWebGL: boolean;
  isSoftwareGl: boolean;
  reducedMotion: boolean;
}

export function ExpertiseSection({
  hasWebGL,
  isSoftwareGl,
  reducedMotion,
}: ExpertiseSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeDomainId, setActiveDomainId] = useState<SkillDomain['id']>('creative');
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: '150px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const activeDomain =
    portfolioData.expertise.find((d) => d.id === activeDomainId) ?? portfolioData.expertise[0];

  return (
    <section
      id="expertise"
      ref={sectionRef}
      aria-labelledby="expertise-heading"
      className="bg-[#0B0B0E] text-[#F5F4F0] py-24 md:py-32 border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#818CF8]">
              02. Expertise &amp; Capabilities
            </p>
            <h2
              id="expertise-heading"
              className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white text-balance"
            >
              A multidisciplinary craft across AI, code, visuals, and data.
            </h2>
          </div>

          <p className="text-sm text-[#A1A1AA] max-w-sm">
            Select a discipline node in the 3D constellation or choose a domain tab to inspect core competencies.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Interactive 3D Skill Constellation */}
          <div className="lg:col-span-6 relative min-h-[360px] sm:min-h-[420px] rounded-2xl border border-white/10 bg-[#111116] overflow-hidden">
            {hasWebGL ? (
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center text-xs font-mono text-[#A1A1AA]">
                    Loading 3D Constellation
                  </div>
                }
              >
                <SkillConstellationCanvas
                  domains={portfolioData.expertise}
                  activeDomainId={activeDomainId}
                  onSelectDomain={setActiveDomainId}
                  isSoftwareGl={isSoftwareGl}
                  reducedMotion={reducedMotion}
                  isVisible={isVisible}
                />
              </Suspense>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-8 text-center">
                <p className="text-sm text-[#A1A1AA]">
                  Interactive 3D constellation requires WebGL. Use the discipline selector to explore each area.
                </p>
              </div>
            )}

            <div className="pointer-events-none absolute bottom-4 left-5 right-5 flex items-center justify-between text-xs text-[#A1A1AA]">
              <span>Drag to orbit · Click node to focus</span>
              <span className="font-medium text-[#E4E4E7]">{activeDomain.title}</span>
            </div>
          </div>

          {/* Domain Selector & Skill Matrix (Zero invented percentages) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
            <div
              role="tablist"
              aria-label="Expertise domains"
              className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-[#141419] border border-white/10 rounded-xl"
            >
              {portfolioData.expertise.map((domain) => {
                const isSelected = domain.id === activeDomainId;
                return (
                  <button
                    key={domain.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveDomainId(domain.id)}
                    className={`px-3 py-2.5 text-xs font-medium rounded-lg transition-colors duration-150 whitespace-nowrap truncate cursor-pointer focus-visible:outline-2 focus-visible:outline-[#6366F1] ${
                      isSelected
                        ? 'bg-[#4F46E5] text-white'
                        : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {domain.title}
                  </button>
                );
              })}
            </div>

            {/* Active Domain Detail Panel */}
            <div
              role="tabpanel"
              className="flex-1 rounded-2xl border border-white/10 bg-[#121217] p-7 sm:p-8 flex flex-col justify-between space-y-8"
            >
              <div className="space-y-3">
                <h3 className="font-display text-2xl sm:text-3xl font-semibold text-white">
                  {activeDomain.title}
                </h3>
                <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed">
                  {activeDomain.subtitle}
                </p>
              </div>

              <ul className="divide-y divide-white/10 border-t border-b border-white/10">
                {activeDomain.skills.map((skill, idx) => (
                  <li
                    key={skill}
                    className="py-4 flex items-center justify-between gap-4 text-sm sm:text-base text-[#F5F4F0]"
                  >
                    <span className="font-medium">{skill}</span>
                    <span className="font-mono text-xs tabular-nums text-[#818CF8]">
                      0{idx + 1}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Compact Overview Index of all 4 Domains */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs text-[#A1A1AA]">
              {portfolioData.expertise.map((domain) => (
                <button
                  key={domain.id}
                  type="button"
                  onClick={() => setActiveDomainId(domain.id)}
                  className={`text-left transition-colors cursor-pointer ${
                    domain.id === activeDomainId
                      ? 'text-white font-medium'
                      : 'hover:text-[#D4D4D8]'
                  }`}
                >
                  <div className="font-display text-sm">{domain.title}</div>
                  <div className="font-mono text-[11px] tabular-nums text-[#71717A] mt-0.5">
                    {domain.skills.length} disciplines
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
