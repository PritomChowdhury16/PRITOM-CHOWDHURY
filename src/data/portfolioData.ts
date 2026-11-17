export interface ExperienceItem {
  id: string;
  organization: string;
  role: string;
  period: string;
  category: 'engineering' | 'content' | 'analytics';
  description?: string;
}

export interface ProjectSlot {
  id: string;
  slotLabel: string;
  isPlaceholder: boolean;
  title: string;
  period: string;
  category: string;
  repoHandle: string | null;
  summary: string;
  tags: string[];
  liveUrl: string | null;
  repositoryUrl: string | null;
  thumbnailUrl: string | null;
  editableNotes: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  period: string;
}

export interface HonorItem {
  id: string;
  title: string;
  issuer: string;
  period: string;
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  certificateImageUrl: string | null;
  verificationUrl: string | null;
  notes: string;
}

export interface SkillDomain {
  id: 'ai-content' | 'development' | 'creative' | 'analytics';
  title: string;
  subtitle: string;
  accentHex: string;
  skills: string[];
}

export const portfolioData = {
  brand: {
    name: 'Pritom Chowdhury',
    firstName: 'PRITOM',
    lastName: 'CHOWDHURY',
    headline: 'AI Graphics Designer | AI Web Developer | AI Content Writer | Founder of Hack with AI',
    location: 'Chattogram, Bangladesh',
    email: 'pritomchy2003@gmail.com',
    linkedinUrl: 'https://www.linkedin.com/in/pritom-chowdhury-981b22298/',
    blogUrl: 'https://pritomchowdhury.lovable.app/',
  },
  hero: {
    welcomeHeadline: "Hello, I'm Pritom.",
    roleLabel: 'AI Graphics Designer & AI Web Developer',
    welcomeSubheadline:
      'Crafting AI-driven visual systems, interactive web experiences, and human-centered stories.',
    scrollPrompt: 'Scroll to explore',
    revealTagline: 'Designing intelligent visuals and building expressive AI web experiences.',
    primaryCta: 'Explore My Journey',
    secondaryCta: "Let's Collaborate",
    /**
     * Replaceable 3D Character Asset Slot:
     * Point this to a rigged Blender-exported .glb file (e.g. "/models/pritom.glb")
     * if you wish to swap in a custom 3D model later.
     * When null, the hero renders Pritom's actual portrait inside an interactive 3D studio frame.
     */
    characterGlbUrl: null as string | null,
    namasteClipName: 'NamasteGreeting',
    portraitUrl: '/assets/aistudio/image_46588e3b.png',
  },
  about: {
    heading: 'Where AI graphics design, web engineering, and storytelling converge.',
    paragraphs: [
      'Passionate about the intersection of AI, design, and impactful storytelling.',
      'As an AI Graphics Designer and AI Web Developer — and Founder of Hack with AI — I craft visually compelling identities, build intelligent web interfaces, and simplify complex AI topics for curious minds.',
      'Selected as a Delegate at the World Bank Youth Summit 2025 and the International Youth Summit 2025, I actively contribute to global conversations on innovation and youth empowerment.',
      'Currently pursuing my degree at East Delta University while building a bridge between emerging technology and content that educates, inspires, and activates.',
    ],
    highlights: [
      'AI Graphics Designer',
      'AI Web Developer',
      'Chattogram, Bangladesh',
      'East Delta University',
      'World Bank Youth Summit 2025 Delegate',
      'International Youth Summit 2025 Delegate',
      'Founder of Hack with AI',
    ],
  },
  expertise: [
    {
      id: 'creative',
      title: 'AI Graphics Design',
      subtitle: 'Shaping cohesive AI-assisted visual systems, brand graphics, and digital storytelling.',
      accentHex: '#A5B4FC',
      skills: [
        'AI Graphics Design',
        'Graphics Design',
        'Visual Communication',
        'Digital Storytelling',
      ],
    },
    {
      id: 'development',
      title: 'AI Web Development',
      subtitle: 'Engineering responsive, expressive web interfaces built for modern AI workflows.',
      accentHex: '#818CF8',
      skills: [
        'AI Web Development',
        'Frontend Development',
        'Frontend AI Engineering',
        'Web Experience Design',
      ],
    },
    {
      id: 'ai-content',
      title: 'AI & Content',
      subtitle: 'Distilling complex artificial intelligence into clear, actionable narratives.',
      accentHex: '#6366F1',
      skills: [
        'AI-Focused Content Writing',
        'AI Tools Research',
        'Newsletter Development',
        'Strategic Communication',
      ],
    },
    {
      id: 'analytics',
      title: 'Analytics',
      subtitle: 'Interpreting large datasets to uncover patterns and inform decisions.',
      accentHex: '#60A5FA',
      skills: [
        'Big Data Analytics',
        'Data Analysis',
        'Statistical Data Analysis',
      ],
    },
  ] satisfies SkillDomain[],
  experiences: [
    {
      id: 'iaf',
      organization: 'InAmigos Foundation (IAF)',
      role: 'Content Writer',
      period: 'September 2026 – October 2026',
      category: 'content',
      description: 'Writing content for social impact projects.',
    },
    {
      id: 'flyrank',
      organization: 'FlyRank AI',
      role: 'Front-end AI Engineer — Internship',
      period: 'September 2026 – October 2026',
      category: 'engineering',
    },
    {
      id: 'syntecxhub',
      organization: 'Syntecxhub',
      role: 'Frontend Developer Intern',
      period: 'September 2026 – October 2026',
      category: 'engineering',
    },
    {
      id: 'codealpha',
      organization: 'CodeAlpha',
      role: 'Graphic Design Intern',
      period: 'September 2026 – October 2026',
      category: 'content',
    },
    {
      id: 'hack-with-ai',
      organization: 'Hack with AI Newsletter',
      role: 'Founder',
      period: 'May 2025 – October 2026',
      category: 'content',
      description:
        'Hack with AI is your weekly guide to leveraging Artificial Intelligence for smarter living. From productivity hacks to real-world AI tools, simplify your work, life, and learning with curated insights every week.',
    },
    {
      id: 'deloitte',
      organization: 'Deloitte',
      role: 'Data Analytics Intern — Excel and Tableau analysis of gender pay gaps',
      period: 'June 2025',
      category: 'analytics',
    },
    {
      id: 'pwc',
      organization: 'PwC',
      role: 'Cyber Security Consulting Simulation',
      period: 'June 2025',
      category: 'analytics',
    },
    {
      id: 'tata',
      organization: 'Tata Group',
      role: 'GenAI Powered Data Analytics Job Simulation',
      period: 'June 2025',
      category: 'analytics',
    },
    {
      id: 'ey',
      organization: 'EY',
      role: 'Climate Change and Sustainability Job Simulation',
      period: 'June 2025',
      category: 'analytics',
    },
  ] satisfies ExperienceItem[],
  /**
   * Featured Projects Data Structure
   * Populated from Pritom Chowdhury's project records and GitHub repositories.
   */
  projects: [
    {
      id: 'ghost-data-still-exist',
      slotLabel: 'Project 01',
      isPlaceholder: false,
      title: 'Ghost Data still exist',
      period: 'Oct 2026 – Present',
      category: 'Open-Source Web Project',
      repoHandle: 'PritomChowdhury16/ghost-data-still-exists',
      summary:
        'Repository exploring persistent digital footprints and data presence on the web.',
      tags: ['GitHub Repository', 'Web Development'],
      liveUrl: null,
      repositoryUrl: 'https://github.com/PritomChowdhury16/ghost-data-still-exists',
      thumbnailUrl: null,
      editableNotes:
        'Add a custom liveUrl or thumbnailUrl in src/data/portfolioData.ts whenever ready.',
    },
    {
      id: 'relieflens-aid-flow',
      slotLabel: 'Project 02',
      isPlaceholder: false,
      title: 'ReliefLens — AI-Powered Disaster Response & Priority System',
      period: 'Aug 2026 – Present',
      category: 'AI Web Application',
      repoHandle: 'PritomChowdhury16/relieflens-aid-flow',
      summary:
        'ReliefLens is an AI-powered disaster response platform designed to assist response prioritization and aid flow.',
      tags: ['Vibe Coding', 'Web Development', 'AI Integration'],
      liveUrl: null,
      repositoryUrl: 'https://github.com/PritomChowdhury16/relieflens-aid-flow',
      thumbnailUrl: null,
      editableNotes:
        'Add a custom liveUrl or thumbnailUrl in src/data/portfolioData.ts whenever ready.',
    },
    {
      id: 'brainly-match',
      slotLabel: 'Project 03',
      isPlaceholder: false,
      title: 'Brainly Match',
      period: 'Jul 2026 – Aug 2026',
      category: 'Interactive Web Project',
      repoHandle: 'PritomChowdhury16/Brainly-Match',
      summary:
        'Interactive matching web experience built and published on GitHub.',
      tags: ['GitHub Repository', 'Web Experience Design'],
      liveUrl: null,
      repositoryUrl: 'https://github.com/PritomChowdhury16/Brainly-Match',
      thumbnailUrl: null,
      editableNotes:
        'Add a custom liveUrl or thumbnailUrl in src/data/portfolioData.ts whenever ready.',
    },
    {
      id: 'brainy-match-gurukul-edition',
      slotLabel: 'Project 04',
      isPlaceholder: false,
      title: 'Brainy-Match-Gurukul-Edition',
      period: 'Jul 2026 – Aug 2026',
      category: 'Interactive Learning Edition',
      repoHandle: null,
      summary:
        'Gurukul-themed edition of the Brainy Match interactive learning concept.',
      tags: ['Interactive Design', 'Educational Concept'],
      liveUrl: null,
      repositoryUrl: null,
      thumbnailUrl: null,
      editableNotes:
        'Add repositoryUrl, liveUrl, or thumbnailUrl in src/data/portfolioData.ts when ready to link.',
    },
  ] satisfies ProjectSlot[],
  education: [
    {
      id: 'edu',
      institution: 'East Delta University',
      degree: 'Bachelor of Science (B.Sc.) in Computer Science and Engineering',
      period: 'September 2023 – September 2027',
    },
    {
      id: 'ccpc',
      institution: 'Chittagong Cantonment Public College',
      degree: 'Higher Secondary Certificate (HSC), Science',
      period: 'July 2019 – April 2021',
    },
    {
      id: 'sdtc',
      institution: 'Skill Development Training Center, Urban Social Services Office-2',
      degree: 'Basic Computer Office Application, Graphics Design',
      period: 'March 2019 – 2020',
    },
    {
      id: 'cghs',
      institution: 'Chittagong Government High School',
      degree: 'Secondary School Certificate (SSC), Science',
      period: 'March 2017 – May 2019',
    },
    {
      id: 'splacids',
      institution: "St. Placid's High School & College",
      degree: 'Junior School Certificate (JSC)',
      period: 'January 2016 – December 2016',
    },
  ] satisfies EducationItem[],
  honors: [
    {
      id: 'dean-summer-2024',
      title: 'Dean List — Summer 2024',
      issuer: 'East Delta University',
      period: 'Summer 2024',
    },
    {
      id: 'dean-spring-2024',
      title: 'Dean List — Spring 2024',
      issuer: 'East Delta University',
      period: 'Spring 2024',
    },
    {
      id: 'vc-fall-2024',
      title: 'Vice Chancellor List — Fall 2024',
      issuer: 'East Delta University',
      period: 'Fall 2024',
    },
    {
      id: 'dean-spring-2025',
      title: 'Dean List — Spring 2025',
      issuer: 'East Delta University',
      period: 'Spring 2025',
    },
    {
      id: 'dean-summer-2025',
      title: 'Dean List — Summer 2025',
      issuer: 'East Delta University',
      period: 'Summer 2025',
    },
    {
      id: 'gemini-quizoff-2026',
      title: 'Certificate of Participation — Google Gemini QuizOff 2026',
      issuer: 'Google',
      period: '2026',
    },
    {
      id: 'ai-agents-intensive',
      title: '5-Day AI Agents Intensive Course with Google',
      issuer: 'Google',
      period: 'Intensive Course',
    },
  ] satisfies HonorItem[],
  certifications: [
    {
      id: 'cert-db-basic',
      title: 'Database Basic',
      issuer: 'Credential Record',
      certificateImageUrl: null,
      verificationUrl: null,
      notes: 'Add certificateImageUrl and verificationUrl in src/data/portfolioData.ts when ready.',
    },
    {
      id: 'cert-judo',
      title: 'Judo',
      issuer: 'Athletic Credential',
      certificateImageUrl: null,
      verificationUrl: null,
      notes: 'Add certificateImageUrl and verificationUrl in src/data/portfolioData.ts when ready.',
    },
    {
      id: 'cert-iq-test',
      title: 'IQ Test',
      issuer: 'Assessment Record',
      certificateImageUrl: null,
      verificationUrl: null,
      notes: 'Add certificateImageUrl and verificationUrl in src/data/portfolioData.ts when ready.',
    },
    {
      id: 'cert-gemini-quizoff',
      title: 'Google Gemini QuizOff 2026',
      issuer: 'Google',
      certificateImageUrl: null,
      verificationUrl: null,
      notes: 'Add certificateImageUrl and verificationUrl in src/data/portfolioData.ts when ready.',
    },
    {
      id: 'cert-ai-agents',
      title: '5-Day AI Agents Intensive Course with Google',
      issuer: 'Google',
      certificateImageUrl: null,
      verificationUrl: null,
      notes: 'Add certificateImageUrl and verificationUrl in src/data/portfolioData.ts when ready.',
    },
  ] satisfies CertificationItem[],
  hackWithAi: {
    name: 'HACK WITH AI',
    tagline: 'Your weekly guide to leveraging Artificial Intelligence for smarter living.',
    description:
      'From productivity hacks to real-world AI tools, simplify your work, life, and learning with curated insights every week.',
    blogUrl: 'https://pritomchowdhury.lovable.app/',
    pillars: [
      {
        title: 'AI-Focused Editorial Content',
        detail: 'Clear, structured articles breaking down AI developments without technical noise.',
      },
      {
        title: 'Newsletter Identity',
        detail: 'Weekly curated dispatches designed for curious learners, builders, and students.',
      },
      {
        title: 'AI Productivity & Learning',
        detail: 'Practical workflows that turn emerging models into everyday study and creative leverage.',
      },
      {
        title: 'Curated AI Tools',
        detail: 'Vetted tools evaluated for real utility across writing, coding, and visual design.',
      },
      {
        title: 'Educational Storytelling',
        detail: 'Human-centered narratives connecting technical concepts to meaningful real-world use.',
      },
    ],
  },
  contact: {
    headline: "Let's Build Something Meaningful.",
    supportingText: "Let's collaborate on AI projects, youth-focused initiatives, or content that matters.",
  },
};
