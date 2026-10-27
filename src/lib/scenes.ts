import type { CityId } from "@/lib/types";

export type SceneConfig = {
  background: string;
  crowdCount: number;
  flavinhoScale: number;
  ground: { yMin: number; yMax: number; xMin?: number; xMax?: number };
};

/** Flat boards packed with original Flavinho disguise sprites. */
export const CITY_SCENES: Record<CityId, SceneConfig> = {
  rio: {
    background: "/game/scene-rio-flat.jpg",
    crowdCount: 40,
    flavinhoScale: 0.095,
    ground: { yMin: 8, yMax: 92, xMin: 5, xMax: 95 },
  },
  brasilia: {
    background: "/game/scene-brasilia-flat.jpg",
    crowdCount: 42,
    flavinhoScale: 0.092,
    ground: { yMin: 8, yMax: 92, xMin: 5, xMax: 95 },
  },
  saopaulo: {
    background: "/game/scene-sp-flat.jpg",
    crowdCount: 44,
    flavinhoScale: 0.09,
    ground: { yMin: 8, yMax: 92, xMin: 5, xMax: 95 },
  },
  miami: {
    background: "/game/scene-miami-flat.jpg",
    crowdCount: 42,
    flavinhoScale: 0.092,
    ground: { yMin: 8, yMax: 92, xMin: 5, xMax: 95 },
  },
  paris: {
    background: "/game/scene-paris-flat.jpg",
    crowdCount: 46,
    flavinhoScale: 0.088,
    ground: { yMin: 8, yMax: 92, xMin: 5, xMax: 95 },
  },
  dubai: {
    background: "/game/scene-dubai-flat.jpg",
    crowdCount: 46,
    flavinhoScale: 0.086,
    ground: { yMin: 8, yMax: 92, xMin: 5, xMax: 95 },
  },
};
