import {
  CITY_CATALOG,
  type CityId,
  type SceneKey,
} from "@/lib/city-catalog";
import { BOARD_GROUND } from "@/lib/crowd";

export type SceneConfig = {
  /** Legacy field — find board no longer paints city plates. */
  background: string;
  crowdCount: number;
  flavinhoScale: number;
  ground: { yMin: number; yMax: number; xMin?: number; xMax?: number };
};

function scene(
  background: string,
  crowdCount: number,
  flavinhoScale: number,
): SceneConfig {
  return {
    background,
    crowdCount,
    flavinhoScale,
    ground: { ...BOARD_GROUND },
  };
}

/**
 * Counts/scales here are legacy defaults — GameApp overrides with
 * crowdParamsFor(difficulty). Background kept only for landing art refs.
 */
const SCENE_BY_KEY: Record<SceneKey, SceneConfig> = {
  rio: scene("/game/scene-rio-flat.jpg", 64, 0.082),
  miami: scene("/game/scene-miami-flat.jpg", 64, 0.082),
  paris: scene("/game/scene-paris-flat.jpg", 64, 0.082),
  plaza: scene("/game/scene-rio-flat.jpg", 64, 0.082),
  sp: scene("/game/scene-sp-flat.jpg", 64, 0.082),
  dubai: scene("/game/scene-dubai-flat.jpg", 64, 0.082),
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
