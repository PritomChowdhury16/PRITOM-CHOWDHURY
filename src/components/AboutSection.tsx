import React from 'react';
import { motion } from 'motion/react';
import { portfolioData } from '../data/portfolioData';

const PROFILE_ROWS = [
  { label: 'Primary Craft', value: 'AI Graphics Design & AI Web Development' },
  { label: 'Publication', value: 'Founder — Hack with AI Newsletter' },
  { label: 'Global Forum', value: 'Delegate — World Bank Youth Summit 2025' },
  { label: 'Youth Leadership', value: 'Delegate — International Youth Summit 2025' },
  { label: 'Education', value: 'B.Sc. in CSE — East Delta University' },
  { label: 'Base', value: 'Chattogram, Bangladesh' },
];

export function AboutSection({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="bg-[#F6F5F1] text-[#111114] py-24 md:py-32 border-t border-black/10"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
          {/* Left Column: Editorial Story */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col justify-between space-y-8"
          >
            <div className="space-y-4">
              <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#4F46E5]">
                01. About Me
              </p>
              <h2
                id="about-heading"
                className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-[1.08] text-[#111114] text-balance"
              >
                {portfolioData.about.heading}
              </h2>
            </div>

            <div className="space-y-6 text-base sm:text-lg leading-relaxed text-[#27272A] max-w-2xl">
              {portfolioData.about.paragraphs.map((paragraph, idx) => (
                <p
                  key={idx}
                  className={
                    idx === 0
                      ? 'font-serif text-2xl sm:text-[1.65rem] leading-snug text-[#111114]'
                      : ''
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Editorial Identity Monograph (keeps portrait exclusively in Hero) */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col"
          >
            <div className="flex-1 rounded-2xl border border-black/10 bg-white p-7 sm:p-9 flex flex-col justify-between space-y-8">
              <div className="space-y-2">
                <p className="text-xs font-mono uppercase tracking-[0.16em] text-[#4F46E5]">
                  Profile Monograph
                </p>
                <h3 className="font-display text-2xl font-semibold text-[#111114]">
                  {portfolioData.brand.name}
                </h3>
                <p className="text-sm text-[#52525B]">
                  Building visual systems, AI web interfaces, and clear technology storytelling.
                </p>
              </div>

              <dl className="divide-y divide-black/10 border-t border-b border-black/10">
                {PROFILE_ROWS.map((row) => (
                  <div key={row.label} className="py-3.5 flex flex-col gap-0.5">
                    <dt className="text-[11px] font-mono uppercase tracking-wider text-[#71717A]">
                      {row.label}
                    </dt>
                    <dd className="text-sm font-medium text-[#111114]">{row.value}</dd>
                  </div>
                ))}
              </dl>

              <p className="font-serif italic text-lg text-[#3F3F46]">
                “Simplifying complex artificial intelligence into craft that educates, inspires, and activates.”
              </p>
            </div>
          </motion.div>
        </div>

        {/* Full-Width Unboxed Editorial Metadata Strip */}
        <div className="mt-16 pt-8 border-t border-black/10 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-[#52525B]">
          {portfolioData.about.highlights.map((item, idx) => (
            <React.Fragment key={item}>
              <span className="text-[#18181B] font-medium">{item}</span>
              {idx < portfolioData.about.highlights.length - 1 && (
                <span aria-hidden="true" className="text-[#A1A1AA]">
                  ·
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
