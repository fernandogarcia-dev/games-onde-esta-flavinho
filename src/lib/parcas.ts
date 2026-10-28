import parcasData from "@/lib/parcas-data.json";
import type { Difficulty } from "@/lib/types";

export type ParcaPerson = {
  id: string;
  name: string;
  blurb: string;
  clues: {
    easy: string[];
    medium: string[];
    hard: string[];
  };
};

type ParcasFile = {
  people: ParcaPerson[];
};

const PEOPLE = (parcasData as ParcasFile).people;

export function allParcas(): ParcaPerson[] {
  return PEOPLE;
}

export function getParca(id: string): ParcaPerson | undefined {
  return PEOPLE.find((p) => p.id === id);
}

/** Clue tier unlocked for the chosen game difficulty. */
export function parcaClueTier(difficulty: Difficulty): Difficulty {
  return difficulty;
}

export function cluesFor(
  person: ParcaPerson,
  difficulty: Difficulty,
): string[] {
  const tier = parcaClueTier(difficulty);
  return person.clues[tier].slice(0, 3);
}

const RUN_SIZE = 6;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function dealParcaRun(size = RUN_SIZE): ParcaPerson[] {
  return shuffle(PEOPLE).slice(0, Math.min(size, PEOPLE.length));
}

/** Multiple-choice options: correct + 5 distractors. */
export function pickParcaOptions(
  correct: ParcaPerson,
  salt: string,
  count = 6,
): ParcaPerson[] {
  let h = 0;
  for (let i = 0; i < salt.length; i++) h = (h * 31 + salt.charCodeAt(i)) | 0;
  const others = PEOPLE.filter((p) => p.id !== correct.id);
  const shuffled = [...others].sort((a, b) => {
    const ha = ((h ^ a.id.charCodeAt(0) * 17) + a.id.length) | 0;
    const hb = ((h ^ b.id.charCodeAt(0) * 17) + b.id.length) | 0;
    return (ha & 0xffff) - (hb & 0xffff);
  });
  const picks = shuffle([correct, ...shuffled.slice(0, count - 1)]);
  return picks;
}

export const PARCA_HIT_BONUS: Record<Difficulty, number> = {
  easy: 800,
  medium: 1400,
  hard: 2200,
};

export const PARCA_CLUE_PENALTY = 120;
