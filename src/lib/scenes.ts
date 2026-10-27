import type { CityId } from "@/lib/types";

export type SceneConfig = {
  background: string;
  crowdCount: number;
  flavinhoScale: number;
  ground: { yMin: number; yMax: number; xMin?: number; xMax?: number };
};

/** Flat top-down boards: characters sit anywhere without floating. */
export const CITY_SCENES: Record<CityId, SceneConfig> = {
  rio: {
    background: "/game/scene-rio-flat.jpg",
    crowdCount: 55,
    flavinhoScale: 0.09,
    ground: { yMin: 10, yMax: 90, xMin: 6, xMax: 94 },
  },
  brasilia: {
    background: "/game/scene-brasilia-flat.jpg",
    crowdCount: 58,
    flavinhoScale: 0.088,
    ground: { yMin: 10, yMax: 90, xMin: 6, xMax: 94 },
  },
  saopaulo: {
    background: "/game/scene-sp-flat.jpg",
    crowdCount: 60,
    flavinhoScale: 0.086,
    ground: { yMin: 10, yMax: 90, xMin: 6, xMax: 94 },
  },
  miami: {
    background: "/game/scene-miami-flat.jpg",
    crowdCount: 58,
    flavinhoScale: 0.088,
    ground: { yMin: 10, yMax: 90, xMin: 6, xMax: 94 },
  },
  paris: {
    background: "/game/scene-paris-flat.jpg",
    crowdCount: 62,
    flavinhoScale: 0.085,
    ground: { yMin: 10, yMax: 90, xMin: 6, xMax: 94 },
  },
  dubai: {
    background: "/game/scene-dubai-flat.jpg",
    crowdCount: 64,
    flavinhoScale: 0.084,
    ground: { yMin: 10, yMax: 90, xMin: 6, xMax: 94 },
  },
};
