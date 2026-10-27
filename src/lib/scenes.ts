import type { CityId } from "@/lib/types";

export type SceneConfig = {
  background: string;
  crowdCount: number;
  flavinhoScale: number;
  ground: { yMin: number; yMax: number; xMin?: number; xMax?: number };
};

/** Flat boards packed with Herald-style disguise mugshots. */
export const CITY_SCENES: Record<CityId, SceneConfig> = {
  rio: {
    background: "/game/scene-rio-flat.jpg",
    crowdCount: 42,
    flavinhoScale: 0.11,
    ground: { yMin: 8, yMax: 92, xMin: 5, xMax: 95 },
  },
  brasilia: {
    background: "/game/scene-brasilia-flat.jpg",
    crowdCount: 44,
    flavinhoScale: 0.108,
    ground: { yMin: 8, yMax: 92, xMin: 5, xMax: 95 },
  },
  saopaulo: {
    background: "/game/scene-sp-flat.jpg",
    crowdCount: 46,
    flavinhoScale: 0.105,
    ground: { yMin: 8, yMax: 92, xMin: 5, xMax: 95 },
  },
  miami: {
    background: "/game/scene-miami-flat.jpg",
    crowdCount: 44,
    flavinhoScale: 0.108,
    ground: { yMin: 8, yMax: 92, xMin: 5, xMax: 95 },
  },
  paris: {
    background: "/game/scene-paris-flat.jpg",
    crowdCount: 48,
    flavinhoScale: 0.102,
    ground: { yMin: 8, yMax: 92, xMin: 5, xMax: 95 },
  },
  dubai: {
    background: "/game/scene-dubai-flat.jpg",
    crowdCount: 48,
    flavinhoScale: 0.1,
    ground: { yMin: 8, yMax: 92, xMin: 5, xMax: 95 },
  },
};
