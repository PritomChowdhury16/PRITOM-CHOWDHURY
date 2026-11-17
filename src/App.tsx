/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroNamasteSection } from './components/HeroNamasteSection';
import { AboutSection } from './components/AboutSection';
import { ExpertiseSection } from './components/ExpertiseSection';
import { ExperienceSection } from './components/ExperienceSection';
import { ProjectsSection } from './components/ProjectsSection';
import { CredentialsSection } from './components/CredentialsSection';
import { HackWithAISection } from './components/HackWithAISection';
import { ContactSection } from './components/ContactSection';
import {
  detectSoftwareWebGL,
  hasWebGLSupport,
  prefersReducedMotion,
} from './utils/webgl';

export default function App() {
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [isSoftwareGl, setIsSoftwareGl] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    setHasWebGL(hasWebGLSupport());
    setIsSoftwareGl(detectSoftwareWebGL());
    setReducedMotion(prefersReducedMotion());

    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090B] text-[#F5F4F0]">
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#4F46E5] focus:text-white focus:rounded-lg focus:text-sm"
      >
        Skip to main content
      </a>

      <Navbar />

      <main>
        <HeroNamasteSection
          hasWebGL={hasWebGL}
          isSoftwareGl={isSoftwareGl}
          reducedMotion={reducedMotion}
        />

        <AboutSection reducedMotion={reducedMotion} />

        <ExpertiseSection
          hasWebGL={hasWebGL}
          isSoftwareGl={isSoftwareGl}
          reducedMotion={reducedMotion}
        />

        <ExperienceSection reducedMotion={reducedMotion} />

        <ProjectsSection reducedMotion={reducedMotion} />

        <CredentialsSection />

        <HackWithAISection
          hasWebGL={hasWebGL}
          isSoftwareGl={isSoftwareGl}
          reducedMotion={reducedMotion}
        />
      </main>

      <ContactSection />
    </div>
  );
}
