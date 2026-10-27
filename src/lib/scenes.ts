import type { CityId } from "@/lib/types";

export type SceneConfig = {
  background: string;
  crowdCount: number;
  flavinhoScale: number;
  ground: { yMin: number; yMax: number; xMin?: number; xMax?: number };
};

/**
 * Wider band + tighter insets so Waldo packing can fill the board.
 * Sprites are smaller now, so they still stay inside.
 */
const WALDO = {
  yMin: 12,
  yMax: 90,
  xMin: 4,
  xMax: 96,
};

function scene(
  background: string,
  crowdCount: number,
  flavinhoScale: number,
): SceneConfig {
  return { background, crowdCount, flavinhoScale, ground: { ...WALDO } };
}

/**
 * Base counts sit near medium before GameApp applies the ladder:
 * easy ~0.28x, medium ~0.78x, hard ~1.75x.
 */
export const CITY_SCENES: Record<CityId, SceneConfig> = {
  rio: scene("/game/scene-rio-waldo.jpg", 64, 0.062),
  brasilia: scene("/game/scene-plaza-waldo.jpg", 66, 0.06),
  saopaulo: scene("/game/scene-plaza-waldo.jpg", 70, 0.058),
  miami: scene("/game/scene-rio-waldo.jpg", 66, 0.06),
  paris: scene("/game/scene-plaza-waldo.jpg", 72, 0.057),
  dubai: scene("/game/scene-plaza-waldo.jpg", 74, 0.055),
  salvador: scene("/game/scene-rio-waldo.jpg", 62, 0.061),
  belohorizonte: scene("/game/scene-plaza-waldo.jpg", 64, 0.06),
  curitiba: scene("/game/scene-plaza-waldo.jpg", 66, 0.059),
  recife: scene("/game/scene-rio-waldo.jpg", 64, 0.06),
  buenosaires: scene("/game/scene-plaza-waldo.jpg", 70, 0.057),
  lisboa: scene("/game/scene-plaza-waldo.jpg", 68, 0.058),
  londres: scene("/game/scene-plaza-waldo.jpg", 72, 0.056),
  novayork: scene("/game/scene-plaza-waldo.jpg", 76, 0.054),
  barcelona: scene("/game/scene-plaza-waldo.jpg", 70, 0.057),
  roma: scene("/game/scene-plaza-waldo.jpg", 68, 0.058),
  cancun: scene("/game/scene-rio-waldo.jpg", 64, 0.061),
  toquio: scene("/game/scene-plaza-waldo.jpg", 76, 0.053),
};
