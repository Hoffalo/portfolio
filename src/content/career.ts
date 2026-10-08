import type { Education, Experience } from "./types";

/** Newest first. Add a new role at the top; everything else (rooms, timeline, sorting) follows. */
export const experiences: Experience[] = [
  {
    id: "brasa-manager",
    organization: "BRASA — Brazilian Student Association",
    motif: "camera",
    accent: "#1f9d55",
    role: { en: "Audiovisual Manager", pt: "Gerente de Audiovisual" },
    location: { en: "Remote", pt: "Remoto" },
    start: "2026-08",
    highlights: [
      {
        en: "Founded the audiovisual department inside the communications board; until then video lived under design.",
        pt: "Idealizei e criei a gerência de audiovisual na diretoria de comunicação; antes, o audiovisual fazia parte da gerência de design.",
      },
      {
        en: "Lead a team of analysts, mentoring their growth and running continuous Adobe Suite training.",
        pt: "Lidero uma equipe de analistas, acompanhando seu desenvolvimento e garantindo capacitação contínua com Adobe Suite.",
      },
      {
        en: "Expanding BRASA's visual identity with motion design.",
        pt: "Estou expandindo a identidade visual da BRASA com motion design.",
      },
      {
        en: "Lead creative production for teasers, institutional films and the BRASA Ensina video lessons.",
        pt: "Lidero a produção criativa de teasers, vídeos institucionais e das videoaulas do BRASA Ensina.",
      },
    ],
    tags: ["Leadership", "Premiere Pro", "After Effects", "Motion design"],
  },
  {
    id: "btg-pactual",
    organization: "BTG Pactual",
    motif: "chart",
    accent: "#0b3d91",
    role: { en: "IT Intern — Credit Engine", pt: "Estagiário de TI — Credit Engine" },
    location: { en: "São Paulo, Brazil", pt: "São Paulo, Brasil" },
    start: "2026-06",
    end: "2026-08",
    highlights: [
      {
        en: "Worked on credit analysis, data analysis and database operations projects.",
        pt: "Trabalhei em projetos de análise de crédito, análise de dados e operações em bases de dados.",
      },
      {
        en: "Delivered a custom Datadog metric that detects anomalous executions.",
        pt: "Entreguei uma métrica customizada no Datadog para detecção de execuções anômalas.",
      },
      {
        en: "Migrated a legacy client-monitoring repository to modern .NET.",
        pt: "Migrei um repositório legado de monitoramento de clientes para .NET moderno.",
      },
    ],
    tags: [".NET", "AWS", "Azure", "Datadog"],
  },
  {
    id: "tappedout",
    organization: "TappedOut",
    motif: "punching-bag",
    accent: "#d64545",
    role: { en: "Co-founder", pt: "Cofundador" },
    location: { en: "Madrid · Hybrid", pt: "Madri · Híbrido" },
    start: "2026-04",
    highlights: [
      {
        en: "Co-founded a startup connecting martial-arts athletes, promoters and fans with new opportunities.",
        pt: "Fundei, com dois sócios, uma startup que conecta atletas, promotores e entusiastas de artes marciais a novas oportunidades.",
      },
      {
        en: "Built most of the app and the entire website, with an intuitive UX and a robust backend.",
        pt: "Desenvolvi grande parte do aplicativo e o site completo, com uma experiência intuitiva e um backend robusto.",
      },
      {
        en: "Created the brand identity: logos and a design system for consistency.",
        pt: "Criei a identidade visual da marca: logos e um design system para garantir consistência.",
      },
    ],
    tags: ["Startup", "Full-stack", "Branding"],
  },
  {
    id: "brasa-analyst",
    organization: "BRASA — Brazilian Student Association",
    motif: "camera",
    accent: "#1f9d55",
    role: { en: "Audiovisual Analyst", pt: "Analista de Audiovisual" },
    location: { en: "Remote", pt: "Remoto" },
    start: "2025-06",
    end: "2026-08",
    highlights: [
      {
        en: "Created and edited long- and short-form content: conference teasers, institutional videos and the monthly podcast.",
        pt: "Criei e editei conteúdos de formato longo e curto: teasers das conferências, vídeos institucionais e o podcast mensal.",
      },
      {
        en: "Kept every piece on-brand to reach BRASA's audience and its mission of empowering the next generation of Brazilian leaders.",
        pt: "Garanti que cada peça seguisse a marca para alcançar o público da BRASA e cumprir sua missão de empoderar a próxima geração de líderes brasileiros.",
      },
    ],
    tags: ["Video editing", "Podcast", "Social media"],
  },
  {
    id: "ie-robotics",
    organization: "IE University Robotics Lab",
    motif: "robot",
    accent: "#1d4ed8",
    role: { en: "Botzo — Robot Dog", pt: "Botzo — Cão Robô" },
    location: { en: "Madrid · Hybrid", pt: "Madri · Híbrido" },
    start: "2024-10",
    end: "2026-01",
    highlights: [
      {
        en: "Researched, developed and built an advanced, affordable robot dog in the spirit of Boston Dynamics.",
        pt: "Pesquisamos, desenvolvemos e construímos um cão robô avançado e acessível, no espírito da Boston Dynamics.",
      },
      {
        en: "Ran the group's YouTube channel with devlogs on the project's progress.",
        pt: "Gerenciei o canal do YouTube do grupo com devlogs sobre o avanço do projeto.",
      },
    ],
    tags: ["Robotics", "Research", "YouTube"],
  },
  {
    id: "freelance",
    organization: "Freelance",
    motif: "clapper",
    accent: "#8b5cf6",
    role: { en: "Video Editor & Animator", pt: "Editor de Vídeo & Animador" },
    location: { en: "Remote", pt: "Remoto" },
    start: "2024-09",
    highlights: [
      {
        en: "Produce animated advertising for out-of-home (OOH) LED panels for clients such as PepsiCo Brazil, Zigon Com, FIDELIS Marketing and Edelweiss Galeria de Artes.",
        pt: "Produzo publicidade animada para painéis de LED Out-Of-Home (OOH) para clientes como PepsiCo Brasil, Zigon Com, FIDELIS Marketing e Edelweiss Galeria de Artes.",
      },
      {
        en: "Create engaging, retention-focused YouTube content following industry standards.",
        pt: "Crio conteúdos envolventes e focados em retenção para o YouTube, seguindo padrões do mercado.",
      },
    ],
    tags: ["After Effects", "Premiere Pro", "Illustrator", "Photoshop"],
  },
  {
    id: "zigon",
    organization: "Zigon Com",
    motif: "palette",
    accent: "#f59e0b",
    role: {
      en: "Communications & Technology Intern",
      pt: "Estagiário de Comunicação e Tecnologia",
    },
    location: { en: "São Paulo, Brazil · Hybrid", pt: "São Paulo, Brasil · Híbrido" },
    start: "2024-06",
    end: "2024-08",
    highlights: [
      {
        en: "Designed the company's website and created its current logo and visual identity.",
        pt: "Desenhei o site da empresa e criei o logotipo atual e toda a identidade visual.",
      },
      {
        en: "Worked hands-on with LED panel technology.",
        pt: "Trabalhei diretamente com tecnologia de painéis de LED.",
      },
    ],
    tags: ["Branding", "Web design", "LED panels"],
  },
  {
    id: "pamun",
    organization: "Park International School",
    motif: "podium",
    accent: "#0e7490",
    role: {
      en: "Deputy Secretary-General — Model UN",
      pt: "Vice-Secretário-Geral — Modelo da ONU",
    },
    location: { en: "Lisbon, Portugal", pt: "Lisboa, Portugal" },
    start: "2023-03",
    end: "2023-11",
    highlights: [
      {
        en: "Founded the PaMUN conference, now an ongoing project handed to a new team every year.",
        pt: "Fundei a conferência PaMUN, hoje um projeto contínuo passado a uma nova equipe a cada ano.",
      },
      {
        en: "Managed team performance, outreach to other international schools, invoicing, catering and finances in Excel.",
        pt: "Gerenciei o desempenho do time, o contato com outras escolas internacionais, faturamento, catering e finanças no Excel.",
      },
      {
        en: "Designed and maintained the conference website and Instagram.",
        pt: "Desenhei e mantive o site e o Instagram da conferência.",
      },
    ],
    tags: ["Leadership", "Diplomacy", "Public speaking"],
    links: [{ label: "pa-mun.com", url: "https://pa-mun.com" }],
  },
];

export const education: Education[] = [
  {
    id: "ie-university",
    institution: "IE University",
    credential: {
      en: "BSc Computer Science & Artificial Intelligence",
      pt: "Bacharelado em Ciência da Computação e Inteligência Artificial",
    },
    location: { en: "Madrid, Spain", pt: "Madri, Espanha" },
    startYear: 2024,
    endYear: 2028,
  },
  {
    id: "park-is",
    institution: "Park International School",
    credential: { en: "IB Diploma Programme, IGCSE", pt: "IB Diploma Programme, IGCSE" },
    details: [
      {
        en: "HL Physics, Economics, Math AI and Film Studies; SL Spanish ab initio and English Language & Literature.",
        pt: "HL Física, Economia, Matemática AI e Film Studies; SL Espanhol ab initio e Inglês Língua e Literatura.",
      },
      {
        en: "MUN delegate, chair and Deputy Secretary-General; basketball team.",
        pt: "Delegado, chair e Vice-Secretário-Geral no MUN; time de basquete.",
      },
    ],
    location: { en: "Lisbon, Portugal", pt: "Lisboa, Portugal" },
    startYear: 2020,
    endYear: 2024,
  },
];
