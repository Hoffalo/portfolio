import type { Interest, SkillGroup, SpokenLanguage } from "./types";

export const skillGroups: SkillGroup[] = [
  {
    id: "engineering",
    title: { en: "Engineering", pt: "Engenharia" },
    skills: [
      { en: "C#, C, Python", pt: "C#, C, Python" },
      { en: "Java & TypeScript", pt: "Java & TypeScript" },
      { en: ".NET, AWS, Azure", pt: ".NET, AWS, Azure" },
      {
        en: "Neural networks & reinforcement learning",
        pt: "Redes neurais e aprendizado por reforço",
      },
      { en: "Unity game design", pt: "Game design na Unity" },
    ],
  },
  {
    id: "media",
    title: { en: "Media", pt: "Mídia" },
    skills: [
      { en: "Adobe Suite", pt: "Adobe Suite" },
      { en: "Video editing", pt: "Edição de vídeo" },
      { en: "Animation & motion design", pt: "Animação e motion design" },
      { en: "Photography & filmmaking", pt: "Fotografia e filmmaking" },
      { en: "OOH & LED panel content", pt: "Conteúdo OOH e painéis de LED" },
    ],
  },
  {
    id: "people",
    title: { en: "People", pt: "Pessoas" },
    skills: [
      { en: "Team leadership", pt: "Liderança de times" },
      { en: "Public speaking", pt: "Oratória" },
      { en: "Storytelling", pt: "Storytelling" },
      { en: "Advanced Excel", pt: "Excel avançado" },
    ],
  },
];

export const spokenLanguages: SpokenLanguage[] = [
  {
    name: { en: "Portuguese", pt: "Português" },
    level: { en: "Native", pt: "Nativo" },
    fluency: 1,
  },
  { name: { en: "English", pt: "Inglês" }, level: { en: "C2", pt: "C2" }, fluency: 0.95 },
  { name: { en: "Spanish", pt: "Espanhol" }, level: { en: "B1", pt: "B1" }, fluency: 0.55 },
  { name: { en: "Italian", pt: "Italiano" }, level: { en: "A2", pt: "A2" }, fluency: 0.3 },
];

export const certificates = [
  "IB Diploma",
  "Edexcel IGCSE",
  "Pearson IGCSE",
  'Google Developer Groups "Build with AI" Hackathon (2025)',
];

export const interests: Interest[] = [
  {
    id: "youtube",
    title: { en: "YouTube channel", pt: "Canal no YouTube" },
    description: {
      en: "Hoffalo: short films, video essays, editing experiments and gameplay.",
      pt: "Hoffalo: curtas-metragens, vídeo-ensaios, experimentos de edição e gameplays.",
    },
  },
  {
    id: "game-design",
    title: { en: "Game design", pt: "Game design" },
    description: {
      en: "Small Unity projects over the years.",
      pt: "Pequenos projetos na Unity ao longo dos anos.",
    },
  },
  {
    id: "piano",
    title: { en: "Piano & music", pt: "Piano & música" },
    description: {
      en: "Playing since 2013, now focused on jazz and blues improvisation.",
      pt: "Toco desde 2013, hoje focado em improvisação de jazz e blues.",
    },
  },
  {
    id: "photography",
    title: { en: "Filmmaking & photography", pt: "Filmmaking & fotografia" },
    description: {
      en: "Photography on Instagram as @hoffalo.",
      pt: "Fotografia no Instagram como @hoffalo.",
    },
    url: "https://www.instagram.com/hoffalo/",
  },
];
