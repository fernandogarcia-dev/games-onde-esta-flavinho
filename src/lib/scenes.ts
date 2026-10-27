import { PERSPECTIVE_GROUND } from "@/lib/perspective";
import type { CityId } from "@/lib/types";

export type SceneConfig = {
  background: string;
  crowdCount: number;
  /**
   * Front-row scale (at perspective yMax).
   * Back-row size is derived as front * PERSPECTIVE.backRatio (~0.2).
   */
  flavinhoScale: number;
  ground: { yMin: number; yMax: number; xMin?: number; xMax?: number };
};

/**
 * Every city plate must follow the shared PERSPECTIVE ground band
 * so sprite foreshortening matches the drawn crowd 100% of the time.
 */
function scene(
  background: string,
  crowdCount: number,
  flavinhoScale: number,
): SceneConfig {
  return {
    background,
    crowdCount,
    flavinhoScale,
    ground: { ...PERSPECTIVE_GROUND },
  };
}

/**
 * Perspective Waldo plates (authored ~16:9/16:10).
 * All share the same ground band from @/lib/perspective.
 *
 * Base counts sit near medium before GameApp ladder:
 * easy ~0.28x · medium ~0.78x · hard ~1.75x
 */
export const CITY_SCENES: Record<CityId, SceneConfig> = {
  // Beach / orla plates
  rio: scene("/game/scene-rio-waldo.jpg", 64, 0.11),
  salvador: scene("/game/scene-rio-waldo.jpg", 62, 0.11),
  recife: scene("/game/scene-rio-waldo.jpg", 64, 0.108),
  cancun: scene("/game/scene-miami-waldo.jpg", 64, 0.11),
  miami: scene("/game/scene-miami-waldo.jpg", 66, 0.108),

  // European / plaza plates
  paris: scene("/game/scene-paris-waldo.jpg", 72, 0.105),
  lisboa: scene("/game/scene-paris-waldo.jpg", 68, 0.106),
  barcelona: scene("/game/scene-paris-waldo.jpg", 70, 0.105),
  roma: scene("/game/scene-plaza-waldo.jpg", 68, 0.106),
  buenosaires: scene("/game/scene-plaza-waldo.jpg", 70, 0.105),
  londres: scene("/game/scene-plaza-waldo.jpg", 72, 0.104),

  // Big-city / modern plates
  saopaulo: scene("/game/scene-sp-waldo.jpg", 70, 0.104),
  novayork: scene("/game/scene-sp-waldo.jpg", 76, 0.1),
  curitiba: scene("/game/scene-sp-waldo.jpg", 66, 0.106),
  belohorizonte: scene("/game/scene-plaza-waldo.jpg", 64, 0.107),
  brasilia: scene("/game/scene-plaza-waldo.jpg", 66, 0.107),
  dubai: scene("/game/scene-dubai-waldo.jpg", 74, 0.1),
  toquio: scene("/game/scene-dubai-waldo.jpg", 76, 0.098),
};
