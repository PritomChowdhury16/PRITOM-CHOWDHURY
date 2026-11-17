import React, { useState } from 'react';
import { ArrowUpRight, Check, Copy, Mail } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

export function ContactSection() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(portfolioData.brand.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback: open mail client if clipboard permission is unavailable
      window.location.href = `mailto:${portfolioData.brand.email}`;
    }
  };

  return (
    <footer
      id="contact"
      aria-labelledby="contact-heading"
      className="bg-[#09090B] text-[#F5F4F0] pt-24 pb-12 border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-20 border-b border-white/10">
          {/* Headline & Supporting Copy */}
          <div className="lg:col-span-6 space-y-5">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#818CF8]">
              09. Contact &amp; Collaboration
            </p>
            <h2
              id="contact-heading"
              className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-white text-balance"
            >
              {portfolioData.contact.headline}
            </h2>
            <p className="text-base sm:text-lg text-[#A1A1AA] max-w-md leading-relaxed">
              {portfolioData.contact.supportingText}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={`mailto:${portfolioData.brand.email}`}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg transition-colors duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6366F1]"
              >
                <Mail className="w-4 h-4" />
                <span>Send an Email</span>
              </a>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-[#E4E4E7] bg-white/6 hover:bg-white/12 border border-white/12 rounded-lg transition-colors duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6366F1]"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#818CF8]" />
                    <span>Email Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Address</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Interactive Contact Cards */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href={`mailto:${portfolioData.brand.email}`}
              className="sm:col-span-2 rounded-2xl border border-white/10 bg-[#121217] p-6 hover:border-[#6366F1]/60 transition-colors flex items-center justify-between gap-4 group"
            >
              <div>
                <p className="text-xs font-mono text-[#A1A1AA]">Direct Email</p>
                <p className="font-display text-lg sm:text-xl font-medium text-white mt-1 break-all">
                  {portfolioData.brand.email}
                </p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-[#A1A1AA] group-hover:text-white transition-colors shrink-0" />
            </a>

            <a
              href={portfolioData.brand.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-white/10 bg-[#121217] p-6 hover:border-[#6366F1]/60 transition-colors flex flex-col justify-between gap-6 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#A1A1AA]">LinkedIn</span>
                <ArrowUpRight className="w-4 h-4 text-[#A1A1AA] group-hover:text-white transition-colors" />
              </div>
              <p className="font-display text-lg font-medium text-white">
                Connect Professionally
              </p>
            </a>

            <a
              href={portfolioData.brand.blogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-white/10 bg-[#121217] p-6 hover:border-[#6366F1]/60 transition-colors flex flex-col justify-between gap-6 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#A1A1AA]">Hack with AI</span>
                <ArrowUpRight className="w-4 h-4 text-[#A1A1AA] group-hover:text-white transition-colors" />
              </div>
              <p className="font-display text-lg font-medium text-white">
                Visit Newsletter Blog
              </p>
            </a>
          </div>
        </div>

        {/* Quiet Editorial Footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#A1A1AA]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[#E4E4E7] font-medium">
              {portfolioData.brand.name}
            </span>
            <span aria-hidden="true">·</span>
            <span>{portfolioData.brand.location}</span>
            <span aria-hidden="true">·</span>
            <span>© {new Date().getFullYear()} All rights reserved</span>
          </div>

          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-xs font-mono text-[#A1A1AA] hover:text-white transition-colors whitespace-nowrap"
          >
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
