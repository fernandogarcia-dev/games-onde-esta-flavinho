import {
  CITY_CATALOG,
  type CityId,
  type SceneKey,
} from "@/lib/city-catalog";
import { PERSPECTIVE_GROUND } from "@/lib/perspective";

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
 * Waldo plates by visual family.
 * flavinhoScale is ~2× the previous desktop values so sprites match
 * background person height at feet yMax (see perspective.ts).
 *
 * Base counts sit near medium before GameApp ladder:
 * easy ~0.28x · medium ~0.78x · hard ~1.75x
 */
const SCENE_BY_KEY: Record<SceneKey, SceneConfig> = {
  rio: scene("/game/scene-rio-waldo.jpg", 64, 0.256),
  miami: scene("/game/scene-miami-waldo.jpg", 66, 0.252),
  paris: scene("/game/scene-paris-waldo.jpg", 72, 0.248),
  plaza: scene("/game/scene-plaza-waldo.jpg", 70, 0.244),
  sp: scene("/game/scene-sp-waldo.jpg", 70, 0.24),
  dubai: scene("/game/scene-dubai-waldo.jpg", 74, 0.236),
};

export function sceneForKey(key: SceneKey): SceneConfig {
  return SCENE_BY_KEY[key];
}

export function sceneForCity(cityId: CityId): SceneConfig {
  const hit = CITY_CATALOG.find((c) => c.id === cityId);
  return sceneForKey(hit?.sceneKey ?? "plaza");
}

/** @deprecated Prefer sceneForCity — kept for any leftover imports. */
export const CITY_SCENES: Record<string, SceneConfig> = Object.fromEntries(
  CITY_CATALOG.map((c) => [c.id, sceneForKey(c.sceneKey)]),
);
