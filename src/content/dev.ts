import type { Localized } from "../i18n/locale";
import type { Motif } from "./types";

/** Repositories shown first, in this order. Everything else follows by most recent push. */
export const featuredRepos = ["fight-matchmaker", "brasacomun-automacao", "comp_prog_cnn_proj"];

/** Repositories that exist publicly but shouldn't appear in the portfolio. */
export const hiddenRepos: string[] = [];

/** Better descriptions than GitHub's (often empty) ones, in both languages. */
export const repoDescriptions: Record<string, Localized> = {
  "fight-matchmaker": {
    en: "Neural network that analyses UFC fights and proposes good matchups from fighter stats.",
    pt: "Rede neural que analisa lutas do UFC e propõe bons confrontos a partir das estatísticas dos lutadores.",
  },
  "brasacomun-automacao": {
    en: "Automation tooling for BRASA's communications team.",
    pt: "Automação para a equipe de comunicação da BRASA.",
  },
  comp_prog_cnn_proj: {
    en: "Convolutional neural network written in C that tells cats from dogs.",
    pt: "Rede neural convolucional escrita em C que distingue gatos de cachorros.",
  },
  "Game-Project": {
    en: "Game built in C for the Principles of Programming course.",
    pt: "Jogo feito em C para a disciplina de Princípios de Programação.",
  },
  "ads-plinko": {
    en: "Plinko simulation for the Algorithms & Data Structures course.",
    pt: "Simulação de Plinko para a disciplina de Algoritmos e Estruturas de Dados.",
  },
  spotifyclassifier: {
    en: "Machine-learning classifier for Spotify tracks (ML Foundations).",
    pt: "Classificador de músicas do Spotify com machine learning (ML Foundations).",
  },
};

/**
 * What a repository looks like in the dev room, when the automatic guess (from its name and
 * description: "music" becomes a jukebox, "game" an arcade cabinet…) isn't right.
 */
export const repoMotifs: Record<string, Motif> = {};
