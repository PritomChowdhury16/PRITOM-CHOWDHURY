import React, { useState } from 'react';
import { Award, ExternalLink, FileText, GraduationCap, X } from 'lucide-react';
import { portfolioData, type CertificationItem } from '../data/portfolioData';

export function CredentialsSection() {
  const [selectedCert, setSelectedCert] = useState<CertificationItem | null>(null);

  return (
    <section
      id="credentials"
      aria-labelledby="education-heading"
      className="bg-[#F6F5F1] text-[#111114] py-24 md:py-32 border-t border-black/10"
    >
      <div className="max-w-7xl mx-auto px-6 space-y-24">
        {/* Education */}
        <div>
          <div className="space-y-3 max-w-2xl mb-12">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#4F46E5]">
              05. Education
            </p>
            <h2
              id="education-heading"
              className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#111114]"
            >
              Academic foundation &amp; technical training.
            </h2>
          </div>

          <div className="divide-y divide-black/10 border-t border-b border-black/10">
            {portfolioData.education.map((edu) => (
              <div
                key={edu.id}
                className="py-6 sm:py-7 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-8 items-baseline"
              >
                <div className="md:col-span-5 flex items-baseline gap-3">
                  <GraduationCap className="w-4 h-4 text-[#4F46E5] shrink-0 translate-y-0.5" />
                  <h3 className="font-display text-lg sm:text-xl font-semibold text-[#111114]">
                    {edu.institution}
                  </h3>
                </div>
                <p className="md:col-span-4 text-sm sm:text-base text-[#27272A]">
                  {edu.degree}
                </p>
                <p className="md:col-span-3 md:text-right text-xs sm:text-sm font-mono tabular-nums text-[#52525B]">
                  {edu.period}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Honors & Achievements */}
        <div id="honors">
          <div className="space-y-3 max-w-2xl mb-12">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#4F46E5]">
              06. Honors &amp; Achievements
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#111114]">
              Academic excellence &amp; AI recognition.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {portfolioData.honors.map((honor, idx) => (
              <article
                key={honor.id}
                className="rounded-2xl bg-white border border-black/8 p-6 flex flex-col justify-between space-y-6 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between text-xs text-[#52525B]">
                  <span className="font-mono tabular-nums text-[#4F46E5]">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <Award className="w-4 h-4 text-[#4F46E5]" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-lg font-semibold text-[#111114] leading-snug">
                    {honor.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#52525B]">
                    <span>{honor.issuer}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{honor.period}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div id="certifications">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div className="space-y-3 max-w-2xl">
              <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#4F46E5]">
                07. Certifications
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#111114]">
                Verified credentials &amp; skill records.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#52525B] max-w-sm">
              Select any certification record to attach or inspect certificate imagery and verification links.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {portfolioData.certifications.map((cert) => (
              <button
                key={cert.id}
                type="button"
                onClick={() => setSelectedCert(cert)}
                className="text-left rounded-2xl bg-white border border-black/8 p-6 flex flex-col justify-between space-y-5 hover:border-[#4F46E5]/50 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4F46E5]"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-[#52525B]">{cert.issuer}</span>
                  <FileText className="w-4 h-4 text-[#52525B]" />
                </div>

                <h3 className="font-display text-lg font-semibold text-[#111114]">
                  {cert.title}
                </h3>

                <span className="text-xs font-medium text-[#4F46E5]">
                  {cert.verificationUrl
                    ? 'View Verification →'
                    : 'Open Credential Slot →'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Certification Inspection Modal */}
      {selectedCert && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-cert-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-black/10 bg-white p-6 sm:p-8 space-y-5 text-[#111114]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-[#4F46E5]">{selectedCert.issuer}</p>
                <h3
                  id="modal-cert-title"
                  className="font-display text-2xl font-semibold text-[#111114] mt-1"
                >
                  {selectedCert.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCert(null)}
                aria-label="Close certification details"
                className="w-10 h-10 rounded-lg flex items-center justify-center text-[#52525B] hover:text-[#111114] hover:bg-black/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedCert.certificateImageUrl ? (
              <div className="rounded-xl overflow-hidden border border-black/10">
                <img
                  src={selectedCert.certificateImageUrl}
                  alt={selectedCert.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-black/20 bg-[#F6F5F1] p-6 text-center space-y-2">
                <p className="text-sm font-medium text-[#111114]">
                  Certificate Image Slot Ready
                </p>
                <p className="text-xs text-[#52525B]">{selectedCert.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              {selectedCert.verificationUrl && (
                <a
                  href={selectedCert.verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg"
                >
                  <span>Verify Credential</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                type="button"
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2 text-xs font-medium text-[#111114] bg-[#EAE8E1] hover:bg-[#DFDCD2] rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
