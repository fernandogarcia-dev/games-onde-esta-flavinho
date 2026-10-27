import {
  CITY_CATALOG,
  citiesForDifficulty,
  getCityRecord,
  type CityId,
  type CityRecord,
  type CityTier,
} from "@/lib/city-catalog";
import { sceneForCity, type SceneConfig } from "@/lib/scenes";
import type { Difficulty } from "@/lib/types";

export type { CityId };

export type City = {
  id: CityId;
  name: string;
  country: string;
  blurb: string;
};

export type EpisodeSeed = {
  id: string;
  title: string;
  correctCity: CityId;
  difficulty: CityTier;
  shareLine: string;
};

export type Level = EpisodeSeed & {
  clues: string[];
  wrongHints: Record<string, string>;
  scene: SceneConfig;
};

export const CITIES: City[] = CITY_CATALOG.map((c) => ({
  id: c.id,
  name: c.name,
  country: c.country,
  blurb: c.blurb,
}));

function wrongLineFor(city: CityRecord, salt: string): string {
  const options = [
    `${city.name}? As pistas não fecham com ${city.country}.`,
    `Marcas de ${city.name} não aparecem nesta mesa.`,
    `${city.blurb.replace(/\.$/, "")} — não é o que as pistas descrevem.`,
    `Quem conhece ${city.name} sabe que estas características apontam para outro lugar.`,
  ];
  let h = 0;
  for (let i = 0; i < salt.length; i++) h = (h * 31 + salt.charCodeAt(i)) | 0;
  return options[Math.abs(h) % options.length];
}

function buildWrongHints(
  correct: CityId,
  pool: CityRecord[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const city of pool) {
    if (city.id === correct) {
      out[city.id] = "";
      continue;
    }
    out[city.id] = wrongLineFor(city, `${correct}:${city.id}`);
  }
  return out;
}

function episodeTitle(city: CityRecord): string {
  const titles = [
    `Sumiço em ${city.name}`,
    `Rastro em ${city.name}`,
    `Cadê ele em ${city.name}?`,
    `Pista quente: ${city.name}`,
  ];
  let h = 0;
  for (let i = 0; i < city.id.length; i++) h = (h * 33 + city.id.charCodeAt(i)) | 0;
  return titles[Math.abs(h) % titles.length];
}

/** One dossier per catalog city — difficulty matches the city tier. */
export const EPISODE_SEEDS: EpisodeSeed[] = CITY_CATALOG.map((city) => ({
  id: `ep-${city.id}`,
  title: episodeTitle(city),
  correctCity: city.id,
  difficulty: city.tier,
  shareLine: `Achei o Flavinho em ${city.name}!`,
}));

export const LEVELS: Level[] = EPISODE_SEEDS.map((seed) => {
  const pool = citiesForDifficulty(
    seed.difficulty === "easy"
      ? "easy"
      : seed.difficulty === "medium"
        ? "medium"
        : "hard",
  );
  return {
    ...seed,
    clues: [] as string[],
    wrongHints: buildWrongHints(seed.correctCity, pool),
    scene: sceneForCity(seed.correctCity),
  };
});

export function getCity(id: CityId): City {
  const r = getCityRecord(id);
  return { id: r.id, name: r.name, country: r.country, blurb: r.blurb };
}

export function getLevelById(id: string): Level | undefined {
  return LEVELS.find((l) => l.id === id);
}

/**
 * 6 city options for the map: correct + 5 random others from the
 * active difficulty pool (changes every dossier).
 */
export function pickCityOptions(
  correct: CityId,
  salt: string,
  difficulty: Difficulty = "mix",
): City[] {
  let h = 2166136261;
  for (let i = 0; i < salt.length; i++) {
    h ^= salt.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h |= 0;
    h =
      (Math.imul(h ^ (h >>> 16), 2246822507) +
        Math.imul(h ^ (h >>> 13), 3266489909)) |
      0;
    return ((h >>> 0) % 10000) / 10000;
  };
  const pool = citiesForDifficulty(difficulty).map((c) => ({
    id: c.id,
    name: c.name,
    country: c.country,
    blurb: c.blurb,
  }));
  const others = pool.filter((c) => c.id !== correct);
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  const correctCity = getCity(correct);
  const picked = [correctCity, ...others.slice(0, 5)];
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }
  return picked;
}
