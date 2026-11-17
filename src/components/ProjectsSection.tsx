import React, { useState } from 'react';
import { ArrowUpRight, Code2, X } from 'lucide-react';
import { portfolioData, type ProjectSlot } from '../data/portfolioData';

function ProjectCard3D({
  project,
  index,
  reducedMotion,
  onInspect,
}: {
  project: ProjectSlot;
  index: number;
  reducedMotion: boolean;
  onInspect: (project: ProjectSlot) => void;
}) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -py * 6, ry: px * 6 });
  };

  const resetTilt = () => setTilt({ rx: 0, ry: 0 });

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      style={{
        transform: reducedMotion
          ? undefined
          : `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className="group rounded-2xl border border-white/10 bg-[#121217] overflow-hidden flex flex-col justify-between"
    >
      {/* Visual Preview Canvas */}
      <div className="relative aspect-[16/9] bg-[#16161D] border-b border-white/10 overflow-hidden">
        {project.thumbnailUrl ? (
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full p-6 sm:p-7 flex flex-col justify-between bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_62%)]">
            <div className="flex items-center justify-between text-xs font-mono text-[#A1A1AA]">
              <span className="tabular-nums text-[#818CF8]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="tabular-nums">{project.period}</span>
            </div>

            <div className="my-auto flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl border border-white/15 bg-white/5 flex items-center justify-center text-[#818CF8] shrink-0">
                <Code2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-mono text-[#A1A1AA] truncate">
                  {project.repoHandle ?? project.category}
                </p>
                <p className="font-display text-lg font-medium text-white truncate mt-0.5">
                  {project.title}
                </p>
              </div>
            </div>

            <div className="h-px w-full bg-white/10" />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#A1A1AA]">
            <span>{project.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{project.period}</span>
          </div>

          <h3 className="font-display text-xl sm:text-2xl font-semibold text-white leading-snug">
            {project.title}
          </h3>

          <p className="text-sm text-[#A1A1AA] leading-relaxed">{project.summary}</p>
        </div>

        <div className="space-y-5 pt-4 border-t border-white/10">
          {/* Clean unboxed typographic tags */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-[#A1A1AA]">
            {project.tags.map((tag, i) => (
              <React.Fragment key={tag}>
                <span>{tag}</span>
                {i < project.tags.length - 1 && (
                  <span aria-hidden="true" className="text-[#52525B]">
                    /
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-white hover:text-[#818CF8] transition-colors whitespace-nowrap"
                >
                  <span>View Project</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              )}

              {project.repositoryUrl && (
                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-white hover:text-[#818CF8] transition-colors whitespace-nowrap"
                >
                  <span>View Repository</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={() => onInspect(project)}
              className="text-xs font-mono text-[#A1A1AA] hover:text-white transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#6366F1]"
            >
              Details →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectsSection({ reducedMotion }: { reducedMotion: boolean }) {
  const [selectedProject, setSelectedProject] = useState<ProjectSlot | null>(null);

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="bg-[#0B0B0E] text-[#F5F4F0] py-24 md:py-32 border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#818CF8]">
              04. Featured Projects
            </p>
            <h2
              id="projects-heading"
              className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white text-balance"
            >
              AI web builds, experiments, and interactive editions.
            </h2>
          </div>

          <p className="text-sm text-[#A1A1AA] max-w-sm">
            A curated collection of recent builds spanning AI disaster response, data persistence, and interactive web applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          {portfolioData.projects.map((project, index) => (
            <ProjectCard3D
              key={project.id}
              project={project}
              index={index}
              reducedMotion={reducedMotion}
              onInspect={setSelectedProject}
            />
          ))}
        </div>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-project-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#121217] p-6 sm:p-8 space-y-5 text-[#F5F4F0]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-[#818CF8]">
                  {selectedProject.category} · {selectedProject.period}
                </p>
                <h3
                  id="modal-project-title"
                  className="font-display text-2xl font-semibold text-white mt-1"
                >
                  {selectedProject.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                aria-label="Close project details"
                className="w-10 h-10 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedProject.repoHandle && (
              <p className="text-xs font-mono text-[#A1A1AA]">
                GitHub: {selectedProject.repoHandle}
              </p>
            )}

            <p className="text-sm text-[#D4D4D8] leading-relaxed">
              {selectedProject.summary}
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-[#A1A1AA] pt-2 border-t border-white/10">
              {selectedProject.tags.map((tag, i) => (
                <React.Fragment key={tag}>
                  <span>{tag}</span>
                  {i < selectedProject.tags.length - 1 && (
                    <span aria-hidden="true" className="text-[#52525B]">
                      /
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              {selectedProject.repositoryUrl && (
                <a
                  href={selectedProject.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg transition-colors"
                >
                  <span>Open on GitHub</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 text-xs font-medium text-[#E4E4E7] bg-white/10 hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
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
