/**
 * Shared perspective contract for every city plate.
 *
 * All Waldo backgrounds must be drawn / cropped so the crowd stands
 * between yMin→yMax (percent of the board). Sprites use the same curve:
 *   y near horizon  → ~backRatio of front size
 *   y near bottom   → full front size
 *
 * Board aspect: prefer 16:10 desktop / 3:4 portrait crop of the same art.
 */

export const PERSPECTIVE = {
  /** Back of the walkable crowd (near vanishing / horizon). */
  yMin: 24,
  /** Front of the walkable crowd (closest to camera). */
  yMax: 90,
  xMin: 3,
  xMax: 97,
  /**
   * Size at the back relative to the front.
   * ~0.2 matches the drawn people shrinking toward the horizon.
   */
  backRatio: 0.2,
  frontRatio: 1,
  /** Tiny floor so sprites stay clickable / visible, without killing depth. */
  minWidthPct: 1.15,
  propMinWidthPct: 1.4,
} as const;

export type PerspectiveGround = {
  yMin: number;
  yMax: number;
  xMin?: number;
  xMax?: number;
};

export const PERSPECTIVE_GROUND: PerspectiveGround = {
  yMin: PERSPECTIVE.yMin,
  yMax: PERSPECTIVE.yMax,
  xMin: PERSPECTIVE.xMin,
  xMax: PERSPECTIVE.xMax,
};

/** 0 at horizon/back → 1 at foreground. */
export function depthT(
  y: number,
  yMin: number = PERSPECTIVE.yMin,
  yMax: number = PERSPECTIVE.yMax,
): number {
  if (yMax <= yMin) return 1;
  return Math.max(0, Math.min(1, (y - yMin) / (yMax - yMin)));
}

/**
 * Smoothstep keeps mid-ground from jumping in size.
 * Back sprites stay clearly smaller than front ones.
 */
export function depthRatio(
  y: number,
  yMin: number = PERSPECTIVE.yMin,
  yMax: number = PERSPECTIVE.yMax,
): number {
  const t = depthT(y, yMin, yMax);
  const eased = t * t * (3 - 2 * t);
  return (
    PERSPECTIVE.backRatio +
    (PERSPECTIVE.frontRatio - PERSPECTIVE.backRatio) * eased
  );
}

/** Absolute sprite scale factor for a given depth Y. */
export function scaleAtDepth(
  y: number,
  flavinhoScale: number,
  ground?: PerspectiveGround,
): number {
  const yMin: number = ground?.yMin ?? PERSPECTIVE.yMin;
  const yMax: number = ground?.yMax ?? PERSPECTIVE.yMax;
  return flavinhoScale * depthRatio(y, yMin, yMax);
}
