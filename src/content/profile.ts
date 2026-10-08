import type { Profile, SocialLink } from "./types";

export const GITHUB_USERNAME = "Hoffalo";

/** Links that get a physical sign in the town. The rest only appear in menus. */
export const TOWN_SIGNS: SocialLink["id"][] = ["linkedin", "github"];

export const profile: Profile = {
  name: "Lorenzo Hoffmann",
  headline: {
    en: "Video Editor & Software Engineer",
    pt: "Editor de Vídeo & Engenheiro de Software",
  },
  location: { en: "Madrid, Spain", pt: "Madri, Espanha" },
  email: "lorenzohoff2006@gmail.com",
  avatarUrl: `https://github.com/${GITHUB_USERNAME}.png?size=256`,
  bio: [
    {
      en: "I'm a Computer Science & AI student at IE University in Madrid who lives between two worlds: writing software and telling stories through video.",
      pt: "Sou estudante de Ciência da Computação e Inteligência Artificial na IE University, em Madri, e vivo entre dois mundos: escrever software e contar histórias em vídeo.",
    },
    {
      en: "I've shipped .NET services at BTG Pactual, co-founded a martial-arts startup, built a robot dog with the IE Robotics Lab, and I lead audiovisual production at BRASA.",
      pt: "Já entreguei serviços .NET no BTG Pactual, cofundei uma startup de artes marciais, construí um cão robô no IE Robotics Lab e lidero a produção audiovisual da BRASA.",
    },
  ],
  links: [
    { id: "github", label: "GitHub", url: `https://github.com/${GITHUB_USERNAME}` },
    {
      id: "linkedin",
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/lorenzo-hoffmann-2022a6226/",
    },
    { id: "instagram", label: "Instagram", url: "https://www.instagram.com/hoffalo/" },
  ],
};
