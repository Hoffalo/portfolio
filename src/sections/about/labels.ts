import type { Localized } from "../../i18n/locale";

export const aboutLabels = {
  profile: { en: "Who I am", pt: "Quem sou" },
  skills: { en: "Skills", pt: "Habilidades" },
  languages: { en: "Languages", pt: "Idiomas" },
  education: { en: "Education", pt: "Educação" },
  certificates: { en: "Certificates", pt: "Certificados" },
  interests: { en: "Off the clock", pt: "Fora do expediente" },
} satisfies Record<string, Localized>;
