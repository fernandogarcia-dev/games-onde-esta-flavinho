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

/** Distance (km) where score hits ~0. Closer = harder map. */
export const RUA_ZERO_KM: Record<Difficulty, number> = {
  easy: 6000,
  medium: 4500,
  hard: 3000,
};

export function ruaScoreForDistance(
  km: number,
  difficulty: Difficulty,
): number {
  const max = RUA_SCORE_MAX[difficulty];
  const zero = RUA_ZERO_KM[difficulty];
  if (km <= 25) return max;
  if (km >= zero) return 0;
  const ratio = 1 - (km - 25) / (zero - 25);
  return Math.round(max * Math.max(0, ratio));
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
