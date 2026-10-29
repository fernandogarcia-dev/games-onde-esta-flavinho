import geoData from "@/lib/city-geo-data.json";
import {
  citiesForDifficulty,
  type CityId,
  type CityTier,
} from "@/lib/city-catalog";
import type { Difficulty } from "@/lib/types";

export type CityGeo = {
  id: CityId;
  name: string;
  country: string;
  tier: CityTier;
  lat: number;
  lng: number;
  photo: string;
};

type RawGeo = {
  lat: number;
  lng: number;
  photo: string;
  name: string;
  country: string;
  tier: CityTier;
};

const RAW = geoData as Record<string, RawGeo>;

export function getCityGeo(id: CityId): CityGeo | null {
  const raw = RAW[id];
  if (!raw || raw.lat == null || raw.lng == null || !raw.photo) return null;
  return {
    id,
    name: raw.name,
    country: raw.country,
    tier: raw.tier,
    lat: raw.lat,
    lng: raw.lng,
    photo: raw.photo,
  };
}

export function citiesGeoForDifficulty(difficulty: Difficulty): CityGeo[] {
  return citiesForDifficulty(difficulty)
    .map((c) => getCityGeo(c.id))
    .filter((c): c is CityGeo => c != null);
}

/** Haversine distance in kilometers. */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Max points per pin by difficulty. */
export const RUA_SCORE_MAX: Record<Difficulty, number> = {
  easy: 1000,
  medium: 2000,
  hard: 3000,
};

/** Dentro disso = pontuação cheia. */
export const RUA_PERFECT_KM = 5;

/**
 * Quão perto chegou — só faz sentido com o país certo.
 * País errado = erro sempre (mesmo colado na fronteira).
 */
export type RuaProximity = "street" | "city" | "region" | "country";

export const RUA_PROXIMITY_KM: Record<RuaProximity, number> = {
  street: 25,
  city: 120,
  region: 500,
  country: Infinity,
};

export function ruaProximity(km: number): RuaProximity {
  if (!Number.isFinite(km) || km < 0) return "country";
  if (km <= RUA_PROXIMITY_KM.street) return "street";
  if (km <= RUA_PROXIMITY_KM.city) return "city";
  if (km <= RUA_PROXIMITY_KM.region) return "region";
  return "country";
}

export function ruaProximityCopy(proximity: RuaProximity): {
  eyebrow: string;
  title: string;
  subtitle: string;
} {
  switch (proximity) {
    case "street":
      return {
        eyebrow: "Resultado · rua",
        title: "Acertou!",
        subtitle: "Quase na porta — cravou a rua.",
      };
    case "city":
      return {
        eyebrow: "Resultado · cidade",
        title: "Acertou!",
        subtitle: "País e cidade na mão — ainda longe da porta.",
      };
    case "region":
      return {
        eyebrow: "Resultado · região",
        title: "Acertou!",
        subtitle: "País certo e na região — mas não na rua.",
      };
    default:
      return {
        eyebrow: "Resultado · país",
        title: "Acertou!",
        subtitle: "Só o país — bem longe da rua.",
      };
  }
}

/**
 * Pontuação só com país certo. País errado = 0.
 * Distância define o quão perto (países grandes/pequenos).
 */
export function ruaScoreForGuess(
  km: number,
  difficulty: Difficulty,
  sameCountry: boolean,
): number {
  if (!sameCountry) return 0;
  const max = RUA_SCORE_MAX[difficulty];
  const floor = Math.round(max * 0.12);
  if (!Number.isFinite(km) || km < 0) return floor;
  if (km <= RUA_PERFECT_KM) return max;
  // Depois de ~2.500 km no mesmo país, fica no piso (ainda conta acerto de país).
  const far = 2500;
  if (km >= far) return floor;
  const ratio = 1 - (km - RUA_PERFECT_KM) / (far - RUA_PERFECT_KM);
  return Math.round(floor + (max - floor) * Math.max(0, ratio));
}

/** @deprecated use ruaScoreForGuess */
export function ruaScoreForDistance(
  km: number,
  difficulty: Difficulty,
): number {
  return ruaScoreForGuess(km, difficulty, true);
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km).toLocaleString("pt-BR")} km`;
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

export function dealRuaRun(difficulty: Difficulty, size = RUN_SIZE): CityGeo[] {
  const pool = citiesGeoForDifficulty(difficulty);
  return shuffle(pool).slice(0, Math.min(size, pool.length));
}
