import type { CityId } from "@/lib/types";

export type SceneConfig = {
  background: string;
  crowdCount: number;
  flavinhoScale: number;
  ground: { yMin: number; yMax: number; xMin?: number; xMax?: number };
};

const FLAT = {
  yMin: 8,
  yMax: 92,
  xMin: 5,
  xMax: 95,
};

function scene(
  background: string,
  crowdCount: number,
  flavinhoScale: number,
): SceneConfig {
  return { background, crowdCount, flavinhoScale, ground: { ...FLAT } };
}

/** Flat boards; new cities reuse closest existing art. */
export const CITY_SCENES: Record<CityId, SceneConfig> = {
  rio: scene("/game/scene-rio-flat.jpg", 40, 0.095),
  brasilia: scene("/game/scene-brasilia-flat.jpg", 42, 0.092),
  saopaulo: scene("/game/scene-sp-flat.jpg", 44, 0.09),
  miami: scene("/game/scene-miami-flat.jpg", 42, 0.092),
  paris: scene("/game/scene-paris-flat.jpg", 46, 0.088),
  dubai: scene("/game/scene-dubai-flat.jpg", 46, 0.086),
  salvador: scene("/game/scene-rio-flat.jpg", 40, 0.094),
  belohorizonte: scene("/game/scene-brasilia-flat.jpg", 42, 0.09),
  curitiba: scene("/game/scene-sp-flat.jpg", 44, 0.09),
  recife: scene("/game/scene-rio-flat.jpg", 41, 0.093),
  buenosaires: scene("/game/scene-paris-flat.jpg", 45, 0.088),
  lisboa: scene("/game/scene-paris-flat.jpg", 44, 0.089),
  londres: scene("/game/scene-sp-flat.jpg", 46, 0.087),
  novayork: scene("/game/scene-miami-flat.jpg", 48, 0.085),
  barcelona: scene("/game/scene-paris-flat.jpg", 45, 0.088),
  roma: scene("/game/scene-brasilia-flat.jpg", 44, 0.089),
  cancun: scene("/game/scene-miami-flat.jpg", 42, 0.093),
  toquio: scene("/game/scene-dubai-flat.jpg", 48, 0.084),
};
