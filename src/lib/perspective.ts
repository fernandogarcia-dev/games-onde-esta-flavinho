/**
 * Shared perspective contract for every city plate.
 *
 * Plates are authored so walkable feet sit between yMin→yMax.
 * Sprite Y is the FEET position (anchor bottom-center), not the torso.
 *
 * Size follows a vanish-point model:
 *   scale ∝ (y - vanishY) / (yMax - vanishY)
 * so mid-ground shrinks smoothly instead of jumping in tiers.
 */

export const PERSPECTIVE = {
  /** Horizon / vanishing line (above the furthest feet). */
  vanishY: 16,
  /** Furthest walkable feet (back of plaza crowd). */
  yMin: 36,
  /** Closest walkable feet (foreground). */
  yMax: 93,
  xMin: 4,
  xMax: 96,
  /**
   * Soft clamp so the back never goes below this fraction of front size.
   * Vanish math usually lands ~0.27–0.35 on our plates.
   */
  backFloor: 0.26,
  /** Front reference = 1. */
  frontRatio: 1,
  /** Minimum rendered width (% of board) — keep tiny so depth survives. */
  minWidthPct: 0.95,
  propMinWidthPct: 1.1,
  /** Hard ceiling so a bad scale never covers the whole board. */
  maxWidthPct: 9.5,
  propMaxWidthPct: 8,
} as const;

export type PerspectiveGround = {
  yMin: number;
  yMax: number;
  xMin?: number;
  xMax?: number;
  /** Optional per-plate vanish override. */
  vanishY?: number;
};

export const PERSPECTIVE_GROUND: PerspectiveGround = {
  yMin: PERSPECTIVE.yMin,
  yMax: PERSPECTIVE.yMax,
  xMin: PERSPECTIVE.xMin,
  xMax: PERSPECTIVE.xMax,
  vanishY: PERSPECTIVE.vanishY,
};

/** 0 at back feet → 1 at front feet. */
export function depthT(
  y: number,
  yMin: number = PERSPECTIVE.yMin,
  yMax: number = PERSPECTIVE.yMax,
): number {
  if (yMax <= yMin) return 1;
  return Math.max(0, Math.min(1, (y - yMin) / (yMax - yMin)));
}

/**
 * Vanish-point foreshortening in screen space.
 * Linear in distance-from-horizon → smooth sizes, no tier jumps.
 */
export function depthRatio(
  y: number,
  yMin: number = PERSPECTIVE.yMin,
  yMax: number = PERSPECTIVE.yMax,
  vanishY: number = PERSPECTIVE.vanishY,
): number {
  const frontDist = Math.max(1, yMax - vanishY);
  const raw = (y - vanishY) / frontDist;
  const atBack = (yMin - vanishY) / frontDist;
  // Normalize so front = 1 and back ≈ backFloor (stable across plates).
  const norm = (raw - atBack) / Math.max(0.0001, 1 - atBack);
  const t = Math.max(0, Math.min(1, norm));
  return PERSPECTIVE.backFloor + (PERSPECTIVE.frontRatio - PERSPECTIVE.backFloor) * t;
}

/** Absolute sprite scale for feet at Y. */
export function scaleAtDepth(
  y: number,
  flavinhoScale: number,
  ground?: PerspectiveGround,
): number {
  const yMin: number = ground?.yMin ?? PERSPECTIVE.yMin;
  const yMax: number = ground?.yMax ?? PERSPECTIVE.yMax;
  const vanishY: number = ground?.vanishY ?? PERSPECTIVE.vanishY;
  return flavinhoScale * depthRatio(y, yMin, yMax, vanishY);
}
