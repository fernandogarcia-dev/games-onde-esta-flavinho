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
 * Base counts are for medium. GameApp multiplies by difficulty.
 * Scale is intentionally small so hard mode can pack a sea of twins.
 */
export const CITY_SCENES: Record<CityId, SceneConfig> = {
  rio: scene("/game/scene-rio-waldo.jpg", 72, 0.058),
  brasilia: scene("/game/scene-plaza-waldo.jpg", 74, 0.056),
  saopaulo: scene("/game/scene-plaza-waldo.jpg", 78, 0.055),
  miami: scene("/game/scene-rio-waldo.jpg", 74, 0.056),
  paris: scene("/game/scene-plaza-waldo.jpg", 80, 0.054),
  dubai: scene("/game/scene-plaza-waldo.jpg", 82, 0.052),
  salvador: scene("/game/scene-rio-waldo.jpg", 70, 0.057),
  belohorizonte: scene("/game/scene-plaza-waldo.jpg", 72, 0.056),
  curitiba: scene("/game/scene-plaza-waldo.jpg", 74, 0.055),
  recife: scene("/game/scene-rio-waldo.jpg", 72, 0.056),
  buenosaires: scene("/game/scene-plaza-waldo.jpg", 78, 0.054),
  lisboa: scene("/game/scene-plaza-waldo.jpg", 76, 0.055),
  londres: scene("/game/scene-plaza-waldo.jpg", 80, 0.053),
  novayork: scene("/game/scene-plaza-waldo.jpg", 84, 0.052),
  barcelona: scene("/game/scene-plaza-waldo.jpg", 78, 0.054),
  roma: scene("/game/scene-plaza-waldo.jpg", 76, 0.055),
  cancun: scene("/game/scene-rio-waldo.jpg", 72, 0.057),
  toquio: scene("/game/scene-plaza-waldo.jpg", 84, 0.051),
};
