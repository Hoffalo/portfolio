import type { Localized } from "../../i18n/locale";

export const devLabels = {
  activity: { en: "Activity", pt: "Atividade" },
  stack: { en: "Stack", pt: "Stack" },
  repositories: { en: "Repositories", pt: "Repositórios" },
  busiestDay: { en: "Busiest day", pt: "Dia mais ativo" },
  streak: { en: "Current streak", pt: "Sequência atual" },
  days: { en: "days", pt: "dias" },
} satisfies Record<string, Localized>;
